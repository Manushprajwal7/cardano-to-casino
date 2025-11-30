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
import { Copy, ExternalLink } from "lucide-react";

interface Transaction {
  hash: string;
  fee: string;
  timestamp: string;
  block: number;
  amount?: string;
  status?: string;
}

interface RecentActivityTableProps {
  transactions?: Transaction[];
}

const recentActivities = [
  {
    id: "SESS-001",
    amount: "2,450.50",
    fee: "24.51",
    txHash: "c5f8d9a2b3...e1k9",
    status: "settled",
    timestamp: "2 hours ago",
  },
  {
    id: "SESS-002",
    amount: "1,200.00",
    fee: "12.00",
    txHash: "a1b2c3d4e5...f6g7",
    status: "settled",
    timestamp: "4 hours ago",
  },
  {
    id: "SESS-003",
    amount: "3,100.75",
    fee: "31.01",
    txHash: "x9y8z7w6v5...u4t3",
    status: "pending",
    timestamp: "6 hours ago",
  },
  {
    id: "SESS-004",
    amount: "890.25",
    fee: "8.90",
    txHash: "m2n3o4p5q6...r7s8",
    status: "settled",
    timestamp: "1 day ago",
  },
  {
    id: "SESS-005",
    amount: "5,670.00",
    fee: "56.70",
    txHash: "p5q6r7s8t9...u0v1",
    status: "settled",
    timestamp: "1 day ago",
  },
  {
    id: "SESS-006",
    amount: "1,850.25",
    fee: "18.50",
    txHash: "w2x3y4z5a6...b7c8",
    status: "settled",
    timestamp: "2 days ago",
  },
  {
    id: "SESS-007",
    amount: "4,200.50",
    fee: "42.01",
    txHash: "d9e8f7g6h5...i4j3",
    status: "pending",
    timestamp: "2 days ago",
  },
  {
    id: "SESS-008",
    amount: "950.75",
    fee: "9.51",
    txHash: "k1l2m3n4o5...p6q7",
    status: "settled",
    timestamp: "3 days ago",
  },
];

export function RecentActivityTable({
  transactions,
}: RecentActivityTableProps) {
  const activities = transactions || recentActivities;

  const viewOnExplorer = (hash: string) => {
    const baseUrl = "https://cardanoscan.io/transaction/";
    window.open(`${baseUrl}${hash}`, "_blank");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Recent Settlement Activity</CardTitle>
        <CardDescription>
          Latest transactions processed on Cardano
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Session ID</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Fee</TableHead>
              <TableHead>Tx Hash</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity: any, index: number) => (
              <TableRow key={index} className="border-border">
                <TableCell className="font-medium text-primary">
                  SESS-{String(index + 1).padStart(3, "0")}
                </TableCell>
                <TableCell className="text-right">
                  {activity.amount ? `${activity.amount} ADA` : "N/A"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {activity.fee
                    ? `${(parseInt(activity.fee) / 1000000).toFixed(6)} ADA`
                    : "N/A"}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <code className="text-xs bg-secondary px-2 py-1 rounded">
                    {activity.hash
                      ? `${activity.hash.substring(
                          0,
                          12
                        )}...${activity.hash.substring(
                          activity.hash.length - 8
                        )}`
                      : "N/A"}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      activity.hash && copyToClipboard(activity.hash)
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() =>
                      activity.hash && viewOnExplorer(activity.hash)
                    }
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      activity.status === "settled" ? "default" : "secondary"
                    }
                  >
                    {activity.status || "confirmed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {activity.timestamp
                    ? new Date(activity.timestamp).toLocaleString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
