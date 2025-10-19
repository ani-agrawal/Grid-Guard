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
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

type TimeInterval = '30s' | '1min' | '5min' | '15min' | '30min' | '1h' | '3h' | '6h' | '8h' | '12h' | '24h';

const intervalMinutes: Record<TimeInterval, number> = {
  '30s': 0.5,
  '1min': 1,
  '5min': 5,
  '15min': 15,
  '30min': 30,
  '1h': 60,
  '3h': 180,
  '6h': 360,
  '8h': 480,
  '12h': 720,
  '24h': 1440,
};

const intervalLabels: Record<TimeInterval, string> = {
  '30s': '30 Seconds',
  '1min': '1 Minute',
  '5min': '5 Minutes',
  '15min': '15 Minutes',
  '30min': '30 Minutes',
  '1h': '1 Hour',
  '3h': '3 Hours',
  '6h': '6 Hours',
  '8h': '8 Hours',
  '12h': '12 Hours',
  '24h': '24 Hours',
};

export const PriceForecast = () => {
  const { data, isLoading } = useEnergyPrices();
  const { convertPrice } = useCurrencyConversion();
  const [showAdjusted, setShowAdjusted] = useState(true);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('1min');
  const [zoomLevel, setZoomLevel] = useState(100); // percentage of data to show

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.max(25, prev - 25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.min(100, prev + 25));
  };

  const generateForecasts = (): RegionForecast[] => {
    if (!data?.energyPrices) return [];
    
    const minutes = intervalMinutes[timeInterval];
    const totalMinutes = 48 * 60; // 48 hours
    const totalPoints = Math.floor(totalMinutes / minutes) + 1;
    
    // Show all energy prices instead of just first 3
    return data.energyPrices.map(price => {
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
        } else if (minutes < 1) {
          const seconds = i * minutes * 60;
          timeStr = `+${seconds}s`;
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

  // Apply zoom level to data
  const getZoomedData = (data: TimeSeriesPoint[]) => {
    const pointsToShow = Math.ceil(data.length * (zoomLevel / 100));
    return data.slice(0, pointsToShow);
  };

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
          <div className="flex items-center gap-1 border border-border rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel <= 25}
              className="h-8 px-2"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel >= 100}
              className="h-8 px-2"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
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
        <div className="mb-6 space-y-6">
          {/* Electricity Markets */}
          {forecasts.filter(f => f.marketType === "Electricity").length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                Electricity Markets
              </div>
              <TabsList className={`grid w-full mb-2`} style={{ 
                gridTemplateColumns: `repeat(${Math.min(forecasts.filter(f => f.marketType === "Electricity").length, 4)}, minmax(0, 1fr))` 
              }}>
                {forecasts.filter(f => f.marketType === "Electricity").map((forecast) => (
                  <TabsTrigger key={forecast.region} value={forecast.region} className="text-xs sm:text-sm">
                    {forecast.region}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          )}
          
          {/* Oil & Gas Markets */}
          {forecasts.filter(f => f.marketType !== "Electricity").length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                Oil & Gas Markets
              </div>
              <TabsList className="grid w-full gap-2" style={{ 
                gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` 
              }}>
                {forecasts.filter(f => f.marketType !== "Electricity").map((forecast) => (
                  <TabsTrigger key={forecast.region} value={forecast.region} className="text-xs sm:text-sm px-2">
                    {forecast.region}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          )}
        </div>
        
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
              <AreaChart data={getZoomedData(forecast.data)}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  interval={Math.max(1, Math.floor(getZoomedData(forecast.data).length / 12))}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => `${convertPrice(value)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: number) => [convertPrice(value), '']}
                />
                <Legend 
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
                
                {showAdjusted ? (
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
                    <Line
                      type="monotone"
                      dataKey="riskAdjusted"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={false}
                      name="Risk-Adjusted"
                      strokeOpacity={1}
                    />
                  </>
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="baseline"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#baselineGradient)"
                      fillOpacity={0.4}
                      name="Baseline Forecast"
                    />
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
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};
