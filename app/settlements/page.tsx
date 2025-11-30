"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Eye, Zap, Coins } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { toast } from "sonner";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "@/contexts/auth-context";

// Mock data for settlements
const mockSettlements = [
  {
    id: "SETT-0001",
    transactionHash:
      "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
    amount: "150.50 ADA",
    timestamp: "2024-01-15T14:30:00Z",
    status: "completed",
    playerWallet: "addr1q8vw4...xyz",
    gameType: "blackjack",
  },
  {
    id: "SETT-0002",
    transactionHash:
      "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
    amount: "75.25 ADA",
    timestamp: "2024-01-15T13:45:00Z",
    status: "pending",
    playerWallet: "addr1q9abc...def",
    gameType: "roulette",
  },
  {
    id: "SETT-0003",
    transactionHash:
      "b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
    amount: "200.00 ADA",
    timestamp: "2024-01-15T12:15:00Z",
    status: "completed",
    playerWallet: "addr1q0xyz...uvw",
    gameType: "poker",
  },
  {
    id: "SETT-0004",
    transactionHash:
      "c3d4e5f678901234567890123456789012345678901234567890123456789012",
    amount: "50.75 ADA",
    timestamp: "2024-01-15T11:30:00Z",
    status: "failed",
    playerWallet: "addr1q1def...rst",
    gameType: "slots",
  },
  {
    id: "SETT-0005",
    transactionHash:
      "d4e5f67890123456789012345678901234567890123456789012345678901234",
    amount: "300.25 ADA",
    timestamp: "2024-01-15T10:45:00Z",
    status: "completed",
    playerWallet: "addr1q2ghi...opq",
    gameType: "blackjack",
  },
];

// Mock data for Hydra settlements
const generateMockHydraData = () => {
  const data = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      settlements: Math.floor(Math.random() * 50) + 10, // 10-60 settlements per day
      volume: Math.floor(Math.random() * 10000) + 1000, // 1000-11000 ADA volume
    });
  }

  return data;
};

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState(mockSettlements);
  const [filteredSettlements, setFilteredSettlements] =
    useState(mockSettlements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gameFilter, setGameFilter] = useState("all");
  const [hydraData, setHydraData] = useState(generateMockHydraData());
  const [hydraStatus, setHydraStatus] = useState("active"); // active, committing, committed
  const [feePercentage] = useState(1); // 1% fee
  const [showSettlementLoader, setShowSettlementLoader] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Show settlement loader for 3.5 seconds
    const timer = setTimeout(() => {
      setShowSettlementLoader(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // In a real implementation, this would fetch from an API
    // For now, we'll use the mock data
    const filtered = mockSettlements.filter((settlement) => {
      const matchesSearch =
        settlement.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        settlement.transactionHash
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        settlement.playerWallet
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || settlement.status === statusFilter;
      const matchesGame =
        gameFilter === "all" || settlement.gameType === gameFilter;

      return matchesSearch && matchesStatus && matchesGame;
    });

    setFilteredSettlements(filtered);
  }, [searchTerm, statusFilter, gameFilter]);

  const handleViewTransaction = (hash: string) => {
    window.open(`https://preprod.cardanoscan.io/transaction/${hash}`, "_blank");
    toast.success("Opening transaction in CardanoScan");
  };

  const handleDownloadReport = () => {
    const csv = [
      [
        "ID",
        "Transaction Hash",
        "Amount",
        "Date",
        "Status",
        "Player Wallet",
        "Game Type",
      ],
      ...filteredSettlements.map((s) => [
        s.id,
        s.transactionHash,
        s.amount,
        new Date(s.timestamp).toISOString(),
        s.status,
        s.playerWallet,
        s.gameType,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlements-report-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Settlement report downloaded successfully!");
  };

  const handleCommitToL1 = async () => {
    setHydraStatus("committing");
    toast.info("Committing Hydra settlements to L1...");

    // Simulate API call to commit settlements
    setTimeout(() => {
      setHydraStatus("committed");
      toast.success("Successfully committed settlements to Cardano L1!");

      // Reset status after a delay
      setTimeout(() => {
        setHydraStatus("active");
      }, 5000);
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-600">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Calculate total settlements and volume for display
  const totalSettlements = hydraData.reduce(
    (sum, day) => sum + day.settlements,
    0
  );
  const totalVolume = hydraData.reduce((sum, day) => sum + day.volume, 0);
  const platformFees = totalVolume * (feePercentage / 100);

  if (showSettlementLoader) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <img
            src="/settlement_loader.jpg"
            alt="Settlements Loader"
            className="mx-auto mb-4 rounded-lg shadow-lg"
            style={{ maxWidth: "400px", height: "auto" }}
          />
          <p className="text-muted-foreground">Loading settlements data...</p>
          {user?.email && (
            <p className="text-muted-foreground text-sm mt-2">
              Welcome, {user.email}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settlements</h1>
            <p className="text-muted-foreground mt-2">
              View and manage transaction settlements
            </p>
          </div>

          {/* Hydra Fast Mode Section */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="w-6 h-6" />
                    Hydra Fast Mode
                  </CardTitle>
                  <p className="text-blue-100 mt-1">
                    Instant micro-settlements with batch finalization to Cardano
                    L1
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalSettlements}</p>
                    <p className="text-blue-100 text-sm">Settlements</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {totalVolume.toLocaleString()} ADA
                    </p>
                    <p className="text-blue-100 text-sm">Volume</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {platformFees.toFixed(2)} ADA
                    </p>
                    <p className="text-blue-100 text-sm">Platform Fees (1%)</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Settlements Chart */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-medium mb-2">Daily Settlements</h3>
                  <ChartContainer
                    config={{
                      settlements: {
                        label: "Settlements",
                        color: "hsl(180, 100%, 50%)",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <div className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={hydraData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.2)"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.7)"
                            tickMargin={10}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.7)"
                            tickMargin={10}
                            tick={{ fontSize: 10 }}
                            width={30}
                          />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="settlements"
                            fill="var(--color-settlements)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartContainer>
                </div>

                {/* Volume Chart */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-medium mb-2">Daily Volume (ADA)</h3>
                  <ChartContainer
                    config={{
                      volume: {
                        label: "Volume (ADA)",
                        color: "hsl(50, 100%, 50%)",
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <div className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={hydraData}
                          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255,255,255,0.2)"
                          />
                          <XAxis
                            dataKey="date"
                            stroke="rgba(255,255,255,0.7)"
                            tickMargin={10}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis
                            stroke="rgba(255,255,255,0.7)"
                            tickMargin={10}
                            tick={{ fontSize: 10 }}
                            width={40}
                          />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="volume"
                            stroke="var(--color-volume)"
                            dot={false}
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartContainer>
                </div>
              </div>

              {/* Commit to L1 Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleCommitToL1}
                  disabled={hydraStatus === "committing"}
                  className="bg-white text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  {hydraStatus === "committing"
                    ? "Committing..."
                    : "Commit to L1"}
                </Button>
              </div>

              {hydraStatus === "committed" && (
                <div className="mt-3 text-center text-green-300 text-sm">
                  Successfully committed to Cardano L1! Transaction hash:
                  tx_abc123...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filters and Controls */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Filters & Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <Label htmlFor="search" className="text-xs">
                    Search
                  </Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by ID, hash, or wallet..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <Label htmlFor="status" className="text-xs">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px] mt-1">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Game Filter */}
                <div>
                  <Label htmlFor="game" className="text-xs">
                    Game
                  </Label>
                  <Select value={gameFilter} onValueChange={setGameFilter}>
                    <SelectTrigger className="w-[120px] mt-1">
                      <SelectValue placeholder="Game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Games</SelectItem>
                      <SelectItem value="blackjack">Blackjack</SelectItem>
                      <SelectItem value="roulette">Roulette</SelectItem>
                      <SelectItem value="poker">Poker</SelectItem>
                      <SelectItem value="slots">Slots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Download Button */}
                <div className="flex items-end">
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <Download className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settlements Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Recent Settlements</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSettlements.map((settlement) => (
                    <TableRow key={settlement.id}>
                      <TableCell className="font-medium">
                        {settlement.id}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">
                          {settlement.transactionHash.substring(0, 8)}...
                          {settlement.transactionHash.substring(
                            settlement.transactionHash.length - 8
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{settlement.amount}</TableCell>
                      <TableCell>
                        {new Date(settlement.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{settlement.gameType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/settlements/${settlement.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSettlements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No settlements found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
