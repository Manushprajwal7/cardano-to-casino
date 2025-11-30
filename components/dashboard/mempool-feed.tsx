"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface MempoolEvent {
  id: string;
  type: "block" | "transaction" | "mempool";
  hash: string;
  timestamp: string;
  size?: number;
  fees?: number;
}

export function MempoolFeed() {
  const [events, setEvents] = useState<MempoolEvent[]>([
    {
      id: "1",
      type: "block",
      hash: "b7a9a8f8c8e8d8c8b8a89878584838281808f8e8d8c8b8a89878584838281808",
      timestamp: new Date(Date.now() - 10000).toISOString(),
      size: 1200,
    },
    {
      id: "2",
      type: "transaction",
      hash: "t7a9a8f8c8e8d8c8b8a89878584838281808f8e8d8c8b8a89878584838281808",
      timestamp: new Date(Date.now() - 30000).toISOString(),
      fees: 0.168231,
    },
    {
      id: "3",
      type: "mempool",
      hash: "m7a9a8f8c8e8d8c8b8a89878584838281808f8e8d8c8b8a89878584838281808",
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
  ]);

  // Simulate new events coming in
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent: MempoolEvent = {
        id: Math.random().toString(36).substring(7),
        type: ["block", "transaction", "mempool"][
          Math.floor(Math.random() * 3)
        ] as "block" | "transaction" | "mempool",
        hash:
          Math.random().toString(36).substring(2, 30) +
          Math.random().toString(36).substring(2, 30),
        timestamp: new Date().toISOString(),
        size: Math.floor(Math.random() * 2000),
        fees: Math.random() * 0.5,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]); // Keep only last 20 events
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "block":
        return <Badge className="bg-green-500">Block</Badge>;
      case "transaction":
        return <Badge className="bg-blue-500">TX</Badge>;
      case "mempool":
        return <Badge className="bg-yellow-500">Mempool</Badge>;
      default:
        return <Badge className="bg-gray-500">Event</Badge>;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Live Network Feed</CardTitle>
        <CardDescription>
          Real-time updates from Cardano network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/50"
              >
                <div className="mt-0.5">{getTypeBadge(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate text-muted-foreground">
                    {event.hash.substring(0, 12)}...
                    {event.hash.substring(event.hash.length - 8)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {event.size && (
                      <span className="text-xs text-muted-foreground">
                        {event.size} bytes
                      </span>
                    )}
                    {event.fees && (
                      <span className="text-xs text-muted-foreground">
                        {event.fees.toFixed(6)} ADA fees
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
