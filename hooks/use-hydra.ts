/**
 * React Hook for Hydra Integration
 *
 * This hook provides a simple interface for interacting with Hydra heads
 * in React components.
 */

import { useState, useEffect, useCallback } from "react";
import {
  initHydraConfig,
  buildHydraTransaction,
  submitHydraTransaction,
  commitToHydra,
  contestTransaction,
  closeHydraHead,
  getHydraHeadStatus,
} from "@/lib/hydra-utils";
import { Wallet } from "@meshsdk/core";
import { Lucid, UTxO, Address, Datum } from "@lucid-evolution/lucid";

interface HydraHookOptions {
  host?: string;
  port?: number;
  networkId?: number;
  autoRefreshInterval?: number; // in milliseconds
}

interface HydraState {
  isConnected: boolean;
  isReady: boolean;
  status: any;
  error: string | null;
}

export function useHydra(options?: HydraHookOptions) {
  const [state, setState] = useState<HydraState>({
    isConnected: false,
    isReady: false,
    status: null,
    error: null,
  });

  const [config] = useState(() =>
    initHydraConfig({
      host: options?.host,
      port: options?.port,
      networkId: options?.networkId,
    })
  );

  // Refresh status periodically if autoRefreshInterval is set
  useEffect(() => {
    if (!options?.autoRefreshInterval) return;

    const interval = setInterval(async () => {
      try {
        const status = await getHydraHeadStatus(config.host, config.port);
        setState((prev) => ({ ...prev, status, isConnected: true }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : "Unknown error",
          isConnected: false,
        }));
      }
    }, options.autoRefreshInterval);

    return () => clearInterval(interval);
  }, [config.host, config.port, options?.autoRefreshInterval]);

  // Initialize connection
  const connect = useCallback(async () => {
    try {
      const status = await getHydraHeadStatus(config.host, config.port);
      setState({
        isConnected: true,
        isReady: status.state === "Open",
        status,
        error: null,
      });
    } catch (error) {
      setState({
        isConnected: false,
        isReady: false,
        status: null,
        error:
          error instanceof Error
            ? error.message
            : "Failed to connect to Hydra head",
      });
    }
  }, [config]);

  // Build and submit transaction
  const submitTransaction = useCallback(
    async (
      lucid: typeof Lucid,
      inputs: UTxO[],
      outputs: { address: Address; value: any; datum?: Datum }[],
      options?: {
        mint?: any[];
        validFrom?: number;
        validTo?: number;
      }
    ) => {
      try {
        const transaction = await buildHydraTransaction(
          lucid,
          inputs,
          outputs,
          options
        );
        const txId = await submitHydraTransaction(
          transaction,
          config.host,
          config.port
        );
        return txId;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to submit transaction",
        }));
        throw error;
      }
    },
    [config]
  );

  // Commit UTxOs
  const commitUtxos = useCallback(
    async (utxos: UTxO[], wallet: Wallet) => {
      try {
        const commits = await commitToHydra(
          utxos,
          wallet,
          config.host,
          config.port
        );
        return commits;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to commit UTxOs",
        }));
        throw error;
      }
    },
    [config]
  );

  // Contest transaction
  const contest = useCallback(
    async (transaction: any, wallet: Wallet) => {
      try {
        const contestation = await contestTransaction(
          transaction,
          wallet,
          config.host,
          config.port
        );
        return contestation;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : "Failed to contest transaction",
        }));
        throw error;
      }
    },
    [config]
  );

  // Close Hydra head
  const close = useCallback(async () => {
    try {
      await closeHydraHead(config.host, config.port);
      setState((prev) => ({ ...prev, isReady: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to close Hydra head",
      }));
      throw error;
    }
  }, [config]);

  // Refresh status manually
  const refreshStatus = useCallback(async () => {
    try {
      const status = await getHydraHeadStatus(config.host, config.port);
      setState((prev) => ({ ...prev, status, isConnected: true }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to refresh status",
      }));
    }
  }, [config]);

  return {
    ...state,
    connect,
    submitTransaction,
    commitUtxos,
    contest,
    close,
    refreshStatus,
    config,
  };
}
