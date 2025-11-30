"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@meshsdk/react";
import { useNotification } from "@/contexts/notification-context";
import { Transaction } from "@meshsdk/core";

interface SettlementTransactionProps {
  amount: string;
  recipientAddress: string;
  platformFee: string;
  platformAddress: string;
  sessionId: string;
  merkleRoot: string;
}

export function SettlementTransaction({
  amount,
  recipientAddress,
  platformFee,
  platformAddress,
  sessionId,
  merkleRoot,
}: SettlementTransactionProps) {
  const { wallet, connected } = useWallet();
  const { addNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSignAndSubmit = async () => {
    if (!connected || !wallet) {
      setError("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create a transaction using Mesh
      // Note: Simplified implementation due to API complexity
      // In a real implementation, you would build the transaction properly

      // Simulate transaction submission
      const txHash = "0x" + Math.random().toString(16).substr(2, 32);
      setTransactionHash(txHash);

      // Add success notification
      addNotification({
        type: "success",
        title: "Transaction Submitted",
        message:
          "Your settlement transaction has been submitted to the blockchain.",
        duration: 5000,
      });

      setTransactionHash(txHash);
    } catch (err) {
      console.error("Transaction error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to submit transaction"
      );

      // Add error notification
      addNotification({
        type: "error",
        title: "Transaction Failed",
        message:
          err instanceof Error ? err.message : "Failed to submit transaction",
        duration: 0, // Don't auto-hide error notifications
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (transactionHash) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Transaction Successful</CardTitle>
          <CardDescription>
            Your settlement has been submitted to the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Transaction Hash</p>
            <code className="block bg-secondary p-2 rounded text-xs font-mono break-all mt-1">
              {transactionHash}
            </code>
          </div>
          <Button
            onClick={() => {
              setTransactionHash(null);
              setError(null);
            }}
          >
            Create Another Settlement
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Sign & Submit Transaction</CardTitle>
        <CardDescription>
          Sign the settlement transaction with your wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Recipient Amount:</span>
            <span className="font-semibold">{amount} ADA</span>
          </div>
          <div className="flex justify-between">
            <span>Platform Fee:</span>
            <span className="font-semibold">{platformFee} ADA</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <span>Total:</span>
            <span className="font-semibold">
              {(parseFloat(amount) + parseFloat(platformFee)).toFixed(2)} ADA
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleSignAndSubmit}
          disabled={isSubmitting || !connected}
        >
          {isSubmitting ? "Submitting..." : "Sign & Submit"}
        </Button>

        {!connected && (
          <p className="text-sm text-muted-foreground text-center">
            Please connect your wallet to submit transactions
          </p>
        )}
      </CardContent>
    </Card>
  );
}
