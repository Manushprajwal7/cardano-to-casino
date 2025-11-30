"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Download,
  ExternalLink,
} from "lucide-react";

const revenueData = [
  { casino: "Casino A", revenue: 5200, fees: 520 },
  { casino: "Casino B", revenue: 3800, fees: 380 },
  { casino: "Casino C", revenue: 2800, fees: 280 },
  { casino: "Casino D", revenue: 4100, fees: 410 },
];

const alertsData = [
  {
    id: 1,
    type: "rate_limit",
    message: "Blockfrost API approaching rate limit",
    severity: "warning",
    timestamp: "2024-01-15 14:32",
  },
  {
    id: 2,
    type: "node_sync",
    message: "Cardano node sync lag detected (2.5 blocks)",
    severity: "info",
    timestamp: "2024-01-15 13:15",
  },
  {
    id: 3,
    type: "api_error",
    message: "3 failed API calls in last 5 minutes",
    severity: "error",
    timestamp: "2024-01-15 12:45",
  },
];

const disputeData = [
  {
    id: "DSP-001",
    casino: "Casino A",
    issue: "Settlement amount mismatch",
    status: "pending",
    date: "2024-01-15",
  },
  {
    id: "DSP-002",
    casino: "Casino B",
    issue: "Merkle root verification failed",
    status: "resolved",
    date: "2024-01-14",
  },
];

export default function AdminPage() {
  const [feePercentage, setFeePercentage] = useState(1.0);
  const [minFee, setMinFee] = useState(0.5);
  const [maxFee, setMaxFee] = useState(100.0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // Blockfrost monitoring states
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [utxoData, setUtxoData] = useState<any[]>([]);
  const [validatorData, setValidatorData] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [isLoadingUtxos, setIsLoadingUtxos] = useState(false);
  const [isLoadingValidators, setIsLoadingValidators] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [timeRange, setTimeRange] = useState("daily");

  // Fetch current fee configuration
  useEffect(() => {
    const fetchFeeConfig = async () => {
      try {
        const response = await fetch("/api/settlement-builder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "getFeeConfig",
          }),
        });

        if (response.ok) {
          const config = await response.json();
          setFeePercentage(config.feePercentage);
          setMinFee(config.minFee);
          setMaxFee(config.maxFee);
          setLastUpdated(config.lastUpdated);
        }
      } catch (error) {
        console.error("Failed to fetch fee configuration:", error);
      }
    };

    fetchFeeConfig();
  }, []);

  // Fetch Blockfrost monitoring data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingRevenue(true);
      setIsLoadingUtxos(true);
      setIsLoadingValidators(true);
      setIsLoadingWallet(true);

      try {
        // Fetch revenue data
        const revenueResponse = await fetch(
          "/api/admin/blockfrost?action=revenue"
        );
        if (revenueResponse.ok) {
          const revenue = await revenueResponse.json();
          setRevenueData(revenue);
        }

        // Fetch UTXO data
        const utxoResponse = await fetch("/api/admin/blockfrost?action=utxos");
        if (utxoResponse.ok) {
          const utxos = await utxoResponse.json();
          setUtxoData(utxos);
        }

        // Fetch validator data
        const validatorResponse = await fetch(
          "/api/admin/blockfrost?action=validators"
        );
        if (validatorResponse.ok) {
          const validators = await validatorResponse.json();
          setValidatorData(validators);
        }

        // Fetch wallet balance
        const walletResponse = await fetch(
          "/api/admin/blockfrost?action=wallet-balance"
        );
        if (walletResponse.ok) {
          const wallet = await walletResponse.json();
          setWalletBalance(wallet);
        }
      } catch (error) {
        console.error("Failed to fetch Blockfrost data:", error);
      } finally {
        setIsLoadingRevenue(false);
        setIsLoadingUtxos(false);
        setIsLoadingValidators(false);
        setIsLoadingWallet(false);
      }
    };

    fetchData();
  }, []);

  // Save fee configuration
  const saveFeeConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/settlement-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "updateFeeConfig",
          feePercentage: feePercentage,
          minFee: minFee,
          maxFee: maxFee,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setLastUpdated(result.config.lastUpdated);
        alert("Fee configuration updated successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to update fee configuration:", error);
      alert("Failed to update fee configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Platform management and configuration
          </p>
        </div>

        {/* Admin KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Revenue (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,900 ADA</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12.5% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Platform Fees (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">159.00 ADA</div>
              <p className="text-xs text-muted-foreground mt-1">At 1.0% rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Active Casinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                4 pending verification
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Open Disputes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">
                1 requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="wallet" key="wallet-tab">
              Platform Wallet
            </TabsTrigger>
            <TabsTrigger value="fees" key="fees-tab">
              Fee Configuration
            </TabsTrigger>
            <TabsTrigger value="revenue" key="revenue-tab">
              Revenue Dashboard
            </TabsTrigger>
            <TabsTrigger value="blockfrost" key="blockfrost-tab">
              Blockfrost Monitoring
            </TabsTrigger>
            <TabsTrigger value="system" key="system-tab">
              System Alerts
            </TabsTrigger>
          </TabsList>

          {/* Platform Wallet */}
          <TabsContent value="wallet" key="wallet-content">
            <Card>
              <CardHeader>
                <CardTitle>Platform Wallet</CardTitle>
                <CardDescription>
                  Main fee collection and settlement wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Wallet Address
                    </p>
                    <p className="font-mono text-sm break-all">
                      addr1qy3gvj3k2hz5k0l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Current Balance
                    </p>
                    <p className="text-2xl font-bold">8,450.75 ADA</p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-2">
                      Last Reward Epoch
                    </p>
                    <p className="font-mono text-sm">Epoch 425 (2024-01-15)</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Stake Pool Information
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pool ID:</span>
                      <span className="font-mono">
                        pool1qy3gvj3k2hz5k0l4m5n6o7p8q9r0s1t2
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Rewards (Last Epoch):
                      </span>
                      <span>12.45 ADA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Active Stake:
                      </span>
                      <span>8,400.00 ADA</span>
                    </div>
                  </div>
                </div>

                <Button>Manage Wallet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fee Configuration */}
          <TabsContent value="fees" key="fees-content">
            <Card>
              <CardHeader>
                <CardTitle>Fee Configuration</CardTitle>
                <CardDescription>Adjust platform fee settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Platform Fee Percentage (%)
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.1"
                        value={feePercentage}
                        onChange={(e) =>
                          setFeePercentage(Number.parseFloat(e.target.value))
                        }
                        className="max-w-32"
                      />
                      <span className="text-sm text-muted-foreground py-2">
                        Current: {feePercentage}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Applied to all settlements
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Minimum Fee (ADA)
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={minFee}
                        onChange={(e) =>
                          setMinFee(Number.parseFloat(e.target.value))
                        }
                        className="max-w-32"
                      />
                      <span className="text-sm text-muted-foreground py-2">
                        Current: {minFee} ADA
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Minimum fee for any settlement
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Maximum Fee (ADA)
                    </label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={maxFee}
                        onChange={(e) =>
                          setMaxFee(Number.parseFloat(e.target.value))
                        }
                        className="max-w-32"
                      />
                      <span className="text-sm text-muted-foreground py-2">
                        Current: {maxFee} ADA
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Maximum fee for any settlement
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p className="mb-1">🔒 Security Notes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Fee configuration can only be modified in Admin panel
                      </li>
                      <li>All fee calculations are enforced server-side</li>
                      <li>
                        Last updated:{" "}
                        {lastUpdated
                          ? new Date(lastUpdated).toLocaleString()
                          : "Never"}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-500">
                    Example: 1,000 ADA settlement with 1% fee = 10 ADA fee
                    (minimum {minFee} ADA)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveFeeConfig} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Configuration"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFeePercentage(1.0);
                      setMinFee(0.5);
                      setMaxFee(100.0);
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Dashboard */}
          <TabsContent value="revenue" key="revenue-content">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue by Casino</CardTitle>
                    <CardDescription>
                      Per-casino settlement and fee breakdown
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="casino" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#8b5cf6"
                      name="Revenue (ADA)"
                    />
                    <Bar dataKey="fees" fill="#06b6d4" name="Fees (ADA)" />
                  </BarChart>
                </ResponsiveContainer>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Casino</TableHead>
                      <TableHead>Total Revenue</TableHead>
                      <TableHead>Fees Collected</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueData.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.casino}
                        </TableCell>
                        <TableCell>
                          {(item.revenue || 0).toLocaleString()} ADA
                        </TableCell>
                        <TableCell>
                          {(item.fees || 0).toLocaleString()} ADA
                        </TableCell>
                        <TableCell>24</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Alerts */}
          <TabsContent value="system" key="system-content">
            <div className="space-y-4">
              {/* Disputes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Dispute Queue
                  </CardTitle>
                  <CardDescription>
                    Open disputes requiring manual review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Casino</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disputeData.map((dispute) => (
                        <TableRow key={dispute.id}>
                          <TableCell className="font-mono text-sm">
                            {dispute.id}
                          </TableCell>
                          <TableCell>{dispute.casino}</TableCell>
                          <TableCell>{dispute.issue}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                dispute.status === "pending"
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {dispute.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {dispute.date}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    System Alerts
                  </CardTitle>
                  <CardDescription>
                    Platform health and API status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alertsData.map((alert) => (
                      <div
                        key={alert.id}
                        className="border border-border rounded-lg p-3 flex items-start gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {alert.message}
                            </p>
                            <Badge
                              variant="outline"
                              className={
                                alert.severity === "error"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : alert.severity === "warning"
                                  ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {alert.timestamp}
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          Dismiss
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blockfrost Monitoring */}
          <TabsContent value="blockfrost" key="blockfrost-content">
            <div className="space-y-6">
              {/* Wallet Balance Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Wallet Balance</CardTitle>
                  <CardDescription>
                    Current ADA balance and UTXO statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingWallet ? (
                    <div className="text-center py-4">
                      Loading wallet data...
                    </div>
                  ) : walletBalance ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          ADA Balance
                        </p>
                        <p className="text-2xl font-bold">
                          {walletBalance.balance} ADA
                        </p>
                      </div>
                      <div className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          UTXO Count
                        </p>
                        <p className="text-2xl font-bold">
                          {walletBalance.utxoCount}
                        </p>
                      </div>
                      <div className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Last Updated
                        </p>
                        <p className="text-sm">
                          {walletBalance?.lastUpdated
                            ? new Date(
                                walletBalance.lastUpdated
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                      <div className="border border-border rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          Wallet Address
                        </p>
                        <p className="font-mono text-xs break-all">
                          {walletBalance.address.substring(0, 16)}...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No wallet data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Revenue Analytics */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Revenue Analytics</CardTitle>
                      <CardDescription>
                        Daily, weekly, and monthly fee tracking
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={timeRange === "daily" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("daily")}
                      >
                        Daily
                      </Button>
                      <Button
                        variant={timeRange === "weekly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("weekly")}
                      >
                        Weekly
                      </Button>
                      <Button
                        variant={
                          timeRange === "monthly" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setTimeRange("monthly")}
                      >
                        Monthly
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingRevenue ? (
                    <div className="text-center py-8">
                      Loading revenue data...
                    </div>
                  ) : revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey={
                            timeRange === "daily"
                              ? "dailyFee"
                              : timeRange === "weekly"
                              ? "weeklyFee"
                              : "monthlyFee"
                          }
                          stroke="#8b5cf6"
                          name={`${
                            timeRange.charAt(0).toUpperCase() +
                            timeRange.slice(1)
                          } Fee (ADA)`}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No revenue data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* UTXO Inspector */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>UTXO Inspector</CardTitle>
                        <CardDescription>
                          Live table of wallet UTXOs
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUtxos ? (
                      <div className="text-center py-4">
                        Loading UTXO data...
                      </div>
                    ) : utxoData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>TX Hash</TableHead>
                            <TableHead>ADA</TableHead>
                            <TableHead>Tokens</TableHead>
                            <TableHead>Block Height</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {utxoData.map((utxo, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-xs">
                                {utxo.tx_hash.substring(0, 8)}...
                                {utxo.tx_hash.substring(
                                  utxo.tx_hash.length - 8
                                )}
                              </TableCell>
                              <TableCell>{utxo.ada} ADA</TableCell>
                              <TableCell>{utxo.tokens}</TableCell>
                              <TableCell>{utxo.block_height}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    window.open(
                                      `https://blockfrost.io/projects/mainnet/transactions/${utxo.tx_hash}`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No UTXO data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Validator Health */}
                <Card>
                  <CardHeader>
                    <CardTitle>Validator Health</CardTitle>
                    <CardDescription>
                      Transaction count per validator
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingValidators ? (
                      <div className="text-center py-4">
                        Loading validator data...
                      </div>
                    ) : validatorData.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Validator</TableHead>
                            <TableHead>TX Count</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validatorData.map((validator, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono text-xs">
                                {validator.validator}
                              </TableCell>
                              <TableCell>{validator.txCount}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    validator.txCount > 40
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    validator.txCount > 40
                                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                                      : ""
                                  }
                                >
                                  {validator.txCount > 40
                                    ? "Healthy"
                                    : "Low Activity"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No validator data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Fee Governance */}
              <Card>
                <CardHeader>
                  <CardTitle>Fee Governance</CardTitle>
                  <CardDescription>
                    Adjust platform fee settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        Platform Fee Percentage (%)
                      </label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={feePercentage}
                          onChange={(e) =>
                            setFeePercentage(Number.parseFloat(e.target.value))
                          }
                          className="max-w-32"
                        />
                        <span className="text-sm text-muted-foreground py-2">
                          Current: {feePercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied to all settlements
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Minimum Fee (ADA)
                      </label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={minFee}
                          onChange={(e) =>
                            setMinFee(Number.parseFloat(e.target.value))
                          }
                          className="max-w-32"
                        />
                        <span className="text-sm text-muted-foreground py-2">
                          Current: {minFee} ADA
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Minimum fee for any settlement
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Maximum Fee (ADA)
                      </label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={maxFee}
                          onChange={(e) =>
                            setMaxFee(Number.parseFloat(e.target.value))
                          }
                          className="max-w-32"
                        />
                        <span className="text-sm text-muted-foreground py-2">
                          Current: {maxFee} ADA
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Maximum fee for any settlement
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          const response = await fetch(
                            "/api/admin/blockfrost",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                action: "update-fee-config",
                                feePercentage: feePercentage,
                                minFee: minFee,
                                maxFee: maxFee,
                              }),
                            }
                          );

                          if (response.ok) {
                            alert("Fee configuration updated successfully!");
                          } else {
                            const error = await response.json();
                            alert(`Error: ${error.error}`);
                          }
                        } catch (error) {
                          console.error(
                            "Failed to update fee configuration:",
                            error
                          );
                          alert("Failed to update fee configuration");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Configuration"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFeePercentage(1.0);
                        setMinFee(0.5);
                        setMaxFee(100.0);
                      }}
                    >
                      Reset to Defaults
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            "/api/admin/blockfrost",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                action: "trigger-audit",
                              }),
                            }
                          );

                          if (response.ok) {
                            const result = await response.json();
                            alert(
                              `Audit report generation triggered! Report ID: ${result.reportId}`
                            );
                          } else {
                            const error = await response.json();
                            alert(`Error: ${error.error}`);
                          }
                        } catch (error) {
                          console.error("Failed to trigger audit:", error);
                          alert("Failed to trigger audit report generation");
                        }
                      }}
                    >
                      Generate Audit Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
