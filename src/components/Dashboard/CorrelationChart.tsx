import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useCVEData } from "@/hooks/useCVEData";

export const CorrelationChart = () => {
  const { data: energyData, isLoading: energyLoading } = useEnergyPrices();
  const { data: cveData, isLoading: cveLoading } = useCVEData();

  // Generate 24h historical data with variation
  const generateHistoricalData = () => {
    if (!energyData?.energyPrices) return [];
    
    const avgPrice = energyData.energyPrices.reduce((sum, p) => sum + p.price, 0) / energyData.energyPrices.length;
    const cyberBase = cveData?.cisaKev?.filter(c => c.severity === "critical").length || 10;
    const geoBase = 60;
    
    return [
      { time: "00:00", price: avgPrice * 0.85, cyber: cyberBase * 0.5, geo: geoBase * 0.4 },
      { time: "04:00", price: avgPrice * 0.88, cyber: cyberBase * 0.6, geo: geoBase * 0.45 },
      { time: "08:00", price: avgPrice * 0.92, cyber: cyberBase * 0.75, geo: geoBase * 0.5 },
      { time: "12:00", price: avgPrice * 0.96, cyber: cyberBase * 0.9, geo: geoBase * 0.65 },
      { time: "16:00", price: avgPrice * 1.02, cyber: cyberBase * 1.0, geo: geoBase * 0.85 },
      { time: "20:00", price: avgPrice * 1.05, cyber: cyberBase * 1.1, geo: geoBase * 0.95 },
      { time: "Now", price: avgPrice, cyber: cyberBase * 1.2, geo: geoBase },
    ];
  };

  const data = generateHistoricalData();

  if (energyLoading || cveLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Risk Correlation - 24h View
        </h3>
        <Skeleton className="w-full h-[300px]" />
      </Card>
    );
  }

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
