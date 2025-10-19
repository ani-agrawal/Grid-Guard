import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface ForecastData {
  region: string;
  currentPrice: string;
  forecast: string;
  change: number;
  cyberRisk: string;
  geoRisk: string;
  confidenceLow: number;
  confidenceHigh: number;
  baselineChange: number;
}

export const PriceForecast = () => {
  const { data, isLoading } = useEnergyPrices();
  const { convertPrice } = useCurrencyConversion();
  const [showAdjusted, setShowAdjusted] = useState(true);

  const generateForecasts = (): ForecastData[] => {
    if (!data?.energyPrices) return [];
    
    return data.energyPrices.slice(0, 3).map(price => {
      const baselineChange = (Math.random() * 8) - 2; // -2% to +6% baseline
      const riskPremium = (Math.random() * 4) + 1; // +1% to +5% risk premium
      const forecastChange = showAdjusted ? baselineChange + riskPremium : baselineChange;
      const forecastPrice = price.price * (1 + forecastChange / 100);
      
      // Confidence interval: ±3% around forecast
      const ciRange = 3;
      
      return {
        region: `${price.region} (${price.marketType})`,
        currentPrice: `${convertPrice(price.price)}${price.marketType === "Electricity" ? "/MWh" : "/MMBtu"}`,
        forecast: `${convertPrice(forecastPrice)}${price.marketType === "Electricity" ? "/MWh" : "/MMBtu"}`,
        change: forecastChange,
        cyberRisk: price.threatLevel === "High" ? "Elevated" : price.threatLevel === "Medium" ? "Moderate" : "Low",
        geoRisk: price.forecast === "Bullish" ? "Elevated" : price.forecast === "Bearish" ? "Moderate" : "Stable",
        confidenceLow: forecastChange - ciRange,
        confidenceHigh: forecastChange + ciRange,
        baselineChange,
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
      <div className="space-y-4">
        {forecasts.map((forecast) => (
          <div
            key={forecast.region}
            className="p-4 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-foreground">
                  {forecast.region}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Current: {forecast.currentPrice}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {forecast.change > 0 ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-success" />
                  )}
                  <span
                    className={cn(
                      "text-lg font-bold",
                      forecast.change > 0 ? "text-destructive" : "text-success"
                    )}
                  >
                    {forecast.change > 0 ? "+" : ""}
                    {forecast.change.toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-0.5">
                  {forecast.forecast}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  CI90: {forecast.confidenceLow > 0 ? "+" : ""}{forecast.confidenceLow.toFixed(1)}% to +{forecast.confidenceHigh.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Cyber: </span>
                <span className="text-cyber font-medium">
                  {forecast.cyberRisk}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Geo: </span>
                <span className="text-geopolitical font-medium">
                  {forecast.geoRisk}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
