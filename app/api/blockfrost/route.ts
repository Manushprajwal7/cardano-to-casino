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
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  try {
    let data;

    switch (endpoint) {
      case "latest-txs":
        data =
          (await cacheManager.get("latest-txs")) ||
          (await (async () => {
            const result = await fetchFromBlockfrost("/txs");
            cacheManager.set("latest-txs", result);
            return result;
          })());
        break;

      case "metrics":
        // Combine multiple metrics
        const cachedMetrics = await cacheManager.get("metrics");
        if (cachedMetrics) {
          data = cachedMetrics;
        } else {
          const [blocks, epochs, networkStats] = await Promise.all([
            cacheManager.get("latest-block") ||
              (await (async () => {
                const result = await fetchFromBlockfrost("/blocks/latest");
                cacheManager.set("latest-block", result);
                return result;
              })()),
            cacheManager.get("latest-epoch") ||
              (await (async () => {
                const result = await fetchFromBlockfrost("/epochs/latest");
                cacheManager.set("latest-epoch", result);
                return result;
              })()),
            cacheManager.get("network-stats") ||
              (await (async () => {
                const result = await fetchFromBlockfrost("/network/stats");
                cacheManager.set("network-stats", result);
                return result;
              })()),
          ]);

          data = {
            latestBlock: blocks,
            latestEpoch: epochs,
            networkStats: networkStats,
          };

          cacheManager.set("metrics", data);
        }
        break;

      case "network-health":
        data =
          (await cacheManager.get("network-health")) ||
          (await (async () => {
            const result = await fetchFromBlockfrost("/health");
            cacheManager.set("network-health", result);
            return result;
          })());
        break;

      case "ada-volume":
        data =
          (await cacheManager.get("ada-volume")) ||
          (await (async () => {
            const result = await fetchFromBlockfrost("/blocks/latest");
            cacheManager.set("ada-volume", result);
            return result;
          })());
        break;

      default:
        // If no specific endpoint matched, try to fetch directly from Blockfrost
        if (endpoint) {
          // Make sure endpoint starts with /
          const formattedEndpoint = endpoint.startsWith("/")
            ? endpoint
            : `/${endpoint}`;
          data = await fetchFromBlockfrost(formattedEndpoint);
        } else {
          return Response.json({ error: "Invalid endpoint" }, { status: 400 });
        }
    }

    return Response.json(data);
  } catch (error) {
    console.error("Blockfrost API error:", error);

    // Return mock data in case of API error
    const mockData = {
      error: "Failed to fetch data from Blockfrost, using mock data",
      mock: true,
    };

    return Response.json(mockData);
  }
}
