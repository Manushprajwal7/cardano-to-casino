"use client";

import { useState, useEffect } from "react";
import { SessionsTable } from "@/components/sessions/sessions-table";
import { CreateSessionModal } from "@/components/sessions/create-session-modal";
import { UploadSessionModal } from "@/components/sessions/upload-session-modal";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { exportSessions } from "@/lib/export-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pause, Play, Rocket, CheckCircle2 } from "lucide-react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SessionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for export
  const mockSessions = [
    {
      id: "SESS-0001",
      operator: "Casino Royal",
      tableId: "TABLE-42",
      startTime: "2024-01-15 10:30:00",
      endTime: "2024-01-15 14:45:00",
      merkleRoot: "0x5a8b...c3d9",
      status: "settled",
    },
    {
      id: "SESS-0002",
      operator: "Lucky Dragon",
      tableId: "TABLE-08",
      startTime: "2024-01-15 11:00:00",
      endTime: "2024-01-15 15:20:00",
      merkleRoot: "0x2f4e...a1b2",
      status: "closed",
    },
    {
      id: "SESS-0003",
      operator: "Golden Nugget",
      tableId: "TABLE-15",
      startTime: "2024-01-15 09:15:00",
      endTime: null,
      merkleRoot: "0x9c1d...e7f3",
      status: "open",
    },
    {
      id: "SESS-0004",
      operator: "Monaco Club",
      tableId: "TABLE-22",
      startTime: "2024-01-15 14:00:00",
      endTime: "2024-01-15 18:30:00",
      merkleRoot: "0x4b8f...d2c5",
      status: "error",
    },
  ];

  // Fetch sessions from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/sessions");
        const data = await response.json();
        if (response.ok) {
          console.log("Fetched sessions:", data);
          setSessions(data.sessions || []);
        } else {
          setError(data.error || "Failed to fetch sessions");
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
        setError("Failed to fetch sessions: " + (error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const [hydraStatus, setHydraStatus] = useState<
    "closed" | "open" | "closing" | "committed"
  >("closed");
  const [hydraHeadId, setHydraHeadId] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [tps, setTps] = useState(0);
  const [betsConfirmed, setBetsConfirmed] = useState(0);
  const [hydraLogs, setHydraLogs] = useState<any[]>([]);
  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [l1TxHash, setL1TxHash] = useState<string | null>(null);
  const [tpsWindowCount, setTpsWindowCount] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [fastSeries, setFastSeries] = useState<
    { time: string; fastTx: number }[]
  >([]);
  const HYDRA_URL =
    (typeof window !== "undefined" &&
      (window as any).env?.NEXT_PUBLIC_HYDRA_WS_URL) ||
    process.env.NEXT_PUBLIC_HYDRA_WS_URL ||
    "";

  // Initialize with some synthetic data
  useEffect(() => {
    // Generate initial data points
    const initialData = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1000);
      const label = time.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      // Generate synthetic data with some variation
      const baseValue = 5 + Math.sin(i / 10) * 3;
      const variance = Math.random() * 5;
      const value = Math.max(0, Math.round(baseValue + variance));
      initialData.push({ time: label, fastTx: value });
    }
    setFastSeries(initialData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(tpsWindowCount);
      const label = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setFastSeries((prev) => {
        const next = prev.length >= 60 ? prev.slice(1) : prev.slice();

        // Generate synthetic data when not streaming
        let newValue = tpsWindowCount;
        if (!streaming && hydraStatus === "closed") {
          // Create realistic synthetic data with variation
          const lastValue = next.length > 0 ? next[next.length - 1].fastTx : 5;
          const variance = (Math.random() - 0.5) * 4;
          newValue = Math.max(0, Math.round(lastValue + variance));

          // Ensure some baseline activity
          if (newValue < 2) newValue = Math.floor(Math.random() * 3) + 2;
        }

        next.push({ time: label, fastTx: newValue });
        return next;
      });
      setTpsWindowCount(0);
    }, 1000);
    return () => clearInterval(interval);
  }, [tpsWindowCount, streaming, hydraStatus]);

  const startHydraSession = async () => {
    try {
      const res = await fetch("/api/hydra/startSession", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setHydraStatus("open");
        setHydraHeadId(data.headId);
        // Setup websocket or simulator
        if (HYDRA_URL) {
          const socket = new WebSocket(HYDRA_URL);
          socket.onopen = () => {
            setStreaming(true);
          };
          socket.onmessage = (evt) => {
            if (!streaming) return;
            try {
              const msg = JSON.parse(evt.data);
              if (msg.type === "bet" || msg.type === "play") {
                setHydraLogs((prev) =>
                  prev.concat({ timestamp: new Date().toISOString(), ...msg })
                );
                setBetsConfirmed((prev) => prev + 1);
                setTpsWindowCount((prev) => prev + 1);
              }
            } catch {
              // ignore
            }
          };
          socket.onclose = () => setStreaming(false);
          setWs(socket);
        } else {
          // Simulator: generate events while streaming is true
          setStreaming(true);
        }
      } else {
        alert(data.error || "Failed to start Hydra session");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to start Hydra session");
    }
  };

  useEffect(() => {
    let simInterval: any;
    if (!HYDRA_URL && streaming) {
      simInterval = setInterval(() => {
        const event = {
          type: "bet",
          payload: {
            amount: `${Math.floor(Math.random() * 100)} ADA`,
            table: `T-${Math.floor(Math.random() * 10) + 1}`,
          },
        };
        setHydraLogs((prev) =>
          prev.concat({ timestamp: new Date().toISOString(), ...event })
        );
        setBetsConfirmed((prev) => prev + 1);
        setTpsWindowCount((prev) => prev + 1);
      }, 100);
    }
    return () => simInterval && clearInterval(simInterval);
  }, [streaming, HYDRA_URL]);

  const toggleStream = () => {
    setStreaming((s) => {
      const next = !s;
      if (!next && ws) ws.close();
      return next;
    });
  };

  const closeAndCommit = async () => {
    if (!hydraHeadId) {
      alert("Hydra head not started");
      return;
    }
    setHydraStatus("closing");
    try {
      const res = await fetch("/api/hydra/closeSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headId: hydraHeadId, events: hydraLogs }),
      });
      const data = await res.json();
      if (res.ok) {
        setMerkleRoot(data.merkleRoot);
        setIpfsCid(data.cid);
        setL1TxHash(data.txHash);
        setHydraStatus("committed");
        setStreaming(false);
      } else {
        alert(data.error || "Failed to close Hydra head");
        setHydraStatus("open");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to close Hydra head");
      setHydraStatus("open");
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
            <p className="text-muted-foreground mt-2">
              Manage and monitor all gaming sessions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportSessions(mockSessions)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Session
            </Button>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Create Session
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">All Sessions</TabsTrigger>
            <TabsTrigger value="hydra">Real-Time Hydra Engine</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Real-time Hydra Fast Transactions Graph */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Hydra Fast Transactions</CardTitle>
                    <CardDescription>
                      Real-time per-second fast tx count
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Hydra Head</p>
                      <p className="font-semibold">
                        {hydraStatus === "open"
                          ? "OPEN"
                          : hydraStatus.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Live TPS</p>
                      <p className="font-semibold">{tps}/s</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ChartContainer
                  config={{
                    fastTx: {
                      label: "Fast Tx/s",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[240px] w-full"
                >
                  <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={fastSeries}
                        margin={{ top: 10, right: 24, left: 8, bottom: 10 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--color-border)"
                        />
                        <XAxis
                          dataKey="time"
                          stroke="var(--color-muted-foreground)"
                          tickMargin={8}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          stroke="var(--color-muted-foreground)"
                          tickMargin={8}
                          tick={{ fontSize: 12 }}
                          width={48}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="fastTx"
                          stroke="var(--color-chart-1)"
                          dot={false}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Off-chain Sessions Table */}
            {/* Error State */}
            {error && (
              <Card className="bg-destructive/10 border-destructive">
                <CardContent className="py-4">
                  <p className="text-destructive">Error: {error}</p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <p>Loading sessions...</p>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!loading && sessions.length === 0 && !error && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>No Sessions Found</CardTitle>
                  <CardDescription>
                    There are currently no gaming sessions in the system. Create
                    a new session or upload an existing one to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    Create Session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload Session
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Sessions Table */}
            {!loading && sessions.length > 0 && !error && (
              <SessionsTable sessions={sessions} />
            )}

            {/* Create Session Modal */}
            <CreateSessionModal
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            />

            {/* Upload Session Modal */}
            <UploadSessionModal
              open={isUploadModalOpen}
              onOpenChange={setIsUploadModalOpen}
            />
          </TabsContent>

          <TabsContent value="hydra" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Real-Time Hydra Game Engine</CardTitle>
                    <CardDescription>
                      State channel for high-throughput sessions with instant
                      finality
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <p className="text-muted-foreground">Hydra Head</p>
                      <p className="font-semibold">
                        {hydraStatus === "open"
                          ? "OPEN"
                          : hydraStatus.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Live TPS</p>
                      <p className="font-semibold">{tps}/s</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Bets Confirmed</p>
                      <p className="font-semibold">{betsConfirmed}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={startHydraSession}
                    disabled={hydraStatus === "open"}
                    className="flex items-center gap-2"
                  >
                    <Rocket className="w-4 h-4" /> Start Hydra Session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={toggleStream}
                    disabled={hydraStatus !== "open"}
                    className="flex items-center gap-2"
                  >
                    {streaming ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {streaming ? "Pause" : "Stream Logs"}
                  </Button>
                  <Button
                    onClick={closeAndCommit}
                    disabled={hydraStatus !== "open"}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Close & Commit to L1
                  </Button>
                </div>

                <div className="border border-border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">
                    Fast Transactions (per second)
                  </p>
                  <ChartContainer
                    config={{
                      fastTx: {
                        label: "Fast Tx/s",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[240px] w-full"
                  >
                    <div className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={fastSeries}
                          margin={{ top: 10, right: 24, left: 8, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--color-border)"
                          />
                          <XAxis
                            dataKey="time"
                            stroke="var(--color-muted-foreground)"
                            tickMargin={8}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            stroke="var(--color-muted-foreground)"
                            tickMargin={8}
                            tick={{ fontSize: 12 }}
                            width={48}
                            allowDecimals={false}
                          />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="fastTx"
                            stroke="var(--color-chart-1)"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartContainer>
                </div>

                <div className="border border-border rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Live Logs</p>
                  <div className="max-h-64 overflow-auto space-y-2">
                    {hydraLogs.slice(-50).map((log, idx) => (
                      <div key={idx} className="text-xs font-mono">
                        <span className="text-muted-foreground mr-2">
                          {log.timestamp}
                        </span>
                        <span>
                          {JSON.stringify({
                            type: log.type,
                            payload: log.payload,
                          })}
                        </span>
                      </div>
                    ))}
                    {hydraLogs.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No events yet. Start session and stream logs.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Merkle Root
                    </p>
                    <p className="font-mono text-xs break-all">
                      {merkleRoot || "Not computed"}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      IPFS CID
                    </p>
                    <p className="font-mono text-xs break-all">
                      {ipfsCid || "Not uploaded"}
                    </p>
                  </div>
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      L1 Transaction
                    </p>
                    <p className="font-mono text-xs break-all">
                      {l1TxHash || "Not committed"}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Hydra State → Merkle Root → IPFS CID Recorded
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
