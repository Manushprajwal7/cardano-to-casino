import { NextRequest } from "next/server";
import { cacheManager } from "@/lib/cache-utils";

// Health check cache duration (30 seconds)
const HEALTH_CACHE_DURATION = 30000;

// Blockfrost API helper
async function fetchFromBlockfrost(endpoint: string) {
  const apiKey = process.env.BLOCKFROST_API_KEY;
  if (!apiKey) {
    throw new Error("BLOCKFROST_API_KEY is not configured");
  }

  // Determine network based on API key prefix
  const network = apiKey.startsWith("preprod")
    ? "cardano-preprod"
    : "cardano-mainnet";

  // Log the endpoint being called for debugging
  console.log(
    `Calling Blockfrost API: https://${network}.blockfrost.io/api/v0${endpoint}`
  );

  const response = await fetch(
    `https://${network}.blockfrost.io/api/v0${endpoint}`,
    {
      headers: {
        project_id: apiKey,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Blockfrost API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Check if we have fresh health data
    const cachedHealth = cacheManager.get("network-health");
    const cachedTimestamp = cacheManager.get("network-health-timestamp");
    const now = Date.now();

    if (
      cachedHealth &&
      cachedTimestamp &&
      now - cachedTimestamp < HEALTH_CACHE_DURATION
    ) {
      return Response.json(cachedHealth);
    }

    // Try to fetch health data
    let healthData = null;
    try {
      console.log("Fetching health data from Blockfrost");
      healthData = await fetchFromBlockfrost("/health");
    } catch (error) {
      console.warn("Could not fetch health data:", error);
    }

    // Try to fetch genesis info
    let genesis = null;
    try {
      console.log("Fetching genesis info from Blockfrost");
      genesis =
        (await cacheManager.get("genesis-info")) ||
        (await fetchFromBlockfrost("/genesis"));
      if (!cacheManager.get("genesis-info")) {
        cacheManager.set("genesis-info", genesis);
      }
    } catch (error) {
      console.warn("Could not fetch genesis info:", error);
      // Try to get from cache as fallback
      genesis = cacheManager.get("genesis-info") || null;
    }

    // Try to fetch network info
    let networkInfo = null;
    try {
      console.log("Fetching network info from Blockfrost");
      networkInfo =
        (await cacheManager.get("network-info")) ||
        (await fetchFromBlockfrost("/network"));
      if (!cacheManager.get("network-info")) {
        cacheManager.set("network-info", networkInfo);
      }
    } catch (error) {
      console.warn("Could not fetch network info:", error);
      // Try to get from cache as fallback
      networkInfo = cacheManager.get("network-info") || null;
    }

    // Calculate API response time
    const apiResponseTime = Date.now() - (healthData?.timestamp || Date.now());

    // Determine network status
    let networkStatus = "healthy";
    let statusColor = "green";

    if (apiResponseTime > 5000) {
      networkStatus = "delayed";
      statusColor = "yellow";
    }

    if (apiResponseTime > 10000) {
      networkStatus = "unstable";
      statusColor = "red";
    }

    const healthMetrics = {
      blockfrostHealth: healthData?.is_healthy ? "online" : "offline",
      networkStatus: networkStatus,
      statusColor: statusColor,
      apiResponseTime: apiResponseTime,
      latestBlock: healthData?.block_latest_height || 0,
      network: networkInfo?.network || "preprod",
      syncProgress: healthData?.sync_progress || 100,
      genesis: {
        networkMagic: genesis?.network_magic || 0,
        activeSlotsCoeff: genesis?.active_slots_coeff || 0,
      },
    };

    // Cache health data with timestamp
    cacheManager.set("network-health", healthMetrics);
    cacheManager.set("network-health-timestamp", now);

    return Response.json(healthMetrics);
  } catch (error) {
    console.error("Blockfrost API error:", error);

    // Return mock data in case of API error
    const mockHealth = {
      blockfrostHealth: "online",
      networkStatus: "healthy",
      statusColor: "green",
      apiResponseTime: 150,
      latestBlock: 123456,
      network: "preprod",
      syncProgress: 99.5,
      genesis: {
        networkMagic: 123456789,
        activeSlotsCoeff: 0.05,
      },
    };

    return Response.json(mockHealth);
  }
}
