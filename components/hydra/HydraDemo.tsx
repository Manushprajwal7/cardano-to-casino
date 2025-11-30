/**
 * Hydra Demo Component
 *
 * This component demonstrates how to use the Hydra integration
 * in a React application.
 */

"use client";

import { useState, useEffect } from "react";
import { useHydra } from "@/hooks/use-hydra";
import { useWallet } from "@meshsdk/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet } from "@meshsdk/core";

export function HydraDemo() {
  const { wallet } = useWallet();
  const hydra = useHydra({
    host: "localhost",
    port: 4000,
    networkId: 0, // Preprod
    autoRefreshInterval: 5000, // Refresh every 5 seconds
  });

  const [utxos, setUtxos] = useState<any[]>([]);
  const [transactionResult, setTransactionResult] = useState<string | null>(
    null
  );

  // Connect to Hydra when component mounts
  useEffect(() => {
    hydra.connect();
  }, [hydra]);

  // Load wallet UTxOs
  useEffect(() => {
    if (wallet) {
      wallet.getUtxos().then(setUtxos).catch(console.error);
    }
  }, [wallet]);

  const handleCommitUtxos = async () => {
    if (!wallet || utxos.length === 0) return;

    try {
      // Cast to Wallet type to satisfy TypeScript
      const commits = await hydra.commitUtxos(
        utxos.slice(0, 1),
        wallet as unknown as Wallet
      );
      console.log("Committed UTxOs:", commits);
    } catch (error) {
      console.error("Failed to commit UTxOs:", error);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!wallet || utxos.length === 0) return;

    try {
      // This is a simplified example - in practice you'd build a real transaction
      const txId = await hydra.submitTransaction(
        {} as any, // Lucid instance
        utxos.slice(0, 1), // Inputs
        [
          {
            address: await wallet.getChangeAddress(),
            value: { lovelace: "1000000" }, // Using string instead of BigInt
          },
        ] // Outputs
      );
      setTransactionResult(txId);
    } catch (error) {
      console.error("Failed to submit transaction:", error);
    }
  };

  const handleCloseHead = async () => {
    try {
      await hydra.close();
      console.log("Hydra head closed");
    } catch (error) {
      console.error("Failed to close Hydra head:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hydra Integration Demo</CardTitle>
        <CardDescription>
          Demonstration of Hydra head protocol integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Connection Status:</span>
            <Badge variant={hydra.isConnected ? "default" : "destructive"}>
              {hydra.isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Head Status:</span>
            <Badge variant={hydra.isReady ? "default" : "secondary"}>
              {hydra.isReady ? "Ready" : "Not Ready"}
            </Badge>
          </div>
        </div>

        {hydra.error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
            Error: {hydra.error}
          </div>
        )}

        {hydra.status && (
          <div className="p-3 bg-muted rounded-md">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(hydra.status, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleCommitUtxos}
            disabled={!hydra.isConnected || !wallet || utxos.length === 0}
          >
            Commit UTxOs
          </Button>

          <Button
            onClick={handleSubmitTransaction}
            disabled={!hydra.isConnected || !wallet || utxos.length === 0}
          >
            Submit Transaction
          </Button>

          <Button
            onClick={handleCloseHead}
            variant="destructive"
            disabled={!hydra.isConnected}
          >
            Close Head
          </Button>
        </div>

        {transactionResult && (
          <div className="p-3 bg-green-500/10 text-green-500 text-sm rounded-md">
            Transaction submitted: {transactionResult}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>UTxOs available: {utxos.length}</p>
          <p>Wallet connected: {wallet ? "Yes" : "No"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
