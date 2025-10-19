import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { time: "00:00", price: 45, cyber: 30, geo: 25 },
  { time: "04:00", price: 46, cyber: 35, geo: 25 },
  { time: "08:00", price: 48, cyber: 45, geo: 30 },
  { time: "12:00", price: 52, cyber: 55, geo: 40 },
  { time: "16:00", price: 54, cyber: 60, geo: 50 },
  { time: "20:00", price: 56, cyber: 65, geo: 55 },
  { time: "Now", price: 58, cyber: 70, geo: 60 },
];

export const CorrelationChart = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Risk Correlation - 24h View
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Price Index"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cyber"
            stroke="hsl(var(--cyber))"
            strokeWidth={2}
            name="Cyber Risk"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="geo"
            stroke="hsl(var(--geopolitical))"
            strokeWidth={2}
            name="Geo Risk"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
