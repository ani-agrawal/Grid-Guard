import { DashboardHeader } from "@/components/Dashboard/Header";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { ThreatGauge } from "@/components/Dashboard/ThreatGauge";
import { PriceForecast } from "@/components/Dashboard/PriceForecast";
import { AlertFeed } from "@/components/Dashboard/AlertFeed";
import { CorrelationChart } from "@/components/Dashboard/CorrelationChart";
import { MajorNews } from "@/components/Dashboard/MajorNews";
import { RegionalMap } from "@/components/Dashboard/RegionalMap";
import { RiskScoreCards } from "@/components/Dashboard/RiskScoreCards";
import { ThreatAssetLinker } from "@/components/Dashboard/ThreatAssetLinker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, DollarSign, Fuel, Shield, Globe, Wind, Sun, TrendingUp, AlertTriangle, Activity, Newspaper } from "lucide-react";
import { useEnergyPrices } from "@/hooks/useEnergyPrices";
import { useCVEData } from "@/hooks/useCVEData";
import { useRiskScores } from "@/hooks/useRiskScores";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useForecastAccuracy } from "@/hooks/useForecastAccuracy";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const { data: energyData } = useEnergyPrices();
  const { data: cveData } = useCVEData();
  const { data: riskScores, isCalculating, calculateRiskScores: triggerCalculation } = useRiskScores();
  const { convertPrice } = useCurrencyConversion();
  const { accuracy: forecastAccuracy } = useForecastAccuracy();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "markets");

  // Calculate real metrics from API data
  const getMarketData = (region: string) => {
    const market = energyData?.energyPrices?.find(p => 
      p.region.toLowerCase().includes(region.toLowerCase())
    );
    return market || null;
  };

  const pjmData = getMarketData("pjm");
  const henryHubData = getMarketData("henry hub");
  const caiso = getMarketData("caiso");
  const ercot = getMarketData("ercot");
  
  // Calculate geopolitical score from real data
  const geoScore = riskScores ? 
    Math.round(riskScores.reduce((sum, s) => sum + s.gei, 0) / riskScores.length) : 68;

  // Count active regions
  const activeRegions = energyData?.energyPrices?.length || 24;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["markets", "risk", "forecasts", "news", "alerts"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="markets" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Markets
            </TabsTrigger>
            <TabsTrigger value="risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risk Analysis
            </TabsTrigger>
            <TabsTrigger value="forecasts" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Forecasts
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Major News
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Markets Overview Tab */}
          <TabsContent value="markets" className="space-y-8">
            <RegionalMap />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <MetricCard
                title="Electricity (PJM)"
                value={pjmData ? convertPrice(pjmData.price) : convertPrice(46.80)}
                change={pjmData ? `${pjmData.change.toFixed(1)}%` : "2.4%"}
                changeType={pjmData && pjmData.change >= 0 ? "up" : "down"}
                icon={Zap}
                gradient="primary"
                subtitle="per MWh"
                marketId="pjm"
                source="PJM"
                lastUpdated={1}
              />
              <MetricCard
                title="Brent Crude"
                value={convertPrice(87.10)}
                change="3.2%"
                changeType="up"
                icon={DollarSign}
                gradient="primary"
                subtitle="per barrel"
                marketId="brent"
                source="EIA"
                lastUpdated={2}
              />
              <MetricCard
                title="Natural Gas (Henry Hub)"
                value={henryHubData ? convertPrice(henryHubData.price) : convertPrice(3.45)}
                change={henryHubData ? `${henryHubData.change.toFixed(1)}%` : "1.8%"}
                changeType={henryHubData && henryHubData.change >= 0 ? "up" : "down"}
                icon={Fuel}
                gradient="primary"
                subtitle="per MMBtu"
                marketId="natgas"
                source="EIA"
                lastUpdated={1}
              />
              <MetricCard
                title="Electricity (CAISO)"
                value={caiso ? convertPrice(caiso.price) : convertPrice(28.50)}
                change={caiso ? `${caiso.change.toFixed(1)}%` : "1.2%"}
                changeType={caiso && caiso.change >= 0 ? "up" : "down"}
                icon={Wind}
                gradient="primary"
                subtitle="per MWh"
                marketId="caiso"
                source="CAISO"
                lastUpdated={1}
              />
              <MetricCard
                title="Electricity (ERCOT)"
                value={ercot ? convertPrice(ercot.price) : convertPrice(32.90)}
                change={ercot ? `${ercot.change.toFixed(1)}%` : "0.8%"}
                changeType={ercot && ercot.change >= 0 ? "up" : "down"}
                icon={Sun}
                gradient="primary"
                subtitle="per MWh"
                marketId="ercot"
                source="ERCOT"
                lastUpdated={1}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                title="Forecast Accuracy"
                value={`${forecastAccuracy}%`}
                change="4.2%"
                changeType="up"
                icon={Shield}
                gradient="primary"
              />
              <MetricCard
                title="Active Regions"
                value={activeRegions.toString()}
                subtitle="Global coverage"
                icon={Globe}
                gradient="primary"
              />
            </div>
          </TabsContent>

          {/* Risk Analysis Tab */}
          <TabsContent value="risk" className="space-y-8">
            {/* Proprietary Risk Scores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Proprietary Risk Scores
                  </h2>
                  <p className="text-muted-foreground">
                    Advanced analytics combining cyber threats, geopolitical events, and infrastructure criticality
                  </p>
                </div>
                <button
                  onClick={() => triggerCalculation()}
                  disabled={isCalculating}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Activity className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
                  {isCalculating ? 'Calculating...' : 'Refresh Scores'}
                </button>
              </div>
              {isCalculating && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 animate-spin" />
                    <span>Calculating risk scores using real-time data from CVE feeds, energy markets, and threat intelligence...</span>
                  </div>
                </div>
              )}
              <RiskScoreCards />
            </div>

            {/* Threat-to-Asset Linkages */}
            <ThreatAssetLinker />

            {/* Real-time Threat Gauges */}
            <div className="space-y-8">
              {/* Electricity Markets */}
              {energyData?.energyPrices && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Electricity Markets - Cyber Threat Index</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {energyData.energyPrices
                        .filter(price => price.marketType === "Electricity")
                        .map((price) => {
                          const regionRisk = riskScores?.find(r => r.region.toLowerCase() === price.region.toLowerCase());
                          const cpsi = regionRisk?.cpsi || 50;
                          const ecs = regionRisk?.ecs || 75;
                          const impactProb = regionRisk?.impact_probability || 0.35;
                          
                          return (
                            <ThreatGauge
                              key={price.region}
                              title={`${price.region}`}
                              level={cpsi >= 80 ? "critical" : cpsi >= 60 ? "elevated" : "moderate"}
                              score={Math.round(cpsi)}
                              description={`CPSI: ${cpsi.toFixed(1)} | ECS: ${ecs.toFixed(1)} | Impact Probability: ${(impactProb * 100).toFixed(0)}%`}
                              type="cyber"
                            />
                          );
                        })}
                    </div>
                  </div>

                  {/* Oil & Gas Markets */}
                  {energyData.energyPrices.some(p => p.marketType !== "Electricity") && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Oil & Gas Markets - Cyber Threat Index</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {energyData.energyPrices
                          .filter(price => price.marketType !== "Electricity")
                          .map((price) => {
                            const regionRisk = riskScores?.find(r => r.region.toLowerCase() === price.region.toLowerCase());
                            const cpsi = regionRisk?.cpsi || 45;
                            const ecs = regionRisk?.ecs || 70;
                            const impactProb = regionRisk?.impact_probability || 0.30;
                            
                            return (
                              <ThreatGauge
                                key={price.region}
                                title={`${price.region}`}
                                level={cpsi >= 80 ? "critical" : cpsi >= 60 ? "elevated" : "moderate"}
                                score={Math.round(cpsi)}
                                description={`CPSI: ${cpsi.toFixed(1)} | ECS: ${ecs.toFixed(1)} | Impact Probability: ${(impactProb * 100).toFixed(0)}%`}
                                type="cyber"
                              />
                            );
                          })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Geopolitical Risk Index */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Geopolitical Risk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ThreatGauge
                    title="Global Geopolitical Risk Index"
                    level={geoScore >= 80 ? "critical" : geoScore >= 60 ? "high" : "moderate"}
                    score={geoScore}
                    description={
                      riskScores && riskScores.length > 0
                        ? `Average GEI across ${riskScores.length} monitored regions. Maritime and infrastructure risk elevated.`
                        : "Monitoring geopolitical events affecting energy markets."
                    }
                    type="geopolitical"
                  />
                </div>
              </div>
            </div>

            <CorrelationChart />
          </TabsContent>

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-8">
            <PriceForecast />
          </TabsContent>

          {/* Major News Tab */}
          <TabsContent value="news" className="space-y-8">
            <MajorNews />
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-8">
            <AlertFeed />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
