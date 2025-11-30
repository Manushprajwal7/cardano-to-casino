import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BLOCKFROST_API_KEY;
    if (!apiKey) {
      throw new Error("BLOCKFROST_API_KEY is not configured");
    }

    // Determine network based on API key prefix
    const network = apiKey.startsWith("preprod")
      ? "cardano-preprod"
      : "cardano-mainnet";

    console.log(`Testing Blockfrost API connection to ${network}`);

    // Test multiple endpoints
    const endpoints = [
      "/network",
      "/blocks/latest",
      "/epochs/latest",
      "/txs",
      "/health",
    ];

    const results: any = {};

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await fetch(
          `https://${network}.blockfrost.io/api/v0${endpoint}`,
          {
            headers: {
              project_id: apiKey,
            },
          }
        );

        console.log(`Response status for ${endpoint}: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Blockfrost API error for ${endpoint}: ${response.status} - ${errorText}`
          );
          results[endpoint] = {
            success: false,
            error: `Status ${response.status} - ${errorText}`,
          };
        } else {
          const data = await response.json();
          console.log(
            `Successfully fetched data for ${endpoint}:`,
            JSON.stringify(data).substring(0, 100) + "..."
          );
          results[endpoint] = {
            success: true,
            data: data,
          };
        }
      } catch (error) {
        console.error(`Error testing ${endpoint}:`, error);
        results[endpoint] = {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      }
    }

    return Response.json({
      success: true,
      results: results,
      network: network,
    });
  } catch (error) {
    console.error("Blockfrost test error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
