import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Skeleton } from "@/components/ui/skeleton";

interface RegionData {
  id: string;
  name: string;
  position: [number, number];
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
    position: [40.0, -77.0],
    market: "Electricity",
    price: "$46.80/MWh",
    change: 2.4,
    threatLevel: "medium",
    forecast: "↗ +3-5% expected in 72h due to ransomware activity targeting utility vendors"
  },
  {
    id: "ercot",
    name: "ERCOT (Texas)",
    position: [31.0, -99.0],
    market: "Electricity",
    price: "$52.30/MWh",
    change: 4.2,
    threatLevel: "high",
    forecast: "⚠ +8-12% spike risk from grid infrastructure vulnerabilities"
  },
  {
    id: "caiso",
    name: "CAISO (California)",
    position: [36.7, -119.7],
    market: "Electricity",
    price: "$58.90/MWh",
    change: 1.8,
    threatLevel: "medium",
    forecast: "→ Stable, minor increase expected from geopolitical tensions"
  },
  {
    id: "north_sea",
    name: "North Sea Brent",
    position: [56.0, 3.0],
    market: "Oil",
    price: "$87.10/bbl",
    change: 3.2,
    threatLevel: "high",
    forecast: "↗ +5-7% likely from maritime infrastructure reconnaissance"
  },
  {
    id: "persian_gulf",
    name: "Persian Gulf",
    position: [26.0, 52.0],
    market: "Oil & Gas",
    price: "$89.50/bbl",
    change: 5.1,
    threatLevel: "high",
    forecast: "⚠ High volatility expected from Iran-Israel proxy escalation"
  },
  {
    id: "henry_hub",
    name: "Henry Hub (Louisiana)",
    position: [30.0, -92.7],
    market: "Natural Gas",
    price: "$3.45/MMBtu",
    change: -1.8,
    threatLevel: "low",
    forecast: "↘ -2-3% decline expected, minimal threat activity"
  },
  {
    id: "singapore",
    name: "Singapore Hub",
    position: [1.35, 103.8],
    market: "LNG & Electricity",
    price: "$4.20/MMBtu",
    change: 2.8,
    threatLevel: "medium",
    forecast: "↗ +4-6% expected from regional LNG supply chain vulnerabilities"
  },
  {
    id: "japan",
    name: "Tokyo (JEPX)",
    position: [35.7, 139.7],
    market: "Electricity",
    price: "¥8,500/MWh",
    change: 3.5,
    threatLevel: "medium",
    forecast: "↗ Moderate increase expected from SCADA system vulnerability disclosures"
  },
  {
    id: "china",
    name: "Shanghai Energy Exchange",
    position: [31.2, 121.5],
    market: "Oil & Gas",
    price: "¥520/barrel",
    change: 1.5,
    threatLevel: "low",
    forecast: "→ Stable outlook with minor supply chain monitoring"
  },
  {
    id: "india",
    name: "India Energy Exchange",
    position: [28.6, 77.2],
    market: "Electricity",
    price: "₹4.50/kWh",
    change: 4.8,
    threatLevel: "high",
    forecast: "⚠ +7-10% spike risk from critical infrastructure targeting and grid strain"
  },
  {
    id: "australia",
    name: "Australian NEM",
    position: [-33.9, 151.2],
    market: "Electricity",
    price: "A$95/MWh",
    change: 2.1,
    threatLevel: "medium",
    forecast: "↗ +3-4% expected from increased OT targeting in mining sector"
  },
  {
    id: "newzealand",
    name: "New Zealand Grid",
    position: [-41.3, 174.8],
    market: "Electricity",
    price: "NZ$120/MWh",
    change: -0.5,
    threatLevel: "low",
    forecast: "→ Stable with minimal threat activity detected"
  },
];

// Leaflet map component that loads only on client side
const LeafletMap = ({ regions, selectedRegion, handleRegionSelect }: { 
  regions: RegionData[];
  selectedRegion: RegionData | null; 
  handleRegionSelect: (region: RegionData) => void;
}) => {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const mapRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Monitor theme changes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setCurrentTheme(savedTheme || 'dark');

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setCurrentTheme(isDark ? 'dark' : 'light');
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fly to selected region when it changes
  useEffect(() => {
    if (!mapRef.current || !selectedRegion) return;

    const marker = markersRef.current.get(selectedRegion.id);
    if (marker) {
      // Fly to the region with animation
      mapRef.current.flyTo(selectedRegion.position, 6, {
        duration: 1.5,
        easeLinearity: 0.25
      });
      
      // Open the popup after a short delay to let the animation start
      setTimeout(() => {
        marker.openPopup();
      }, 300);
    }
  }, [selectedRegion]);

  // Initialize map once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (mapRef.current) return; // Don't reinitialize

    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css')
    ]).then(([L]) => {
      const container = document.getElementById('map-container');
      if (!container) return;
      
      container.innerHTML = '';

      // Create map
      const map = L.map('map-container').setView([35.0, -20.0], 3);
      mapRef.current = map;

      // Add initial tile layer
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      // Add markers
      regions.forEach((region) => {
        const color = region.threatLevel === "high" ? "#ef4444" : 
                     region.threatLevel === "medium" ? "#f59e0b" : "#10b981";
        
        const customIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(region.position as [number, number], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="padding: 8px; min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${region.name}</h3>
              <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${region.market}</p>
              <p style="font-size: 14px; font-weight: 600;">${region.price}</p>
              <span style="display: inline-block; margin-top: 8px; padding: 2px 8px; background: ${color}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600;">
                ${region.threatLevel.toUpperCase()}
              </span>
            </div>
          `);

        // Store marker reference
        markersRef.current.set(region.id, marker);

        marker.on('click', () => {
          handleRegionSelect(region);
        });
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current.clear();
    };
  }, []);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    import('leaflet').then((L) => {
      // Remove old tile layer
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }

      // Add new tile layer based on theme
      const newTileLayer = currentTheme === 'dark'
        ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
          })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
          });
      
      newTileLayer.addTo(mapRef.current);
      tileLayerRef.current = newTileLayer;
    });
  }, [currentTheme]);

  return <div id="map-container" style={{ width: '100%', height: '100%' }} />;
};

interface RegionalMapProps {
  onRegionSelect?: (regionId: string) => void;
}

export const RegionalMap = ({ onRegionSelect }: RegionalMapProps = {}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { data: energyData, isLoading } = useEnergyPrices();
  const { convertPrice } = useCurrencyConversion();

  const handleRegionSelect = (region: RegionData) => {
    setSelectedRegion(region);
    if (onRegionSelect) {
      onRegionSelect(region.id);
    }
  };
  
  // Merge real API data with static regions
  const enrichedRegions = regions.map(region => {
    const liveData = energyData?.energyPrices?.find(
      (ep: any) => ep.region === region.name || 
                   ep.region.includes(region.name.split(' ')[0]) ||
                   region.name.includes(ep.region)
    );
    
    if (liveData) {
      return {
        ...region,
        price: `${convertPrice(liveData.price)}/${region.market.includes('Electricity') ? 'MWh' : region.market.includes('Gas') ? 'MMBtu' : 'bbl'}`,
        change: liveData.change,
        threatLevel: liveData.threatLevel.toLowerCase() as "low" | "medium" | "high",
        forecast: liveData.forecast
      };
    }
    return region;
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getThreatBadgeVariant = (level: string): "destructive" | "secondary" | "outline" => {
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
          {energyData?.source ? `Live data from ${energyData.source}` : 'Select a region to view localized forecasts and threat assessments'}
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-[600px] w-full" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-lg overflow-hidden h-[600px] border border-primary/20 bg-background">
            {isMounted ? (
              <LeafletMap regions={enrichedRegions} selectedRegion={selectedRegion} handleRegionSelect={handleRegionSelect} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            )}
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
                {enrichedRegions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleRegionSelect(region)}
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
      )}
    </Card>
  );
};
