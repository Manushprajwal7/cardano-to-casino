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
  BarChart,
  Bar,
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
      fees: Math.floor(Math.random() * 200) + 50, // Random fees between 50-250 ADA
    });
  }

  return data;
};

const data = generateMockData();

export function FeesChart() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Platform Fee Revenue</CardTitle>
        <CardDescription>
          Platform fees collected over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={{
            fees: {
              label: "Fees (ADA)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px] w-full"
        >
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
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
                  stroke="var(--color-muted-foreground)"
                  tickMargin={10}
                  tick={{ fontSize: 12 }}
                  width={60}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="fees"
                  fill="var(--color-chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
