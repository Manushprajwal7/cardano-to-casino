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
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  Download,
  Wallet,
  Calculator,
  FileText,
  AlertCircle,
  Copy,
  Clock,
  Check,
  Printer,
} from "lucide-react";
import { exportAuditData } from "@/lib/export-utils";
import {
  exportSettlementReceipt,
  exportSettlementsCSV,
} from "@/lib/export-settlement-utils";
import {
  initLucid,
  buildSettlementTransaction,
  submitTransaction,
} from "@/lib/hydra-utils";
import { useWallet } from "@meshsdk/react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";

// Placeholder component for MerkleTree3DExplorer
function MerkleTree3DExplorer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Merkle Tree Explorer</CardTitle>
        <CardDescription>
          Interactive 3D visualization of Merkle tree structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            3D Merkle Tree Visualization Placeholder
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Define types for our data structures
interface Settlement {
  sessionId: string;
  merkleRoot: string | null;
  amount: number;
  operatorAddress: string;
}

interface AuditSearchResult {
  sessionId: string;
  merkleRoot: string;
  txHash: string;
  timestamp: string;
  metadata: any;
  walletSigner: string;
  auditTrail: any[];
}

interface VerificationResult {
  verified: boolean;
  message: string;
  computedHash: string;
}

interface SettlementHistoryItem {
  id: string;
  sessionId: string;
  amount: number;
  fee: number;
  txHash: string;
  status: string;
  timestamp: string;
}

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("session");
  const [activeTab, setActiveTab] = useState("transactions");
  const { user } = useAuth();
  const [showAuditLoader, setShowAuditLoader] = useState(true);

  // State variables for missing functionality
  const [mockAuditData] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedSettlements] = useState<Set<string>>(new Set());
  const [pendingSettlements] = useState<Settlement[]>([]);
  const [settlementPreview, setSettlementPreview] = useState<any>(null);
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [batchTransactions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [auditSearchResult, setAuditSearchResult] =
    useState<AuditSearchResult | null>(null);
  const [logEntry, setLogEntry] = useState("");
  const [merklePath, setMerklePath] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [settlementHistory] = useState<SettlementHistoryItem[]>([]);

  // Handle search click
  const handleSearchClick = () => {
    // Placeholder implementation for search functionality
    console.log(
      "Search clicked with term:",
      searchTerm,
      "and type:",
      searchType
    );
    // In a real implementation, this would perform the actual search
  };

  // Handle verify proof
  const handleVerifyProof = () => {
    // Placeholder implementation for proof verification
    console.log("Verify proof clicked");
    // In a real implementation, this would perform the actual proof verification
  };

  // Handle view on Blockfrost
  const handleViewOnBlockfrost = () => {
    // Placeholder implementation for viewing on Blockfrost
    console.log("View on Blockfrost clicked");
    // In a real implementation, this would redirect to Blockfrost explorer
  };

  // Handle audit tab search click
  const handleAuditTabSearchClick = () => {
    // Placeholder implementation for audit tab search
    console.log("Audit tab search clicked");
  };

  // Toggle select all
  const toggleSelectAll = () => {
    // Placeholder implementation
    console.log("Toggle select all clicked");
  };

  // Toggle settlement selection
  const toggleSettlementSelection = (sessionId: string) => {
    // Placeholder implementation
    console.log("Toggle settlement selection for:", sessionId);
  };

  // Sign and submit transaction
  const signAndSubmitTransaction = () => {
    // Placeholder implementation
    console.log("Sign and submit transaction clicked");
  };

  // Generate settlement preview
  const generateSettlementPreview = () => {
    // Placeholder implementation
    console.log("Generate settlement preview clicked");
  };

  // Handle export JSON
  const handleExportJSON = () => {
    // Placeholder implementation
    console.log("Export JSON clicked");
  };

  // Handle export PDF
  const handleExportPDF = () => {
    // Placeholder implementation
    console.log("Export PDF clicked");
  };

  // Handle export settlements CSV
  const handleExportSettlementsCSV = () => {
    // Placeholder implementation
    console.log("Export settlements CSV clicked");
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    // Placeholder implementation
    console.log("Copy to clipboard:", text);
  };

  // View on explorer
  const viewOnExplorer = (txHash: string) => {
    // Placeholder implementation
    console.log("View on explorer:", txHash);
  };

  // Handle export settlement receipt
  const handleExportSettlementReceipt = (settlement: SettlementHistoryItem) => {
    // Placeholder implementation
    console.log("Export settlement receipt:", settlement);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    // Placeholder implementation
    return <Badge>{status}</Badge>;
  };

  // Handle the audit loader display
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAuditLoader(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Show loader initially
  if (showAuditLoader) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <img
            src="/audit_loder.jpg"
            alt="Audit Loader"
            className="mx-auto mb-4 rounded-lg shadow-lg"
            style={{ maxWidth: "400px", height: "auto" }}
            onError={(e) => {
              console.error("Failed to load audit loader image:", e);
              // Hide loader if image fails to load
              setTimeout(() => setShowAuditLoader(false), 100);
            }}
          />
          <p className="text-muted-foreground">Loading audit data...</p>
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
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit & Proofs</h1>
          <p className="text-muted-foreground mt-2">
            Search and verify game integrity proofs on-chain
          </p>
        </div>

        <Tabs defaultValue="verify" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="verify">Verify Proof</TabsTrigger>
            <TabsTrigger value="3d-tree">3D Merkle Tree</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
            <TabsTrigger value="audit">Audit & Proofs</TabsTrigger>
          </TabsList>

          {/* 3D Merkle Tree Tab */}
          <TabsContent value="3d-tree">
            <MerkleTree3DExplorer />
          </TabsContent>

          {/* Verify Proof Tab */}
          <TabsContent value="verify">
            <Card>
              <CardHeader>
                <CardTitle>Merkle Proof Verification</CardTitle>
                <CardDescription>
                  Submit log entry and proof path for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Log Entry Hash
                    </label>
                    <Input
                      placeholder="0x..."
                      value="0xf3c4a5b2e1d9c8f4a7b6e2d1c9f8a7b6c5d4e3f2"
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Merkle Root</label>
                    <Input
                      placeholder="0x..."
                      value="0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0"
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Merkle Proof Path (JSON)
                  </label>
                  <textarea
                    className="w-full h-32 p-3 bg-muted border border-border rounded-md font-mono text-xs"
                    placeholder='[{"hash": "0x...", "direction": "left"}, ...]'
                    defaultValue={`[
  {"hash": "0xabc123...", "direction": "left"},
  {"hash": "0xdef456...", "direction": "right"},
  {"hash": "0x789ghi...", "direction": "left"}
]`}
                  />
                </div>

                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">Verification Result</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Computed hash matches merkle root
                      </p>
                    </div>
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Recomputed Hash:
                      </span>
                      <span className="font-mono">
                        0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        On-chain Metadata Ref:
                      </span>
                      <span className="font-mono cursor-pointer hover:text-primary flex items-center gap-1">
                        ada_metadata_v2.78.2024
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleVerifyProof}>
                    Verify Proof
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={handleViewOnBlockfrost}
                  >
                    View on Blockfrost
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Verification History</CardTitle>
                <CardDescription>
                  Recent proof verifications and audit trails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: "SES-001",
                        verified: true,
                        operator: "Casino A",
                        time: "2024-01-15 14:32",
                        txHash:
                          "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
                      },
                      {
                        id: "SES-002",
                        verified: true,
                        operator: "Casino B",
                        time: "2024-01-15 13:15",
                        txHash:
                          "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
                      },
                      {
                        id: "SES-003",
                        verified: false,
                        operator: "Casino C",
                        time: "2024-01-15 12:45",
                        txHash:
                          "b2a1c3d4e5f67890123456789012345678901234567890123456789012345679",
                      },
                      {
                        id: "SES-004",
                        verified: true,
                        operator: "Casino A",
                        time: "2024-01-15 11:20",
                        txHash:
                          "c3b2a1d4e5f67890123456789012345678901234567890123456789012345670",
                      },
                    ].map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.id}
                        </TableCell>
                        <TableCell>
                          {item.verified ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.verified ? "default" : "destructive"}
                          >
                            {item.verified ? "Valid" : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.operator}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.time}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewOnExplorer(item.txHash)}
                              title="View on Blockfrost"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settlements Tab */}
          <TabsContent value="settlements">
            <Card>
              <CardHeader>
                <CardTitle>Settlement Builder</CardTitle>
                <CardDescription>
                  Select sessions for settlement and generate transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Address Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Operator Wallet Address
                  </label>
                  <Input
                    placeholder="addr1..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="font-mono"
                  />
                  {!walletAddress && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Required for settlement payouts
                    </p>
                  )}
                </div>

                {/* Settlement Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Eligible Sessions</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedSettlements.size === pendingSettlements.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedSettlements.size ===
                                pendingSettlements.length &&
                              pendingSettlements.length > 0
                            }
                            onChange={toggleSelectAll}
                            className="h-4 w-4"
                          />
                        </TableHead>
                        <TableHead>Session ID</TableHead>
                        <TableHead>Merkle Root</TableHead>
                        <TableHead>Amount (ADA)</TableHead>
                        <TableHead>Operator Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSettlements.length > 0 ? (
                        pendingSettlements.map((settlement) => (
                          <TableRow key={settlement.sessionId}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedSettlements.has(
                                  settlement.sessionId
                                )}
                                onChange={() =>
                                  toggleSettlementSelection(
                                    settlement.sessionId
                                  )
                                }
                                className="h-4 w-4"
                                disabled={!settlement.merkleRoot}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {settlement.sessionId}
                            </TableCell>
                            <TableCell className="font-mono text-xs max-w-xs truncate">
                              {settlement.merkleRoot ? (
                                <span className="text-green-500">
                                  {settlement.merkleRoot.substring(0, 16)}...
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  Not computed
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {settlement.amount.toFixed(2)} ADA
                            </TableCell>
                            <TableCell className="font-mono text-xs max-w-xs truncate">
                              {settlement.operatorAddress}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-4 text-muted-foreground"
                          >
                            No eligible sessions for settlement
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Settlement Preview */}
                {settlementPreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Settlement Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            Total Amount
                          </p>
                          <p className="font-mono text-sm">
                            {settlementPreview.totalAmount} ADA
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            Platform Fee (1%)
                          </p>
                          <p className="font-mono text-sm">
                            {settlementPreview.fee} ADA
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">
                            Operator Payout
                          </p>
                          <p className="font-mono text-sm">
                            {settlementPreview.payout} ADA
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Sessions Included
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(selectedSettlements).map((id) => (
                            <Badge
                              key={id}
                              variant="secondary"
                              className="font-mono text-xs"
                            >
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Metadata Preview
                        </p>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-32">
                          {JSON.stringify(
                            settlementPreview.metadataPreview,
                            null,
                            2
                          )}
                        </pre>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <p className="mb-1">🔒 Security Notes:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Fee is enforced server-side (1%)</li>
                          <li>All sessions must have computed Merkle roots</li>
                          <li>
                            Transaction metadata includes tamper-proof audit
                            trail
                          </li>
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={signAndSubmitTransaction}
                          disabled={isSubmitting || !walletAddress}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 mr-2" />
                              Sign & Submit with Lucid
                            </>
                          )}
                        </Button>
                        <Button variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          Export Receipt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Batch Info Display */}
                {batchInfo && (
                  <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-amber-700">
                            Batch Processing Required
                          </p>
                          <p className="text-sm text-amber-600 mt-1">
                            {batchInfo.message}. This will require{" "}
                            {batchInfo.batchCount} separate transactions.
                          </p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-amber-700">
                              Total Sessions: {batchInfo.totalSessions}
                            </span>
                            <span className="text-amber-700">
                              Batches: {batchInfo.batchCount}
                            </span>
                            <span className="text-amber-700">
                              Per Batch: {batchInfo.batchSize}
                            </span>
                          </div>

                          {batchTransactions.length > 0 && (
                            <div className="mt-3 text-xs">
                              <p className="font-medium mb-1">Batch Details:</p>
                              <ul className="list-disc pl-5 space-y-1">
                                {batchTransactions.map(
                                  (tx: any, index: number) => (
                                    <li key={index}>
                                      Batch {tx.batchId}: {tx.sessionIds.length}{" "}
                                      sessions,
                                      {tx.totalAmount} ADA total, {tx.fee} ADA
                                      fee
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Generate Settlement Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={generateSettlementPreview}
                    disabled={selectedSettlements.size === 0 || isGenerating}
                    className="flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4" />
                        Generate Settlement
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Audit & Proofs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>DB-Sync Indexer + Merkle Verifier</CardTitle>
                <CardDescription>
                  High-speed audit interface for regulators & compliance teams
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Search by Tx / Session / Merkle Root
                    </CardTitle>
                    <CardDescription>
                      Instant proof retrieval (&lt;200ms via DB-sync)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter Session ID, Tx Hash, or Merkle Root..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAuditTabSearchClick()
                          }
                        />
                        <Button
                          onClick={handleAuditTabSearchClick}
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Searching...
                            </>
                          ) : (
                            "Search"
                          )}
                        </Button>
                      </div>

                      {auditSearchResult && (
                        <div className="bg-muted p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Search Results</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Session ID:
                              </span>
                              <span className="font-mono">
                                {auditSearchResult.sessionId}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Merkle Root:
                              </span>
                              <span className="font-mono text-xs">
                                {auditSearchResult.merkleRoot}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Tx Hash:
                              </span>
                              <span className="font-mono text-xs">
                                {auditSearchResult.txHash}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Timestamp:
                              </span>
                              <span>
                                {new Date(
                                  auditSearchResult.timestamp
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Operator:
                              </span>
                              <span>
                                {auditSearchResult.metadata?.["721"]
                                  ?.operator || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Wallet Signer:
                              </span>
                              <span className="font-mono text-xs">
                                {auditSearchResult.walletSigner || "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Amount:
                              </span>
                              <span>
                                {auditSearchResult.metadata?.["721"]?.amount ||
                                  "N/A"}
                              </span>
                            </div>
                          </div>

                          {/* Audit Trail */}
                          {auditSearchResult.auditTrail && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Audit Trail</h4>
                              <div className="space-y-1">
                                {auditSearchResult.auditTrail.map(
                                  (trail: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex justify-between text-xs"
                                    >
                                      <span className="text-muted-foreground">
                                        {trail.action}
                                      </span>
                                      <span>
                                        {new Date(
                                          trail.timestamp
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Verification Tool */}
                <Card>
                  <CardHeader>
                    <CardTitle>Merkle Proof Verification</CardTitle>
                    <CardDescription>
                      Verify log entry against Merkle path and root
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Log Entry</label>
                      <Input
                        placeholder="Enter log entry data..."
                        value={logEntry}
                        onChange={(e) => setLogEntry(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Merkle Proof Path (JSON)
                      </label>
                      <textarea
                        className="w-full h-32 p-3 bg-muted border border-border rounded-md font-mono text-xs"
                        placeholder='[{"hash": "0x...", "direction": "left"}, ...]'
                        value={merklePath}
                        onChange={(e) => setMerklePath(e.target.value)}
                      />
                    </div>

                    {verificationResult && (
                      <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              Verification Result
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {verificationResult.message}
                            </p>
                          </div>
                          <Badge
                            className={
                              verificationResult.verified
                                ? "gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : "gap-1 bg-red-500/10 text-red-500 border border-red-500/20"
                            }
                          >
                            {verificationResult.verified ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Verified
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Failed
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Computed Hash:
                            </span>
                            <span className="font-mono text-xs">
                              {verificationResult.computedHash}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleVerifyProof}>
                        Verify Proof
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={handleViewOnBlockfrost}
                      >
                        View on Blockfrost
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Export Tools</CardTitle>
                    <CardDescription>
                      Download proof documents for regulators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleExportJSON}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Proof JSON
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleExportPDF}
                        disabled={!auditSearchResult}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settlement History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Settlement History</CardTitle>
                <CardDescription>
                  Recent settlement transactions processed on Cardano
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={handleExportSettlementsCSV}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Settlement ID</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead className="text-right">Amount (ADA)</TableHead>
                  <TableHead className="text-right">Fee (ADA)</TableHead>
                  <TableHead>Tx Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlementHistory.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell className="font-medium">
                      {settlement.id}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {settlement.sessionId}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {settlement.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {settlement.fee.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">
                          {settlement.txHash.substring(0, 8)}...
                          {settlement.txHash.substring(
                            settlement.txHash.length - 8
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(settlement.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(settlement.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(settlement.txHash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => viewOnExplorer(settlement.txHash)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() =>
                            handleExportSettlementReceipt(settlement)
                          }
                        >
                          <Printer className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {settlementHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No settlement history found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
