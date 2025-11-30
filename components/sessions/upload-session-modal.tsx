"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadSessionModal({
  open,
  onOpenChange,
}: UploadSessionModalProps) {
  const [sessionJson, setSessionJson] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!sessionJson) {
      toast({
        title: "Error",
        description: "Please enter session JSON data",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const sessionData = JSON.parse(sessionJson);

      // Validate required fields
      if (!sessionData.sessionId) {
        throw new Error("Session ID is required");
      }

      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          payload: sessionData,
          playerWallet: sessionData.playerWallet,
          gameType: sessionData.gameType,
          amount: sessionData.amount,
          result: sessionData.result,
          signature: sessionData.signature,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload session");
      }

      setUploadResult(result);
      toast({
        title: "Success",
        description: "Session uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCID = () => {
    if (uploadResult?.cid) {
      navigator.clipboard.writeText(uploadResult.cid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSessionJson("");
    setUploadResult(null);
    setCopied(false);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Session to IPFS
          </DialogTitle>
          <DialogDescription>
            Store game session data in decentralized storage and get a content
            identifier (CID)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!uploadResult ? (
            <>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Session JSON Data</CardTitle>
                  <CardDescription>
                    Paste your complete session JSON data for decentralized
                    storage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        id="sessionJson"
                        placeholder='{ "sessionId": "SESS-001", "playerWallet": "addr1...", "gameType": "blackjack", "amount": "100", "result": "win", ... }'
                        value={sessionJson}
                        onChange={(e) => setSessionJson(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste your complete session JSON data. Maximum size: 1MB
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-blue-50/50">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    About IPFS Storage
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Uploading to IPFS creates a permanent, decentralized record
                    of this session. The resulting CID can be referenced
                    on-chain for verification purposes.
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Upload className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload to IPFS
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Card className="border-primary/50 bg-primary/5 animate-in fade-in-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Check className="w-5 h-5 text-green-500" />
                    Upload Successful
                  </CardTitle>
                  <CardDescription>
                    Session data has been stored in decentralized storage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Session ID</p>
                    <p className="text-sm font-mono bg-secondary p-2 rounded">
                      {uploadResult.sessionId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">IPFS CID</p>
                    <div className="flex gap-2">
                      <code className="flex-1 text-sm bg-secondary p-2 rounded break-all">
                        {uploadResult.cid}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCID}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Session Hash</p>
                    <p className="text-sm font-mono bg-secondary p-2 rounded break-all">
                      {uploadResult.sessionHash}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Player Wallet</p>
                      <p className="text-sm font-mono bg-secondary p-2 rounded truncate">
                        {uploadResult.playerWallet || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Game Type</p>
                      <p className="text-sm font-mono bg-secondary p-2 rounded">
                        {uploadResult.gameType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Amount</p>
                      <p className="text-sm font-mono bg-secondary p-2 rounded">
                        {uploadResult.amount || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Result</p>
                      <p className="text-sm font-mono bg-secondary p-2 rounded">
                        {uploadResult.result || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Next Steps
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      This session is now stored permanently on IPFS. You can
                      reference the CID in settlement transactions or share it
                      for verification purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
