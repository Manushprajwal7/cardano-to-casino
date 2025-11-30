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
} from "@/lib/lucid-utils";
import { toast } from "sonner";

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("session");
  const [pendingSettlements, setPendingSettlements] = useState<any[]>([]);
  const [settlementHistory, setSettlementHistory] = useState<any[]>([]);
  const [selectedSettlements, setSelectedSettlements] = useState<Set<string>>(
    new Set()
  );
  const [settlementPreview, setSettlementPreview] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [batchTransactions, setBatchTransactions] = useState<any[]>([]);

  // Audit & Proofs states
  const [auditSearchResult, setAuditSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [logEntry, setLogEntry] = useState("");
  const [merklePath, setMerklePath] = useState(`[
  {"hash": "0xabc123...", "direction": "left"},
  {"hash": "0xdef456...", "direction": "right"},
  {"hash": "0x789ghi...", "direction": "left"}
]`);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle audit search
  const handleAuditSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      toast.error("Please enter a search term");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/audit/search?query=${encodeURIComponent(query)}`
      );

      if (response.ok) {
        const data = await response.json();
        setAuditSearchResult(data);
        toast.success(
          `Found audit data for ${data.sessionId || data.txHash || "item"}`
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "No matching settlement found");
        setAuditSearchResult(null);
      }
    } catch (error) {
      console.error("Audit search error:", error);
      toast.error("Failed to search audit data");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle proof verification
  const handleVerifyProof = async () => {
    if (!logEntry.trim() || !merklePath.trim()) {
      toast.error("Please enter log entry and Merkle path");
      return;
    }

    if (!auditSearchResult?.merkleRoot) {
      toast.error("Please search for a session first to get the Merkle root");
      return;
    }

    try {
      let parsedMerklePath;
      try {
        parsedMerklePath = JSON.parse(merklePath);
      } catch (parseError) {
        toast.error("Invalid JSON in Merkle path");
        return;
      }

      const requestBody = {
        logEntry: logEntry,
        merklePath: parsedMerklePath,
        merkleRoot: auditSearchResult.merkleRoot,
      };

      const response = await fetch("/api/audit/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationResult(data);

        if (data.verified) {
          toast.success("✅ Proof verified successfully!");
        } else {
          toast.error("❌ Proof verification failed");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to verify proof");
      }
    } catch (error) {
      console.error("Proof verification error:", error);
      toast.error("Failed to verify proof");
    }
  };

  // Handle view on Blockfrost
  const handleViewOnBlockfrost = () => {
    if (auditSearchResult?.txHash) {
      window.open(
        `https://blockfrost.io/projects/mainnet/transactions/${auditSearchResult.txHash}`,
        "_blank"
      );
    } else {
      toast.error("No transaction hash available");
    }
  };

  // Handle export JSON
  const handleExportJSON = () => {
    if (!auditSearchResult) {
      toast.error("No audit data to export");
      return;
    }

    // Create a more comprehensive JSON structure
    const exportData = {
      auditReport: {
        sessionInfo: {
          sessionId: auditSearchResult.sessionId,
          merkleRoot: auditSearchResult.merkleRoot,
          txHash: auditSearchResult.txHash,
          timestamp: auditSearchResult.timestamp,
          operator: auditSearchResult.metadata?.["721"]?.operator,
          walletSigner: auditSearchResult.walletSigner,
          amount: auditSearchResult.metadata?.["721"]?.amount,
        },
        verification: verificationResult,
        metadata: auditSearchResult.metadata,
        auditTrail: auditSearchResult.auditTrail,
        exportTimestamp: new Date().toISOString(),
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-proof-${auditSearchResult.sessionId || "data"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Proof JSON exported successfully!");
  };

  // Handle export PDF
  const handleExportPDF = () => {
    if (!auditSearchResult) {
      toast.error("No audit data to export");
      return;
    }

    // Generate a more structured report content
    const content = `
AUDIT PROOF REPORT
=================

Session ID: ${auditSearchResult.sessionId || "N/A"}
Merkle Root: ${auditSearchResult.merkleRoot || "N/A"}
Transaction Hash: ${auditSearchResult.txHash || "N/A"}
Timestamp: ${
      auditSearchResult.timestamp
        ? new Date(auditSearchResult.timestamp).toLocaleString()
        : "N/A"
    }
Operator: ${auditSearchResult.metadata?.["721"]?.operator || "N/A"}
Wallet Signer: ${auditSearchResult.walletSigner || "N/A"}
Amount: ${auditSearchResult.metadata?.["721"]?.amount || "N/A"}

VERIFICATION STATUS: ${
      verificationResult?.verified ? "✅ VERIFIED" : "❌ NOT VERIFIED"
    }
Verification Message: ${verificationResult?.message || "N/A"}
Computed Hash: ${verificationResult?.computedHash || "N/A"}

Metadata:
${JSON.stringify(auditSearchResult.metadata || {}, null, 2)}

Audit Trail:
${
  auditSearchResult.auditTrail
    ? auditSearchResult.auditTrail
        .map(
          (trail: any) =>
            `${trail.action} - ${new Date(
              trail.timestamp
            ).toLocaleString()} - ${trail.actor}`
        )
        .join("\n")
    : "N/A"
}

Generated on: ${new Date().toLocaleString()}
`;

    const dataBlob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-report-${auditSearchResult.sessionId || "data"}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("PDF report exported successfully!");
  };

  // Mock data for export
  const mockAuditData = [
    {
      id: "SES-001",
      verified: true,
      operator: "Casino A",
      time: "2024-01-15 14:32",
    },
    {
      id: "SES-002",
      verified: true,
      operator: "Casino B",
      time: "2024-01-15 13:15",
    },
    {
      id: "SES-003",
      verified: false,
      operator: "Casino C",
      time: "2024-01-15 12:45",
    },
    {
      id: "SES-004",
      verified: true,
      operator: "Casino A",
      time: "2024-01-15 11:20",
    },
  ];

  // Mock settlement history data
  const mockSettlementHistory = [
    {
      id: "SETT-001",
      sessionId: "SES-001",
      amount: 150.5,
      fee: 1.51,
      txHash:
        "7f192ffa95992f888b06353688ab9b1df32be4ede5c6476bc86a8369ee640b13",
      status: "settled",
      timestamp: "2024-01-15T14:30:00Z",
    },
    {
      id: "SETT-002",
      sessionId: "SES-002",
      amount: 75.25,
      fee: 0.75,
      txHash:
        "a1b2c3d4e5f67890123456789012345678901234567890123456789012345678",
      status: "settled",
      timestamp: "2024-01-15T13:45:00Z",
    },
    {
      id: "SETT-003",
      sessionId: "SES-004",
      amount: 200.0,
      fee: 2.0,
      txHash:
        "b2c3d4e5f6789012345678901234567890123456789012345678901234567890",
      status: "pending",
      timestamp: "2024-01-15T12:15:00Z",
    },
    {
      id: "SETT-004",
      sessionId: "SES-005",
      amount: 325.75,
      fee: 3.26,
      txHash:
        "c3d4e5f678901234567890123456789012345678901234567890123456789012",
      status: "settled",
      timestamp: "2024-01-15T11:30:00Z",
    },
  ];

  // Fetch pending settlements and settlement history
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending settlements
        const response = await fetch("/api/settlement-builder");
        if (response.ok) {
          const data = await response.json();
          setPendingSettlements(data);
        }

        // Set mock settlement history (in a real app, this would come from an API)
        setSettlementHistory(mockSettlementHistory);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load settlement data");
      }
    };

    fetchData();
  }, []);

  // Handle settlement selection
  const toggleSettlementSelection = (sessionId: string) => {
    const newSelected = new Set(selectedSettlements);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSettlements(newSelected);
  };

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "settled":
        return (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Check className="w-3 h-3" />
            Settled
          </Badge>
        );
      case "pending":
        return (
          <Badge className="gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  // View on explorer function
  const viewOnExplorer = (txHash: string) => {
    // In a real app, this would open the Blockfrost explorer
    window.open(
      `https://blockfrost.io/projects/mainnet/transactions/${txHash}`,
      "_blank"
    );
  };

  // Export settlement receipt function
  const handleExportSettlementReceipt = (settlement: any) => {
    // Prepare receipt data
    const receiptData = {
      settlementId: settlement.id,
      sessionId: settlement.sessionId,
      amount: settlement.amount,
      fee: settlement.fee,
      txHash: settlement.txHash,
      status: settlement.status,
      timestamp: settlement.timestamp,
    };

    // Export using our utility function
    const result = exportSettlementReceipt(receiptData);

    if (result.success) {
      toast.success("Settlement receipt exported successfully!");
    } else {
      toast.error(`Failed to export receipt: ${result.error}`);
    }
  };

  // Export all settlements as CSV
  const handleExportSettlementsCSV = () => {
    const result = exportSettlementsCSV(settlementHistory);

    if (result.success) {
      toast.success("Settlements exported successfully!");
    } else {
      toast.error(`Failed to export settlements: ${result.error}`);
    }
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedSettlements.size === pendingSettlements.length) {
      setSelectedSettlements(new Set());
    } else {
      setSelectedSettlements(
        new Set(pendingSettlements.map((s) => s.sessionId))
      );
    }
  };

  // Generate settlement preview
  const generateSettlementPreview = async () => {
    if (selectedSettlements.size === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/settlement-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "preview",
          sessionIds: Array.from(selectedSettlements),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettlementPreview(data);
      }
    } catch (error) {
      console.error("Failed to generate settlement preview:", error);
      toast.error("Failed to generate settlement preview");
    } finally {
      setIsGenerating(false);
    }
  };

  // Real Lucid wallet signing and submission
  const signAndSubmitTransaction = async () => {
    if (!walletAddress) {
      toast.error("Please enter a wallet address");
      return;
    }

    if (selectedSettlements.size === 0) {
      toast.error("Please select at least one settlement");
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Get unsigned transaction
      const response = await fetch("/api/settlement-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submit",
          sessionIds: Array.from(selectedSettlements),
          walletAddress: walletAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to prepare transaction");
      }

      const result = await response.json();

      // Check if batch processing is required
      if (result.batchInfo) {
        setBatchInfo(result.batchInfo);
        setBatchTransactions(result.batchTransactions || []);
        toast.info(
          `Batch processing required: ${result.batchInfo.batchCount} transactions needed`
        );

        // For batch processing, we would need to handle multiple transactions
        // In a real implementation, you would process each batch transaction separately
        // For now, we'll just show the information
        console.log("Batch transactions:", result.batchTransactions);
      }

      const { unsignedTx } = result;

      // Step 2: Initialize Lucid and build transaction
      toast.info("Initializing Lucid wallet...");

      const lucid = await initLucid();
      if (!lucid) {
        throw new Error("Failed to initialize Lucid");
      }

      // Build and sign the transaction
      toast.info("Building and signing transaction...");

      const signedTx = await buildSettlementTransaction(
        lucid,
        unsignedTx.inputs,
        unsignedTx.outputs,
        unsignedTx.metadata
      );

      if (!signedTx) {
        throw new Error("Failed to build and sign transaction");
      }

      // Step 3: Submit the transaction
      toast.info("Submitting transaction to the network...");

      const txHash = await submitTransaction(lucid, signedTx);

      if (!txHash) {
        throw new Error("Failed to submit transaction");
      }

      // Step 4: Finalize settlements
      const finalizeResponse = await fetch("/api/settlement-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "finalize",
          sessionIds: Array.from(selectedSettlements),
          txHash: txHash,
        }),
      });

      if (!finalizeResponse.ok) {
        const error = await finalizeResponse.json();
        throw new Error(error.error || "Failed to finalize settlements");
      }

      // Success
      toast.success(
        `Settlement completed successfully! Tx Hash: ${txHash.substring(
          0,
          16
        )}...`
      );

      // Reset state
      setSelectedSettlements(new Set());
      setSettlementPreview(null);
      setBatchInfo(null);

      // Refresh settlements list
      const refreshResponse = await fetch("/api/settlement-builder");
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setPendingSettlements(data);
      }

      // Add to settlement history
      const newSettlement = {
        id: `SETT-${Date.now()}`,
        sessionId: Array.from(selectedSettlements).join(", "),
        amount: parseFloat(settlementPreview?.totalAmount || 0),
        fee: parseFloat(settlementPreview?.fee || 0),
        txHash: txHash,
        status: "settled",
        timestamp: new Date().toISOString(),
      };

      setSettlementHistory((prev) => [newSettlement, ...prev]);
    } catch (error) {
      console.error("Failed to complete settlement:", error);
      toast.error(
        `Settlement failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Search Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Proof Verification
                </CardTitle>
                <CardDescription>
                  Search by Session ID, Tx Hash, or Merkle Root
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => exportAuditData(mockAuditData)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Audit Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <Tabs
                  value={searchType}
                  onValueChange={setSearchType}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="session">Session ID</TabsTrigger>
                    <TabsTrigger value="txhash">Tx Hash</TabsTrigger>
                    <TabsTrigger value="merkle">Merkle Root</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      searchType === "session"
                        ? "Enter session ID..."
                        : searchType === "txhash"
                        ? "Enter transaction hash..."
                        : "Enter merkle root..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button>Search</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="verify" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verify">Verify Proof</TabsTrigger>
            <TabsTrigger value="history">Verification History</TabsTrigger>
            <TabsTrigger value="settlements">Settlements</TabsTrigger>
            <TabsTrigger value="audit">Audit & Proofs</TabsTrigger>
          </TabsList>

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
                  <Button className="flex-1">Verify Proof</Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
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
                      },
                      {
                        id: "SES-002",
                        verified: true,
                        operator: "Casino B",
                        time: "2024-01-15 13:15",
                      },
                      {
                        id: "SES-003",
                        verified: false,
                        operator: "Casino C",
                        time: "2024-01-15 12:45",
                      },
                      {
                        id: "SES-004",
                        verified: true,
                        operator: "Casino A",
                        time: "2024-01-15 11:20",
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
                            <Button size="sm" variant="ghost">
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
                            e.key === "Enter" && handleAuditSearch()
                          }
                        />
                        <Button
                          onClick={handleAuditSearch}
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
