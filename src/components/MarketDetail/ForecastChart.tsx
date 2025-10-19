import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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

export const ForecastChart = () => {
  const { id } = useParams();
  const { data, isLoading } = useEnergyPrices();
  const [showAdjusted, setShowAdjusted] = useState(true);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('1h');
  const [zoomLevel, setZoomLevel] = useState(100); // percentage of data to show

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.max(25, prev - 25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.min(100, prev + 25));
  };

  const generateForecastData = (basePrice: number, periods: number, minutes: number): ForecastData[] => {
    const data: ForecastData[] = [];
    const volatility = basePrice * 0.02; // 2% volatility
    
    for (let i = 0; i <= periods; i++) {
      const trend = i * 0.3; // gradual upward trend
      const randomFactor = (Math.random() - 0.5) * 2;
      const forecast = basePrice + trend + (randomFactor * volatility);
      
      const confidenceSpread = volatility * (1 + i * 0.2);
      const scenarioSpread = volatility * (1.5 + i * 0.3);
      
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
      
      data.push({
        time: timeStr,
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
  const minutes = intervalMinutes[timeInterval];
  const totalMinutes = 48 * 60; // 48 hours
  const totalPoints = Math.floor(totalMinutes / minutes) + 1;
  const nowcastData = generateForecastData(basePrice, totalPoints, minutes);
  const forecastData = generateForecastData(basePrice, 7, 1440); // 7 days with 24h intervals

  // Apply zoom level to data
  const getZoomedData = (data: ForecastData[]) => {
    const pointsToShow = Math.ceil(data.length * (zoomLevel / 100));
    return data.slice(0, pointsToShow);
  };

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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Price Forecasts with Confidence Bands
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
      
      <Tabs defaultValue="nowcast" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="nowcast">0-48h Nowcast</TabsTrigger>
          <TabsTrigger value="forecast">7-Day Forecast</TabsTrigger>
        </TabsList>
        
        <TabsContent value="nowcast" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Intra-day and day-ahead nowcasts with 95% confidence intervals
            </p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={getZoomedData(nowcastData)}>
              <defs>
                <linearGradient id="confidenceBandNow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="baselineGradientNow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
                interval={Math.max(1, Math.floor(getZoomedData(nowcastData).length / 12))}
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
              
              {showAdjusted ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="confidenceHigh"
                    stackId="1"
                    stroke="none"
                    fill="url(#confidenceBandNow)"
                    fillOpacity={0.6}
                    name="95% Confidence"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidenceLow"
                    stackId="1"
                    stroke="none"
                    fill="url(#confidenceBandNow)"
                    fillOpacity={0.6}
                    name="Lower Confidence"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Risk-Adjusted Forecast"
                    dot={false}
                    strokeOpacity={1}
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="baseCase"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#baselineGradientNow)"
                    fillOpacity={0.4}
                    name="Baseline Forecast"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Risk-Adjusted (ref)"
                    strokeOpacity={0.9}
                  />
                </>
              )}
              
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
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
                <div className="h-2 w-2 rounded-full" style={{ background: '#3b82f6' }} />
                <span className="text-muted-foreground">Base Case</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ background: '#10b981' }} />
                <span className="text-muted-foreground">Bull Case (Low Threat)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ background: '#ef4444' }} />
                <span className="text-muted-foreground">Bear Case (High Threat)</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={getZoomedData(forecastData)}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
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
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Bull Case"
                dot={false}
                strokeOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="bearCase"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Bear Case"
                dot={false}
                strokeOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="baseCase"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Base Case"
                dot={{ fill: "#3b82f6", r: 4 }}
                strokeOpacity={1}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  );
};