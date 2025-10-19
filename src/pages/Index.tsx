import { DashboardHeader } from "@/components/Dashboard/Header";
import { MetricCard } from "@/components/Dashboard/MetricCard";
import { ThreatGauge } from "@/components/Dashboard/ThreatGauge";
import { PriceForecast } from "@/components/Dashboard/PriceForecast";
import { AlertFeed } from "@/components/Dashboard/AlertFeed";
import { CorrelationChart } from "@/components/Dashboard/CorrelationChart";
import { Zap, DollarSign, Fuel, Shield, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Market Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        {/* Threat Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CorrelationChart />
          </div>
          <div>
            <AlertFeed />
          </div>
        </div>

        {/* Forecasts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceForecast />
          
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
        </div>
      </main>
    </div>
  );
};

export default Index;
