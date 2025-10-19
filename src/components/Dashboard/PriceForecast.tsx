import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

type TimeInterval = '15min' | '30min' | '1h' | '2h' | '4h' | '6h' | '12h';

const intervalMinutes: Record<TimeInterval, number> = {
  '15min': 15,
  '30min': 30,
  '1h': 60,
  '2h': 120,
  '4h': 240,
  '6h': 360,
  '12h': 720,
};

const intervalLabels: Record<TimeInterval, string> = {
  '15min': '15 Minutes',
  '30min': '30 Minutes',
  '1h': '1 Hour',
  '2h': '2 Hours',
  '4h': '4 Hours',
  '6h': '6 Hours',
  '12h': '12 Hours',
};

export const PriceForecast = () => {
  const { data, isLoading } = useEnergyPrices();
  const { convertPrice } = useCurrencyConversion();
  const [showAdjusted, setShowAdjusted] = useState(true);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('15min');

  const generateForecasts = (): RegionForecast[] => {
    if (!data?.energyPrices) return [];
    
    const minutes = intervalMinutes[timeInterval];
    const totalMinutes = 48 * 60; // 48 hours
    const totalPoints = Math.floor(totalMinutes / minutes) + 1;
    
    return data.energyPrices.slice(0, 3).map(price => {
      const timePoints: TimeSeriesPoint[] = [];
      const now = new Date();
      
      // Generate 48 hours of forecast data with selected interval
      for (let i = 0; i < totalPoints; i++) {
        const currentTime = new Date(now.getTime() + i * minutes * 60 * 1000);
        const hoursElapsed = (i * minutes) / 60;
        
        // Format time string
        let timeStr: string;
        if (i === 0) {
          timeStr = 'Now';
        } else if (minutes < 60) {
          timeStr = `+${i * minutes}m`;
        } else if (minutes === 60) {
          timeStr = `+${i}h`;
        } else {
          const hours = (i * minutes) / 60;
          timeStr = `+${hours}h`;
        }
        
        // Add some realistic volatility
        const baseVolatility = (Math.sin(hoursElapsed / 8) * 2) + (Math.random() * 2 - 1);
        const trendFactor = hoursElapsed * 0.05; // Slight upward trend
        
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="time-interval" className="text-xs text-muted-foreground whitespace-nowrap">
              Interval:
            </Label>
            <Select value={timeInterval} onValueChange={(value) => setTimeInterval(value as TimeInterval)}>
              <SelectTrigger id="time-interval" className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(intervalLabels) as TimeInterval[]).map((interval) => (
                  <SelectItem key={interval} value={interval}>
                    {intervalLabels[interval]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval={Math.max(1, Math.floor(forecast.data.length / 12))}
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
                      fillOpacity={0.6}
                      name="Upper Confidence"
                    />
                    <Area
                      type="monotone"
                      dataKey="confidenceLow"
                      stackId="1"
                      stroke="none"
                      fill="url(#confidenceGradient)"
                      fillOpacity={0.6}
                      name="Lower Confidence"
                    />
                  </>
                )}
                
                <Line
                  type="monotone"
                  dataKey={showAdjusted ? "riskAdjusted" : "baseline"}
                  stroke={showAdjusted ? "#f59e0b" : "#3b82f6"}
                  strokeWidth={3}
                  dot={false}
                  name={showAdjusted ? "Risk-Adjusted" : "Baseline"}
                  strokeOpacity={1}
                />
                
                {!showAdjusted && (
                  <Line
                    type="monotone"
                    dataKey="riskAdjusted"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Risk-Adjusted (ref)"
                    strokeOpacity={0.9}
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
