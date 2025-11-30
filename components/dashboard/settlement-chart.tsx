"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Generate mock data for the last 30 days
const generateMockData = () => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: Math.floor(Math.random() * 10000) + 5000, // Random amount between 5000-15000 ADA
    });
  }

  return data;
};

const data = generateMockData();

export function SettlementChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>ADA Volume Over Time</CardTitle>
        <CardDescription>ADA settled over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={{
            amount: {
              label: "Amount (ADA)",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px] w-full"
        >
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-muted-foreground)"
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground"
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-chart-1)"
                  dot={false}
                  strokeWidth={2}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
