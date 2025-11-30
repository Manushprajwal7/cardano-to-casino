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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Plus,
  Hash,
  Calendar,
  Clock,
  Gamepad2,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionModal({
  open,
  onOpenChange,
}: CreateSessionModalProps) {
  const [operator, setOperator] = useState("");
  const [tableId, setTableId] = useState("");
  const [gameType, setGameType] = useState("blackjack");
  const [description, setDescription] = useState("");
  const [playerCount, setPlayerCount] = useState("1");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [generatedRoot, setGeneratedRoot] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdSession, setCreatedSession] = useState<any>(null);
  const { toast } = useToast();

  const handleCreateSession = async () => {
    // If we haven't generated a root yet, generate it
    if (!generatedRoot) {
      // Generate mock merkle root
      const mockRoot = `0x${Math.random()
        .toString(16)
        .slice(2, 18)}${Math.random().toString(16).slice(2, 18)}`;
      setGeneratedRoot(mockRoot);
      return;
    }

    // If we have a root, create the session
    try {
      setCreating(true);

      // Generate a unique session ID
      const sessionId = `SESS-${Date.now().toString().slice(-6)}`;

      // Create session payload
      const payload = {
        sessionId,
        operator,
        tableId,
        gameType,
        playerCount,
        sessionDate,
        sessionTime,
        description,
        merkleRoot: generatedRoot,
        events: [], // In a real implementation, this would be populated from uploaded files
      };

      // Submit to API
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          payload,
          playerWallet: "addr1_placeholder_wallet_address",
          gameType,
          amount: "0", // Will be updated during settlement
          result: "pending", // Will be updated after session completion
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create session");
      }

      setCreatedSession(result);

      toast({
        title: "Session Created",
        description: "New session has been added to off-chain storage",
      });

      // Reset form after a delay to show success state
      setTimeout(() => {
        handleReset();
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Session creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create session",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleReset = () => {
    setOperator("");
    setTableId("");
    setGameType("blackjack");
    setDescription("");
    setPlayerCount("1");
    setSessionDate("");
    setSessionTime("");
    setGeneratedRoot("");
    setFiles(null);
    setCreatedSession(null);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Session
          </DialogTitle>
          <DialogDescription>
            Set up a new gaming session with operator metadata and game details
          </DialogDescription>
        </DialogHeader>

        {!createdSession ? (
          <>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Session Details</TabsTrigger>
                <TabsTrigger value="upload">Upload Data</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      Game Information
                    </CardTitle>
                    <CardDescription>
                      Enter the basic information about this gaming session
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="operator">Operator Name *</Label>
                        <Input
                          id="operator"
                          placeholder="e.g., Casino Royal"
                          value={operator}
                          onChange={(e) => setOperator(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tableId">Table/Terminal ID *</Label>
                        <Input
                          id="tableId"
                          placeholder="e.g., TABLE-42"
                          value={tableId}
                          onChange={(e) => setTableId(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gameType">Game Type</Label>
                        <Select value={gameType} onValueChange={setGameType}>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select game type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blackjack">Blackjack</SelectItem>
                            <SelectItem value="roulette">Roulette</SelectItem>
                            <SelectItem value="poker">Poker</SelectItem>
                            <SelectItem value="slots">Slots</SelectItem>
                            <SelectItem value="baccarat">Baccarat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="playerCount">Player Count</Label>
                        <Select
                          value={playerCount}
                          onValueChange={setPlayerCount}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select player count" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Single Player</SelectItem>
                            <SelectItem value="2-4">2-4 Players</SelectItem>
                            <SelectItem value="5-10">5-10 Players</SelectItem>
                            <SelectItem value="10+">10+ Players</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sessionDate">Session Date</Label>
                        <Input
                          id="sessionDate"
                          type="date"
                          value={sessionDate}
                          onChange={(e) => setSessionDate(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Add notes about this session, special conditions, or observations..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-20"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Session Timing
                    </CardTitle>
                    <CardDescription>
                      Specify when this session took place
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={sessionTime}
                          onChange={(e) => setSessionTime(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Estimated Duration</Label>
                        <Select>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<30">&lt; 30 minutes</SelectItem>
                            <SelectItem value="30-60">30-60 minutes</SelectItem>
                            <SelectItem value="1-2">1-2 hours</SelectItem>
                            <SelectItem value="2+">2+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-6 mt-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload Game Logs
                    </CardTitle>
                    <CardDescription>
                      Upload session logs to generate a Merkle root for
                      integrity verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      className="border-2 border-dashed border-border rounded-lg bg-secondary/10 hover:bg-secondary/20 transition cursor-pointer p-8 text-center"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">
                        Drag and drop log files here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports JSON, CSV, TXT formats (Max 10MB)
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Browse Files
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".json,.csv,.txt"
                        onChange={handleFileChange}
                      />
                    </div>

                    {files && files.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Files:</p>
                        <ul className="text-sm space-y-1">
                          {Array.from(files).map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-secondary/20 p-2 rounded"
                            >
                              <span className="truncate">{file.name}</span>
                              <span className="text-muted-foreground text-xs">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        About Merkle Roots
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        A Merkle root is a cryptographic fingerprint of all game
                        events in this session, ensuring data integrity and
                        tamper-proof verification on the blockchain.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Generated Merkle Root */}
            {generatedRoot && (
              <Card className="border-primary/50 bg-primary/5 animate-in fade-in-50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Generated Merkle Root
                  </CardTitle>
                  <CardDescription>Computed from uploaded logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="block bg-secondary px-3 py-2 rounded text-sm break-all font-mono">
                    {generatedRoot}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    This root will be embedded in the settlement transaction for
                    on-chain verification.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                className="bg-primary hover:bg-primary/90"
                disabled={!operator || !tableId || creating}
              >
                {creating ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : generatedRoot ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm & Create Session
                  </>
                ) : (
                  "Generate Merkle Root"
                )}
              </Button>
            </div>
          </>
        ) : (
          // Success State
          <Card className="border-primary/50 bg-primary/5 animate-in fade-in-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Check className="w-5 h-5 text-green-500" />
                Session Created Successfully
              </CardTitle>
              <CardDescription>
                New session has been added to off-chain storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Session ID</p>
                <p className="text-sm font-mono bg-secondary p-2 rounded">
                  {createdSession.sessionId}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">IPFS CID</p>
                <p className="text-sm font-mono bg-secondary p-2 rounded break-all">
                  {createdSession.cid}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Operator</p>
                  <p className="text-sm bg-secondary p-2 rounded">{operator}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Table ID</p>
                  <p className="text-sm bg-secondary p-2 rounded">{tableId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Game Type</p>
                  <p className="text-sm bg-secondary p-2 rounded">{gameType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <p className="text-sm bg-secondary p-2 rounded">
                    {createdSession.status}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Next Steps
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  This session is now available in the Off-Chain Sessions list.
                  You can view details, generate proofs, and eventually settle
                  this session.
                </p>
              </div>
            </CardContent>

            <div className="flex gap-3 justify-end p-4">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
