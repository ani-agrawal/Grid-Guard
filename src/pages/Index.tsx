import { DashboardHeader } from "@/components/Dashboard/Header";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { ThreatGauge } from "@/components/Dashboard/ThreatGauge";
import { PriceForecast } from "@/components/Dashboard/PriceForecast";
import { AlertFeed } from "@/components/Dashboard/AlertFeed";
import { CorrelationChart } from "@/components/Dashboard/CorrelationChart";
import { RegionalMap } from "@/components/Dashboard/RegionalMap";
import { RiskScoreCards } from "@/components/Dashboard/RiskScoreCards";
import { ThreatAssetLinker } from "@/components/Dashboard/ThreatAssetLinker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, DollarSign, Fuel, Shield, Globe, Wind, Sun, TrendingUp, AlertTriangle, Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="markets" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
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
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Markets Overview Tab */}
          <TabsContent value="markets" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <MetricCard
                title="Electricity (PJM)"
                value="$46.80"
                change="2.4%"
                changeType="up"
                icon={Zap}
                gradient="primary"
                subtitle="per MWh"
                marketId="pjm"
              />
              <MetricCard
                title="Brent Crude"
                value="$87.10"
                change="3.2%"
                changeType="up"
                icon={DollarSign}
                gradient="primary"
                subtitle="per barrel"
                marketId="brent"
              />
              <MetricCard
                title="Natural Gas"
                value="$3.45"
                change="1.8%"
                changeType="down"
                icon={Fuel}
                gradient="primary"
                subtitle="per MMBtu"
                marketId="natgas"
              />
              <MetricCard
                title="Wind Energy"
                value="$28.50"
                change="1.2%"
                changeType="up"
                icon={Wind}
                gradient="primary"
                subtitle="per MWh"
                marketId="wind"
              />
              <MetricCard
                title="Solar Energy"
                value="$32.90"
                change="0.8%"
                changeType="up"
                icon={Sun}
                gradient="primary"
                subtitle="per MWh"
                marketId="solar"
              />
            </div>

            <RegionalMap />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard
                title="Forecast Accuracy"
                value="92%"
                change="4.2%"
                changeType="up"
                icon={Shield}
                gradient="primary"
              />
              <MetricCard
                title="Active Regions"
                value="24"
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
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Proprietary Risk Scores
                </h2>
                <p className="text-muted-foreground">
                  Advanced analytics combining cyber threats, geopolitical events, and infrastructure criticality
                </p>
              </div>
              <RiskScoreCards />
            </div>

            {/* Threat-to-Asset Linkages */}
            <ThreatAssetLinker />

            {/* Traditional Threat Gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThreatGauge
                title="Cyber Threat Index"
                level="elevated"
                score={72}
                description="Increased OT/ICS targeting in energy sector. Ransomware activity elevated across utility vendors."
                type="cyber"
              />
              <ThreatGauge
                title="Geopolitical Risk Index"
                level="high"
                score={68}
                description="Iran-Israel proxy escalation ongoing. Maritime infrastructure showing elevated reconnaissance patterns."
                type="geopolitical"
              />
            </div>

            <CorrelationChart />
          </TabsContent>

          {/* Forecasts Tab */}
          <TabsContent value="forecasts" className="space-y-8">
            <PriceForecast />
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
