import { NextRequest } from "next/server";
import { cacheManager } from "@/lib/cache-utils";

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
    // Check cache first
    const cachedMetrics = await cacheManager.get("dashboard-metrics");
    const cachedTimestamp = cacheManager.get("dashboard-metrics-timestamp");
    const now = Date.now();

    // Use cached data if it's less than 30 seconds old
    if (cachedMetrics && cachedTimestamp && now - cachedTimestamp < 30000) {
      return Response.json(cachedMetrics);
    }

    // Try to fetch network stats (this is more likely to work)
    let networkStats = null;
    try {
      console.log("Fetching network stats from Blockfrost");
      networkStats = await fetchFromBlockfrost("/network");
    } catch (error) {
      console.warn("Could not fetch network stats:", error);
    }

    // Try to fetch latest block info
    let latestBlock = null;
    try {
      console.log("Fetching latest block from Blockfrost");
      latestBlock = await fetchFromBlockfrost("/blocks/latest");
    } catch (error) {
      console.warn("Could not fetch latest block:", error);
    }

    // Try to fetch epoch info
    let epochInfo = null;
    try {
      console.log("Fetching epoch info from Blockfrost");
      epochInfo = await fetchFromBlockfrost("/epochs/latest");
    } catch (error) {
      console.warn("Could not fetch epoch info:", error);
    }

    // Calculate derived metrics
    // Use lovelace supply and convert to ADA (1 ADA = 1,000,000 lovelace)
    const adaVolume = networkStats?.supply?.lovelace
      ? parseInt(networkStats.supply.lovelace)
      : 0;

    const avgConfirmationTime = latestBlock ? 20 : 0; // Approximate based on slot leader

    // Mock fee calculation (in a real implementation, this would be calculated from actual transactions)
    const platformFees = Math.floor(Math.random() * 100) + 50; // Random value for demo

    const metrics = {
      totalSettlements: networkStats?.tx_count || 123456,
      adaVolume24h: adaVolume || 54321000000,
      avgConfirmationTime: avgConfirmationTime,
      platformFees: platformFees,
      currentEpoch: epochInfo?.epoch || 123,
      activeStake: epochInfo?.active_stake || 12345678901234,
    };

    // Cache the combined metrics with timestamp
    cacheManager.set("dashboard-metrics", metrics);
    cacheManager.set("dashboard-metrics-timestamp", now);

    return Response.json(metrics);
  } catch (error) {
    console.error("Blockfrost API error:", error);

    // Return mock data in case of API error
    const mockMetrics = {
      totalSettlements: 123456,
      adaVolume24h: 54321000000,
      avgConfirmationTime: 20,
      platformFees: 75,
      currentEpoch: 123,
      activeStake: 12345678901234,
    };

    return Response.json(mockMetrics);
  }
}
