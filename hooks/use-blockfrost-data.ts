import { useState, useEffect } from "react";

interface BlockfrostData {
  data: any;
  loading: boolean;
  error: string | null;
}

export function useBlockfrostData(
  endpoint: string,
  refreshInterval: number = 15000
) {
  const [data, setData] = useState<BlockfrostData>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      // Map specific endpoints to their dedicated API routes
      let apiUrl = "";
      switch (endpoint) {
        case "transactions":
          apiUrl = "/api/blockfrost/transactions";
          break;
        case "metrics":
          apiUrl = "/api/blockfrost/metrics";
          break;
        case "health":
          apiUrl = "/api/blockfrost/health";
          break;
        default:
          // For other endpoints, use the generic route with query parameter
          apiUrl = `/api/blockfrost?endpoint=${encodeURIComponent(endpoint)}`;
      }

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const result = await response.json();
      setData({
        data: result,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData({
        data: null,
        loading: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchData();

    // Set up interval for refreshing data
    const interval = setInterval(fetchData, refreshInterval);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [endpoint, refreshInterval]);

  return {
    ...data,
    refetch: fetchData,
  };
}
