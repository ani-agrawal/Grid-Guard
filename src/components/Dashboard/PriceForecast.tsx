import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSeriesPoint {
  time: string;
  price: number;
  baseline?: number;
  riskAdjusted?: number;
  confidenceLow?: number;
  confidenceHigh?: number;
}

interface RegionForecast {
  region: string;
  marketType: string;
  data: TimeSeriesPoint[];
  currentPrice: number;
}

export const PriceForecast = () => {
  const { data, isLoading } = useEnergyPrices();
  const { convertPrice } = useCurrencyConversion();
  const [showAdjusted, setShowAdjusted] = useState(true);

  const generateForecasts = (): RegionForecast[] => {
    if (!data?.energyPrices) return [];
    
    return data.energyPrices.slice(0, 3).map(price => {
      const timePoints: TimeSeriesPoint[] = [];
      const now = new Date();
      
      // Generate 48 hours of forecast data (hourly)
      for (let i = 0; i <= 48; i++) {
        const hour = new Date(now.getTime() + i * 60 * 60 * 1000);
        const timeStr = i === 0 ? 'Now' : `+${i}h`;
        
        // Add some realistic volatility
        const baseVolatility = (Math.sin(i / 8) * 2) + (Math.random() * 2 - 1);
        const trendFactor = i * 0.05; // Slight upward trend
        
        const baselineChange = baseVolatility + trendFactor;
        const riskPremium = 1 + (Math.random() * 2); // +1% to +3% risk premium
        
        const baselinePrice = price.price * (1 + baselineChange / 100);
        const riskAdjustedPrice = price.price * (1 + (baselineChange + riskPremium) / 100);
        
        // Confidence bands (±3%)
        const confidenceLow = riskAdjustedPrice * 0.97;
        const confidenceHigh = riskAdjustedPrice * 1.03;
        
        timePoints.push({
          time: timeStr,
          price: i === 0 ? price.price : (showAdjusted ? riskAdjustedPrice : baselinePrice),
          baseline: baselinePrice,
          riskAdjusted: riskAdjustedPrice,
          confidenceLow,
          confidenceHigh,
        });
      }
      
      return {
        region: price.region,
        marketType: price.marketType,
        data: timePoints,
        currentPrice: price.price,
      };
    });
  };

  const forecasts = generateForecasts();

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          48h Price Forecasts
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          48h Price Forecasts
        </h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="scenario-toggle" className="text-xs text-muted-foreground">
            Baseline
          </Label>
          <Switch
            id="scenario-toggle"
            checked={showAdjusted}
            onCheckedChange={setShowAdjusted}
          />
          <Label htmlFor="scenario-toggle" className="text-xs text-foreground font-medium">
            Risk-Adjusted
          </Label>
        </div>
      </div>
      
      <Tabs defaultValue={forecasts[0]?.region || "region-0"} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          {forecasts.map((forecast, idx) => (
            <TabsTrigger key={forecast.region} value={forecast.region}>
              {forecast.region}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {forecasts.map((forecast) => (
          <TabsContent key={forecast.region} value={forecast.region} className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Current Price: <span className="font-semibold text-foreground">
                  {convertPrice(forecast.currentPrice)}{forecast.marketType === "Electricity" ? "/MWh" : "/MMBtu"}
                </span>
              </span>
              <span className="text-muted-foreground">
                Market: <span className="font-semibold text-foreground">{forecast.marketType}</span>
              </span>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecast.data}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                
                {showAdjusted && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="confidenceHigh"
                      stackId="1"
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      fillOpacity={0.3}
                      name="Upper Confidence"
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceLow"
                      stackId="1"
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      fillOpacity={0.3}
                      name="Lower Confidence"
                    />
                  </>
                )}
                
                <Line
                  type="monotone"
                  dataKey={showAdjusted ? "riskAdjusted" : "baseline"}
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  name={showAdjusted ? "Risk-Adjusted" : "Baseline"}
                />
                
                {!showAdjusted && (
                  <Line
                    type="monotone"
                    dataKey="riskAdjusted"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Risk-Adjusted (ref)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
