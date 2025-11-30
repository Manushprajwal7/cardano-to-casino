"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Copy,
  Download,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
} from "lucide-react";
import { MerkleTreeVisualizer } from "@/components/sessions/merkle-tree-visualizer";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function SettlementSessionDetailsPage() {
  const params = useParams();
  const settlementId = params.id as string;

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const [proofInput, setProofInput] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Record<number, boolean>>({});
  const [proofData, setProofData] = useState<any>(null);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await fetch(`/api/settlements/${settlementId}`);
        const data = await response.json();
        if (response.ok) {
          setSessionData(data);

          // Mock logs data - in a real implementation, this would come from IPFS
          const mockLogs = [
            {
              id: 1,
              timestamp: "2024-01-15T10:30:00Z",
              eventType: "SETTLEMENT_START",
              payload: { settlementId: "SETT-0001", playerId: "player-456" },
            },
            {
              id: 2,
              timestamp: "2024-01-15T10:30:05Z",
              eventType: "AMOUNT_CALCULATED",
              payload: { amount: "150.50 ADA", currency: "ADA" },
            },
            {
              id: 3,
              timestamp: "2024-01-15T10:30:10Z",
              eventType: "TX_SUBMITTED",
              payload: {
                txHash:
                  "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
              },
            },
            {
              id: 4,
              timestamp: "2024-01-15T10:30:15Z",
              eventType: "TX_CONFIRMED",
              payload: { blockHeight: 123456, confirmations: 12 },
            },
            {
              id: 5,
              timestamp: "2024-01-15T10:30:20Z",
              eventType: "SETTLEMENT_COMPLETED",
              payload: { status: "completed", finalAmount: "150.50 ADA" },
            },
          ];
          setLogs(mockLogs);
        } else {
          console.error("Failed to fetch session:", data.error);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    if (settlementId) {
      fetchSessionData();
    }
  }, [settlementId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleRecomputeMerkleRoot = async () => {
    setIsRecomputing(true);
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "recompute" }),
      });

      const data = await response.json();
      if (response.ok) {
        // Refresh session data
        const refreshResponse = await fetch(`/api/settlements/${settlementId}`);
        const refreshedData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setSessionData(refreshedData);
          toast.success("Merkle root recomputed successfully!");
        }
      } else {
        console.error("Failed to recompute Merkle root:", data.error);
        toast.error("Failed to recompute Merkle root");
      }
    } catch (error) {
      console.error("Error recomputing Merkle root:", error);
      toast.error("An error occurred while recomputing");
    } finally {
      setIsRecomputing(false);
    }
  };

  const handleGenerateProof = async () => {
    try {
      const leafIndex = parseInt(proofInput);
      if (isNaN(leafIndex)) {
        console.error("Invalid leaf index");
        return;
      }

      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "generate-proof", leafIndex }),
      });

      const data = await response.json();
      if (response.ok) {
        setProofData(data);
        toast.success("Proof generated successfully!");
      } else {
        console.error("Failed to generate proof:", data.error);
        toast.error("Failed to generate proof");
      }
    } catch (error) {
      console.error("Error generating proof:", error);
      toast.error("An error occurred while generating proof");
    }
  };

  const handleVerifyOnChain = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify-onchain",
          txHash: sessionData?.txHash,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setVerificationResult(data.verified ? "valid" : "invalid");
        if (data.verified) {
          toast.success("✅ Verification successful!");
        } else {
          toast.error("❌ Verification failed");
        }
      } else {
        console.error("Failed to verify on-chain:", data.error);
        toast.error("Failed to verify on-chain");
      }
    } catch (error) {
      console.error("Error verifying on-chain:", error);
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAttachSignature = async () => {
    toast.info("Signature attachment feature coming soon!");
  };

  const toggleLogExpansion = (index: number) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Sample Merkle tree data
  const mockMerkleTree = {
    id: "root",
    hash:
      sessionData?.merkleRoot ||
      "0x8f2c0e5d9a1b7c3e2f4a6b8d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8",
    left: {
      id: "node-1",
      hash: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
      left: {
        id: "leaf-1",
        hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v",
        isLeaf: true,
      },
      right: {
        id: "leaf-2",
        hash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w",
        isLeaf: true,
      },
    },
    right: {
      id: "node-2",
      hash: "0x9a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v",
      left: {
        id: "leaf-3",
        hash: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x",
        isLeaf: true,
      },
      right: {
        id: "leaf-4",
        hash: "0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y",
        isLeaf: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div>Loading session data...</div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="p-8 space-y-6">
          <div>Session not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Settlement Session Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Session ID: {sessionData.settlementId}
          </p>
        </div>

        {/* Session Summary Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Session Summary</CardTitle>
              <Badge
                className={
                  sessionData.status === "completed"
                    ? "bg-green-600"
                    : sessionData.status === "pending"
                    ? "bg-yellow-600"
                    : "bg-destructive"
                }
              >
                {sessionData.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Player Wallet
                </p>
                <p className="text-sm font-semibold mt-1">
                  {sessionData.playerWallet || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Game Type
                </p>
                <p className="text-sm font-semibold mt-1">
                  {sessionData.gameType || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Amount
                </p>
                <p className="text-sm font-semibold mt-1">
                  {sessionData.amount || "N/A"} ADA
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Timestamp
                </p>
                <p className="text-sm font-semibold mt-1">
                  {new Date(sessionData.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Additional session details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Merkle Root
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-sm font-mono break-all">
                    {sessionData.merkleRoot || "Not computed"}
                  </p>
                  {sessionData.merkleRoot && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                      onClick={() => copyToClipboard(sessionData.merkleRoot)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  IPFS CID
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-sm font-mono break-all">
                    {sessionData.cid}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0"
                    onClick={() => copyToClipboard(sessionData.cid)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-6 w-6 p-0"
                    onClick={() => {
                      const gatewayUrl =
                        sessionData.ipfsGatewayUrl ||
                        `https://ipfs.io/ipfs/${sessionData.cid}`;
                      window.open(gatewayUrl, "_blank");
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Transaction Hash
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-sm font-mono break-all">
                    {sessionData.txHash || "Not set"}
                  </p>
                  {sessionData.txHash && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0"
                        onClick={() => copyToClipboard(sessionData.txHash)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-6 w-6 p-0"
                        onClick={() => {
                          window.open(
                            `https://preprod.cardanoscan.io/transaction/${sessionData.txHash}`,
                            "_blank"
                          );
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Uploaded By
                </p>
                <p className="text-sm font-semibold mt-1">
                  {sessionData.uploadedBy || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Log Viewer, Merkle Tree, and Proof Tool */}
        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="logs">Log Viewer</TabsTrigger>
            <TabsTrigger value="merkle">Merkle Tree</TabsTrigger>
            <TabsTrigger value="proof">Generate Proof</TabsTrigger>
          </TabsList>

          {/* Log Viewer Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-base">Session Logs</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const dataStr = JSON.stringify(
                      { settlementId, logs, timestamp: new Date().toISOString() },
                      null,
                      2
                    );
                    const dataBlob = new Blob([dataStr], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `settlement-logs-${settlementId}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                    toast.success("Logs downloaded successfully!");
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <Collapsible
                      key={log.id}
                      open={expandedLogs[index]}
                      onOpenChange={() => toggleLogExpansion(index)}
                    >
                      <div className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {log.eventType}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedLogs[index] ? "rotate-180" : ""
                                }`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      <CollapsibleContent className="p-3 bg-secondary/50 rounded-b-lg">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Merkle Tree Tab */}
          <TabsContent value="merkle" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Merkle Tree Visualization
                  </CardTitle>
                  <Button
                    onClick={handleRecomputeMerkleRoot}
                    disabled={isRecomputing}
                    variant="outline"
                    size="sm"
                  >
                    {isRecomputing ? (
                      <>Recomputing...</>
                    ) : (
                      <>Recompute Merkle Root</>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sessionData.merkleRoot ? (
                  <div className="space-y-4">
                    <MerkleTreeVisualizer rootNode={mockMerkleTree} />
                    <p className="text-sm text-muted-foreground">
                      Merkle root: {sessionData.merkleRoot}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Merkle tree not computed. Click "Recompute Merkle Root" to
                    generate.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Proof Tab */}
          <TabsContent value="proof" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">
                  Merkle Proof Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="log-entry">Leaf Index</Label>
                  <Input
                    id="log-entry"
                    placeholder="Enter leaf index (0-based)..."
                    value={proofInput}
                    onChange={(e) => setProofInput(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleGenerateProof}
                >
                  Generate Proof
                </Button>

                {proofData && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="bg-secondary p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Leaf Hash
                        </p>
                        <p className="font-mono text-xs mt-1 break-all">
                          {proofData.leafHash}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Merkle Path
                        </p>
                        <div className="space-y-2 mt-1">
                          {proofData.proof.map((step: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-xs font-mono"
                            >
                              <span>Step {index + 1}:</span>
                              <span>
                                {step.hash.substring(0, 16)}... ({step.position}
                                )
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">
                          Computed Merkle Root
                        </p>
                        <p className="font-mono text-xs mt-1 break-all">
                          {proofData.merkleRoot}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handleVerifyOnChain}
                      disabled={isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify Against On-Chain"}
                    </Button>

                    {verificationResult && (
                      <div className="space-y-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold">
                            {verificationResult === "valid"
                              ? "Verification Successful"
                              : "Verification Failed"}
                          </span>
                        </div>

                        {verificationResult === "valid" ? (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                            <p className="text-green-500">
                              The Merkle root matches the on-chain data. This
                              session has been verified.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                            <p className="text-destructive">
                              The Merkle root does not match the on-chain data.
                              There may be a discrepancy.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleRecomputeMerkleRoot}
            disabled={isRecomputing}
          >
            {isRecomputing ? "Recomputing..." : "Recompute Merkle Root"}
          </Button>
          <Button variant="outline" onClick={handleAttachSignature}>
            Attach Operator Signature
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleVerifyOnChain}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Mark Session as Verified"}
          </Button>
        </div>
      </div>
    </div>
  );
}
