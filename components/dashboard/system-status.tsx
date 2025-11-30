import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface SystemStatusProps {
  healthData?: {
    networkStatus: string;
    statusColor: string;
    apiResponseTime: number;
    blockfrostHealth: string;
  };
}

export function SystemStatusWidgets({ healthData }: SystemStatusProps) {
  // Default values for when no health data is provided
  const status = healthData?.networkStatus || "healthy";
  const statusColor = healthData?.statusColor || "green";
  const responseTime = healthData?.apiResponseTime || 0;
  const blockfrostHealth = healthData?.blockfrostHealth || "online";

  const getStatusIcon = (color: string) => {
    if (color === "red") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (color === "yellow") {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  };

  const getStatusBadge = (status: string, color: string) => {
    const variant =
      color === "red"
        ? "destructive"
        : color === "yellow"
        ? "secondary"
        : "default";
    return (
      <Badge variant={variant} className="text-xs">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Blockfrost API */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(statusColor)}
              <span className="text-sm">Blockfrost API</span>
            </div>
            {getStatusBadge(blockfrostHealth, statusColor)}
          </div>

          {/* Cardano Network */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(statusColor)}
              <span className="text-sm">Cardano Network</span>
            </div>
            {getStatusBadge(status, statusColor)}
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`w-4 h-4 ${
                  statusColor === "red"
                    ? "text-red-500"
                    : statusColor === "yellow"
                    ? "text-yellow-500"
                    : "text-green-500"
                }`}
              />
              <span className="text-sm">Response Time</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {responseTime > 0 ? `${responseTime}ms` : "N/A"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Rate Limit - Placeholder */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">API Quota</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Blockfrost Calls
                </span>
                <span className="text-xs font-medium">8,450 / 10,000</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "84.5%" }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
