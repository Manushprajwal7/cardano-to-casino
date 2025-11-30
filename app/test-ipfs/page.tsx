"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function IPFSTestPage() {
  const [testData, setTestData] = useState({
    sessionId: "TEST-001",
    playerWallet: "addr_test1...",
    gameType: "blackjack",
    amount: "100 ADA",
    result: "win",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const testIPFSUpload = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: testData.sessionId,
          payload: testData,
          playerWallet: testData.playerWallet,
          gameType: testData.gameType,
          amount: testData.amount,
          result: testData.result,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Test error:", error);
      setResult({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSimpleUpload = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-ipfs");
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Test error:", error);
      setResult({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            IPFS Integration Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the IPFS/Pinata integration for storing session data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Test Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionId">Session ID</Label>
                <Input
                  id="sessionId"
                  name="sessionId"
                  value={testData.sessionId}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerWallet">Player Wallet</Label>
                <Input
                  id="playerWallet"
                  name="playerWallet"
                  value={testData.playerWallet}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameType">Game Type</Label>
                <Input
                  id="gameType"
                  name="gameType"
                  value={testData.gameType}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  value={testData.amount}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="result">Result</Label>
                <Input
                  id="result"
                  name="result"
                  value={testData.result}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button
                  onClick={testIPFSUpload}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Uploading..." : "Upload Session to IPFS"}
                </Button>

                <Button
                  variant="outline"
                  onClick={testSimpleUpload}
                  disabled={loading}
                >
                  Simple Test
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-secondary p-4 rounded-lg">
                    <pre className="text-xs overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>

                  {result.cid && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">CID: {result.cid}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const gatewayUrl =
                            result.ipfsGatewayUrl ||
                            `https://ipfs.io/ipfs/${result.cid}`;
                          window.open(gatewayUrl, "_blank");
                        }}
                      >
                        View on IPFS
                      </Button>
                    </div>
                  )}

                  {result.success === false && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-destructive text-sm">
                        {result.message || result.error}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Run a test to see results here
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
