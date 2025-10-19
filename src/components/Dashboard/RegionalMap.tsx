import { useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface RegionData {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  market: string;
  price: string;
  change: number;
  threatLevel: "low" | "medium" | "high";
  forecast: string;
}

const regions: RegionData[] = [
  {
    id: "pjm",
    name: "PJM Interconnection",
    position: { lat: 40.0, lng: -77.0 },
    market: "Electricity",
    price: "$46.80/MWh",
    change: 2.4,
    threatLevel: "medium",
    forecast: "↗ +3-5% expected in 72h due to ransomware activity targeting utility vendors"
  },
  {
    id: "ercot",
    name: "ERCOT (Texas)",
    position: { lat: 31.0, lng: -99.0 },
    market: "Electricity",
    price: "$52.30/MWh",
    change: 4.2,
    threatLevel: "high",
    forecast: "⚠ +8-12% spike risk from grid infrastructure vulnerabilities"
  },
  {
    id: "caiso",
    name: "CAISO (California)",
    position: { lat: 36.7, lng: -119.7 },
    market: "Electricity",
    price: "$58.90/MWh",
    change: 1.8,
    threatLevel: "medium",
    forecast: "→ Stable, minor increase expected from geopolitical tensions"
  },
  {
    id: "north_sea",
    name: "North Sea Brent",
    position: { lat: 56.0, lng: 3.0 },
    market: "Oil",
    price: "$87.10/bbl",
    change: 3.2,
    threatLevel: "high",
    forecast: "↗ +5-7% likely from maritime infrastructure reconnaissance"
  },
  {
    id: "persian_gulf",
    name: "Persian Gulf",
    position: { lat: 26.0, lng: 52.0 },
    market: "Oil & Gas",
    price: "$89.50/bbl",
    change: 5.1,
    threatLevel: "high",
    forecast: "⚠ High volatility expected from Iran-Israel proxy escalation"
  },
  {
    id: "henry_hub",
    name: "Henry Hub (Louisiana)",
    position: { lat: 30.0, lng: -92.7 },
    market: "Natural Gas",
    price: "$3.45/MMBtu",
    change: -1.8,
    threatLevel: "low",
    forecast: "↘ -2-3% decline expected, minimal threat activity"
  },
];

export const RegionalMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high": return "hsl(var(--destructive))";
      case "medium": return "hsl(var(--warning))";
      default: return "hsl(var(--success))";
    }
  };

  const getThreatBadgeVariant = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "secondary";
      default: return "outline";
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-card/50 border-primary/20">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Regional Market Intelligence</h2>
        <p className="text-sm text-muted-foreground">
          Select a region to view localized forecasts and threat assessments
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg overflow-hidden h-[600px] border border-primary/20">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: 35.0, lng: -20.0 }}
              defaultZoom={3}
              mapId="regional-energy-map"
              gestureHandling="greedy"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {regions.map((region) => (
                <AdvancedMarker
                  key={region.id}
                  position={region.position}
                  onClick={() => setSelectedRegion(region)}
                >
                  <div
                    className="relative cursor-pointer group"
                    style={{
                      width: "32px",
                      height: "32px",
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        backgroundColor: getThreatColor(region.threatLevel),
                        opacity: 0.3,
                      }}
                    />
                    <div
                      className="absolute inset-2 rounded-full group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: getThreatColor(region.threatLevel),
                      }}
                    />
                    <AlertTriangle
                      className="absolute inset-0 m-auto text-white"
                      size={16}
                    />
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        </div>

        <div className="space-y-4">
          {selectedRegion ? (
            <Card className="p-4 bg-accent/50 border-primary/30">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg text-foreground">{selectedRegion.name}</h3>
                    <Badge variant={getThreatBadgeVariant(selectedRegion.threatLevel)}>
                      {selectedRegion.threatLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedRegion.market}</p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-primary/20">
                  <span className="text-2xl font-bold text-foreground">{selectedRegion.price}</span>
                  <div className={`flex items-center gap-1 ${selectedRegion.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {selectedRegion.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    <span className="font-semibold">{Math.abs(selectedRegion.change)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">72h Forecast:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedRegion.forecast}
                  </p>
                </div>

                <button
                  onClick={() => window.location.href = `/market/${selectedRegion.id}`}
                  className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                >
                  View Detailed Analysis →
                </button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-accent/30 border-primary/20">
              <p className="text-center text-muted-foreground">
                Click on a region marker to view detailed forecast and threat intelligence
              </p>
            </Card>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">All Regions:</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region)}
                  className={`w-full p-3 rounded-lg border transition-colors text-left ${
                    selectedRegion?.id === region.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card/50 border-primary/20 hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">{region.name}</span>
                    <Badge variant={getThreatBadgeVariant(region.threatLevel)} className="text-xs">
                      {region.threatLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{region.market}</span>
                    <span className={`text-xs font-semibold ${region.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {region.change >= 0 ? '+' : ''}{region.change}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
