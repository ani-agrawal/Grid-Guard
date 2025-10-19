import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnergyPrices } from "@/hooks/useEnergyPrices";

interface ForecastData {
  region: string;
  currentPrice: string;
  forecast: string;
  change: number;
  cyberRisk: string;
  geoRisk: string;
}

export const PriceForecast = () => {
  const { data, isLoading } = useEnergyPrices();

  const generateForecasts = (): ForecastData[] => {
    if (!data?.energyPrices) return [];
    
    return data.energyPrices.slice(0, 3).map(price => {
      const forecastChange = (Math.random() * 15) - 5; // -5% to +10%
      const forecastPrice = price.price * (1 + forecastChange / 100);
      
      return {
        region: `${price.region} (${price.marketType})`,
        currentPrice: `$${price.price.toFixed(2)}${price.marketType === "Electricity" ? "/MWh" : "/MMBtu"}`,
        forecast: `$${forecastPrice.toFixed(2)}${price.marketType === "Electricity" ? "/MWh" : "/MMBtu"}`,
        change: forecastChange,
        cyberRisk: price.threatLevel === "High" ? "Elevated" : price.threatLevel === "Medium" ? "Moderate" : "Low",
        geoRisk: price.forecast === "Bullish" ? "Elevated" : price.forecast === "Bearish" ? "Moderate" : "Stable",
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
      <h3 className="text-lg font-semibold text-foreground mb-4">
        48h Price Forecasts
      </h3>
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
                <div className="flex items-center gap-1">
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
                    {forecast.change}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {forecast.forecast}
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
