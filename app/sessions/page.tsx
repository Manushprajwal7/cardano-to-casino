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
                There are currently no gaming sessions in the system. Create a
                new session or upload an existing one to get started.
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
      </div>
    </div>
  );
}
