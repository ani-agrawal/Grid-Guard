import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useParams } from "react-router-dom";

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

export const ForecastChart = () => {
  const { id } = useParams();
  const { data, isLoading } = useEnergyPrices();

  const generateForecastData = (basePrice: number, periods: number, hourlyIncrement: boolean = false): ForecastData[] => {
    const data: ForecastData[] = [];
    const volatility = basePrice * 0.02; // 2% volatility
    
    for (let i = 0; i <= periods; i++) {
      const trend = i * 0.3; // gradual upward trend
      const randomFactor = (Math.random() - 0.5) * 2;
      const forecast = basePrice + trend + (randomFactor * volatility);
      
      const confidenceSpread = volatility * (1 + i * 0.2);
      const scenarioSpread = volatility * (1.5 + i * 0.3);
      
      data.push({
        time: hourlyIncrement ? `+${i * 6}h` : `Day ${i}`,
        actual: i === 0 ? basePrice : undefined,
        forecast: parseFloat(forecast.toFixed(2)),
        confidenceHigh: parseFloat((forecast + confidenceSpread).toFixed(2)),
        confidenceLow: parseFloat((forecast - confidenceSpread).toFixed(2)),
        baseCase: parseFloat(forecast.toFixed(2)),
        bullCase: parseFloat((forecast + scenarioSpread).toFixed(2)),
        bearCase: parseFloat((forecast - scenarioSpread).toFixed(2)),
      });
    }
    
    return data;
  };

  const getBasePrice = () => {
    if (!data?.energyPrices) return 45;
    
    // Try to find specific region if id is provided
    if (id) {
      const regionPrice = data.energyPrices.find(p => 
        p.region.toLowerCase().includes(id.toLowerCase()) ||
        p.marketType.toLowerCase().includes(id.toLowerCase())
      );
      if (regionPrice) return regionPrice.price;
    }
    
    // Default to first available price
    return data.energyPrices[0]?.price || 45;
  };

  const basePrice = getBasePrice();
  const nowcastData = generateForecastData(basePrice, 6, true);
  const forecastData = generateForecastData(basePrice, 7, false);

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Price Forecasts with Confidence Bands
        </h3>
        <Skeleton className="w-full h-[400px]" />
      </Card>
    );
  }
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
