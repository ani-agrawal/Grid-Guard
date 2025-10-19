import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ForecastData {
  time: string;
  actual?: number;
  forecast: number;
  confidenceHigh: number;
  confidenceLow: number;
  baseCase: number;
  bullCase: number;
  bearCase: number;
}

const nowcastData: ForecastData[] = [
  { time: "Now", actual: 46.8, forecast: 46.8, confidenceHigh: 47.2, confidenceLow: 46.4, baseCase: 46.8, bullCase: 47.5, bearCase: 46.2 },
  { time: "+6h", forecast: 47.2, confidenceHigh: 48.1, confidenceLow: 46.3, baseCase: 47.2, bullCase: 48.5, bearCase: 46.0 },
  { time: "+12h", forecast: 47.8, confidenceHigh: 49.2, confidenceLow: 46.4, baseCase: 47.8, bullCase: 49.8, bearCase: 45.8 },
  { time: "+18h", forecast: 48.3, confidenceHigh: 50.0, confidenceLow: 46.6, baseCase: 48.3, bullCase: 51.2, bearCase: 45.5 },
  { time: "+24h", forecast: 48.9, confidenceHigh: 51.2, confidenceLow: 46.6, baseCase: 48.9, bullCase: 52.5, bearCase: 45.3 },
  { time: "+48h", forecast: 49.3, confidenceHigh: 52.8, confidenceLow: 45.8, baseCase: 49.3, bullCase: 54.2, bearCase: 44.5 },
  { time: "+72h", forecast: 49.8, confidenceHigh: 54.5, confidenceLow: 45.1, baseCase: 49.8, bullCase: 56.0, bearCase: 43.6 },
];

const forecastData: ForecastData[] = [
  { time: "Day 0", actual: 46.8, forecast: 46.8, confidenceHigh: 47.2, confidenceLow: 46.4, baseCase: 46.8, bullCase: 47.5, bearCase: 46.2 },
  { time: "Day 1", forecast: 48.9, confidenceHigh: 51.2, confidenceLow: 46.6, baseCase: 48.9, bullCase: 52.5, bearCase: 45.3 },
  { time: "Day 2", forecast: 50.2, confidenceHigh: 54.8, confidenceLow: 45.6, baseCase: 50.2, bullCase: 56.8, bearCase: 43.6 },
  { time: "Day 3", forecast: 51.5, confidenceHigh: 58.2, confidenceLow: 44.8, baseCase: 51.5, bullCase: 61.5, bearCase: 41.5 },
  { time: "Day 4", forecast: 52.3, confidenceHigh: 61.0, confidenceLow: 43.6, baseCase: 52.3, bullCase: 65.2, bearCase: 39.4 },
  { time: "Day 5", forecast: 52.8, confidenceHigh: 63.5, confidenceLow: 42.1, baseCase: 52.8, bullCase: 68.5, bearCase: 37.1 },
  { time: "Day 7", forecast: 53.2, confidenceHigh: 66.8, confidenceLow: 39.6, baseCase: 53.2, bullCase: 72.5, bearCase: 33.9 },
];

export const ForecastChart = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Price Forecasts with Confidence Bands
      </h3>
      
      <Tabs defaultValue="nowcast" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="nowcast">0-72h Nowcast</TabsTrigger>
          <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nowcast" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Intra-day and day-ahead nowcasts with 95% confidence intervals
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={nowcastData}>
              <defs>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="confidenceHigh"
                stackId="1"
                stroke="none"
                fill="url(#confidenceBand)"
                name="95% Confidence"
              />
              <Area
                type="monotone"
                dataKey="confidenceLow"
                stackId="1"
                stroke="none"
                fill="transparent"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Forecast"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Actual"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="forecast" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              7-day forecast with scenario branches (Base/Bull/Bear cases)
            </p>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Base Case</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">Bull Case (Low Threat)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Bear Case (High Threat)</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                domain={['dataMin - 5', 'dataMax + 5']}
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
                dataKey="bullCase"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Bull Case"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="bearCase"
                stroke="hsl(var(--destructive))"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Bear Case"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="baseCase"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name="Base Case"
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
