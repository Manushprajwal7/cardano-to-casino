"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap, CheckCircle2, Clock } from "lucide-react";

interface Transaction {
  id: string;
  hash: string;
  amount: number;
  status: "mempool" | "confirming" | "confirmed";
  timestamp: number;
}

export function BlockchainVisualizer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [blockHeight, setBlockHeight] = useState(9234567);

  // Simulate real-time transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        hash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        amount: Math.random() * 1000 + 10,
        status: "mempool",
        timestamp: Date.now(),
      };

      setTransactions((prev) => {
        const updated = [newTx, ...prev.slice(0, 9)];
        
        return updated.map((tx) => {
          if (tx.status === "mempool" && Date.now() - tx.timestamp > 2000) {
            return { ...tx, status: "confirming" };
          }
          if (tx.status === "confirming" && Date.now() - tx.timestamp > 4000) {
            setBlockHeight((h) => h + 1);
            return { ...tx, status: "confirmed" };
          }
          return tx;
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "mempool":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "confirming":
        return <Zap className="w-4 h-4 text-blue-400 animate-pulse" />;
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "mempool":
        return "border-yellow-400/30 bg-yellow-400/5";
      case "confirming":
        return "border-blue-400/30 bg-blue-400/5";
      case "confirmed":
        return "border-green-400/30 bg-green-400/5";
    }
  };


  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="border-b border-green-500/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 neon-green" />
              <span className="neon-green">Live Blockchain Activity</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Real-time transaction flow visualization
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-sm text-muted-foreground">Block Height</div>
            <div className="text-2xl font-bold neon-green animate-pulse-glow">
              #{blockHeight.toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Transaction Stream */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg border ${getStatusColor(
                  tx.status
                )} backdrop-blur-sm transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="animate-pulse-glow">{getStatusIcon(tx.status)}</div>
                    <div>
                      <div className="font-mono text-sm">{tx.hash}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {tx.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      ₳{tx.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.floor((Date.now() - tx.timestamp) / 1000)}s ago
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-green-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold neon-green">
              {transactions.filter((t) => t.status === "mempool").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">In Mempool</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {transactions.filter((t) => t.status === "confirming").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Confirming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {transactions.filter((t) => t.status === "confirmed").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Confirmed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
