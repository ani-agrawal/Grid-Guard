import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForecastData {
  region: string;
  currentPrice: string;
  forecast: string;
  change: number;
  cyberRisk: string;
  geoRisk: string;
}

const forecasts: ForecastData[] = [
  {
    region: "PJM (US Northeast)",
    currentPrice: "$46.80/MWh",
    forecast: "$49.25/MWh",
    change: 5.2,
    cyberRisk: "Elevated",
    geoRisk: "Stable",
  },
  {
    region: "ERCOT (Texas)",
    currentPrice: "$52.30/MWh",
    forecast: "$48.90/MWh",
    change: -6.5,
    cyberRisk: "Moderate",
    geoRisk: "Stable",
  },
  {
    region: "Brent Crude",
    currentPrice: "$87.10/bbl",
    forecast: "$95.20/bbl",
    change: 9.3,
    cyberRisk: "Moderate",
    geoRisk: "High",
  },
];

export const PriceForecast = () => {
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
