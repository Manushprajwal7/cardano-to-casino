"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Download } from "lucide-react";
import Link from "next/link";

interface Session {
  sessionId: string;
  cid: string;
  timestamp: string;
  amount: string;
  result: string;
  playerWallet?: string;
  gameType?: string;
}

interface SessionsTableProps {
  sessions?: Session[];
}

const statusColors: Record<string, string> = {
  win: "default",
  lose: "destructive",
  open: "default",
  closed: "secondary",
  settled: "default",
  error: "destructive",
};

export function SessionsTable({ sessions }: SessionsTableProps) {
  const [copied, setCopied] = useState<string | null>(null);

  // Mock data if no sessions provided
  const mockSessions: Session[] = [
    {
      sessionId: "SESS-0001",
      cid: "QmXkf7CJcJd8hQ9Y1Z2vKp7n5X4m8sK2p1qL9nR3tY6uW1",
      timestamp: "2024-01-15T10:30:00Z",
      amount: "100 ADA",
      result: "win",
      playerWallet: "addr1q8...xyz",
      gameType: "blackjack",
    },
    {
      sessionId: "SESS-0002",
      cid: "QmYkg8B9DcFe1H3j4K5L6M7N8O9P0qR1sT2uV3wX4yZ5a2",
      timestamp: "2024-01-15T11:00:00Z",
      amount: "50 ADA",
      result: "lose",
      playerWallet: "addr1q9...abc",
      gameType: "roulette",
    },
  ];

  const sessionsData = sessions || mockSessions;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = async (cid: string, sessionId: string) => {
    try {
      // In a real implementation, this would fetch from IPFS
      // For now, we'll simulate with mock data
      const mockData = {
        sessionId,
        cid,
        timestamp: new Date().toISOString(),
        message: "This would be the actual session data fetched from IPFS",
      };

      const blob = new Blob([JSON.stringify(mockData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${sessionId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Off-Chain Sessions</CardTitle>
        <CardDescription>
          View, manage, and verify all gaming sessions stored in decentralized
          storage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Session ID</TableHead>
                <TableHead>CID (IPFS)</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsData.map((session) => (
                <TableRow key={session.sessionId} className="border-border">
                  <TableCell className="font-medium text-primary">
                    {session.sessionId}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <code className="text-xs bg-secondary px-2 py-1 rounded truncate max-w-[120px]">
                      {session.cid.substring(0, 6)}...
                      {session.cid.substring(session.cid.length - 4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(session.cid, session.sessionId)}
                    >
                      <Copy
                        className={`w-3 h-3 ${
                          copied === session.sessionId ? "text-green-500" : ""
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>{session.amount}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[session.result] as any}>
                      {session.result}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/sessions/${session.sessionId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 bg-transparent"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 bg-transparent"
                        onClick={() =>
                          handleDownload(session.cid, session.sessionId)
                        }
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
