"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { SettlementChart } from "@/components/dashboard/settlement-chart";
import { FeesChart } from "@/components/dashboard/fees-chart";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";
import { SystemStatusWidgets } from "@/components/dashboard/system-status";
import { MempoolFeed } from "@/components/dashboard/mempool-feed";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useBlockfrostData } from "@/hooks/use-blockfrost-data";

export default function DashboardPage() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch data from our API endpoints
  const {
    data: transactions,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useBlockfrostData("transactions");
  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useBlockfrostData("metrics");
  const {
    data: health,
    loading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useBlockfrostData("health");

  const handleManualRefresh = () => {
    refetchTransactions();
    refetchMetrics();
    refetchHealth();
    setLastUpdated(new Date());
  };

  // Format metrics for display
  const formattedMetrics = {
    totalAdaSettled: metrics?.adaVolume24h
      ? (metrics.adaVolume24h / 1000000).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })
      : "54,321", // Default mock value
    platformFees:
      metrics?.platformFees?.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      }) || "75", // Default mock value
    pendingSettlements: "23", // This would come from actual data
    activeSessions: "156", // This would come from actual data
    avgConfirmationTime: metrics?.avgConfirmationTime || 20, // Default mock value
    totalSettlements: metrics?.totalSettlements?.toLocaleString() || "123,456", // Default mock value
  };

  // Determine confirmation time status
  const confirmationTimeStatus =
    formattedMetrics.avgConfirmationTime < 20
      ? "fast"
      : formattedMetrics.avgConfirmationTime < 40
      ? "medium"
      : "slow";
  const confirmationTimeLabel =
    confirmationTimeStatus === "fast"
      ? "Fast"
      : confirmationTimeStatus === "medium"
      ? "Normal"
      : "Slow";
  const confirmationTimeTrend =
    confirmationTimeStatus === "fast"
      ? "up"
      : confirmationTimeStatus === "slow"
      ? "down"
      : "down";

  return (
    <ProtectedRoute>
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-8">
          {/* Header with refresh button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Cardano Casino Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time blockchain activity and settlement metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <Button onClick={handleManualRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Total ADA Settled (24h)"
              value={`${formattedMetrics.totalAdaSettled}`}
              change="+5.2%"
              trend="up"
            />
            <KpiCard
              label="Platform Fees (24h)"
              value={`${formattedMetrics.platformFees}`}
              change="+3.8%"
              trend="up"
            />
            <KpiCard
              label="Avg Confirmation Time"
              value={`${formattedMetrics.avgConfirmationTime}s`}
              change={confirmationTimeLabel}
              trend={confirmationTimeTrend}
            />
            <KpiCard
              label="Total Settlements"
              value={formattedMetrics.totalSettlements}
              change="+12.5%"
              trend="up"
            />
          </div>

          {/* Charts and Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettlementChart />
                <FeesChart />
              </div>
              <RecentActivityTable transactions={transactions} />
            </div>
            <div className="space-y-4">
              <MempoolFeed />
              <SystemStatusWidgets healthData={health} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
