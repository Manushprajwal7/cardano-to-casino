import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function KpiCard({ label, value, change, trend }: KpiCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}
            >
              {change}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
