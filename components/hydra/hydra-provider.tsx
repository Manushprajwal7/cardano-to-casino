"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useHydra } from "@/hooks/use-hydra";

interface HydraContextType {
  isConnected: boolean;
  isReady: boolean;
  status: any;
  error: string | null;
  connect: () => Promise<void>;
  submitTransaction: (
    lucid: any,
    inputs: any[],
    outputs: any[],
    options?: any
  ) => Promise<string>;
  commitUtxos: (utxos: any[], wallet: any) => Promise<any[]>;
  contest: (transaction: any, wallet: any) => Promise<any>;
  close: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  config: any;
}

const HydraContext = createContext<HydraContextType | undefined>(undefined);

export function HydraProvider({ children }: { children: ReactNode }) {
  const hydra = useHydra({
    host: "localhost",
    port: 4000,
    networkId: 0, // Preprod
    autoRefreshInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <HydraContext.Provider value={hydra}>{children}</HydraContext.Provider>
  );
}

export function useHydraContext() {
  const context = useContext(HydraContext);
  if (context === undefined) {
    throw new Error("useHydraContext must be used within a HydraProvider");
  }
  return context;
}
