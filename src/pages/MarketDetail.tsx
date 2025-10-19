import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Shield, AlertTriangle } from "lucide-react";
import { ForecastChart } from "@/components/MarketDetail/ForecastChart";
import { RiskTape } from "@/components/MarketDetail/RiskTape";
import { EvidencePanel } from "@/components/MarketDetail/EvidencePanel";
import { ThreatAssetGraph } from "@/components/MarketDetail/ThreatAssetGraph";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const marketData = {
  pjm: {
    name: "PJM Interconnection",
    type: "Electricity",
    unit: "$/MWh",
    currentPrice: 46.80,
    change: 2.4,
    cyberRisk: 72,
    geoRisk: 45,
    forecast48h: 49.25,
    region: "US Northeast",
    priceHistory: [
      { time: "Mon", price: 44.2, volume: 1250, volatility: 12 },
      { time: "Tue", price: 45.1, volume: 1320, volatility: 15 },
      { time: "Wed", price: 44.8, volume: 1280, volatility: 13 },
      { time: "Thu", price: 46.3, volume: 1390, volatility: 18 },
      { time: "Fri", price: 46.8, volume: 1410, volatility: 16 },
    ],
    riskFactors: [
      { factor: "Ransomware targeting utility vendors", impact: "High", timestamp: "2h ago" },
      { factor: "Grid infrastructure modernization", impact: "Medium", timestamp: "1d ago" },
      { factor: "Increased renewable integration", impact: "Low", timestamp: "3d ago" },
    ],
    correlationData: [
      { hour: "00", price: 42, cyber: 65, geo: 40 },
      { hour: "04", price: 43, cyber: 68, geo: 42 },
      { hour: "08", price: 45, cyber: 70, geo: 43 },
      { hour: "12", price: 46, cyber: 72, geo: 44 },
      { hour: "16", price: 47, cyber: 73, geo: 45 },
      { hour: "20", price: 46.5, cyber: 71, geo: 45 },
      { hour: "Now", price: 46.8, cyber: 72, geo: 45 },
    ],
  },
  brent: {
    name: "Brent Crude Oil",
    type: "Oil",
    unit: "$/bbl",
    currentPrice: 87.10,
    change: 3.2,
    cyberRisk: 58,
    geoRisk: 68,
    forecast48h: 95.20,
    region: "Global",
    priceHistory: [
      { time: "Mon", price: 82.5, volume: 2450, volatility: 22 },
      { time: "Tue", price: 84.2, volume: 2520, volatility: 25 },
      { time: "Wed", price: 85.8, volume: 2480, volatility: 23 },
      { time: "Thu", price: 86.4, volume: 2590, volatility: 28 },
      { time: "Fri", price: 87.1, volume: 2610, volatility: 26 },
    ],
    riskFactors: [
      { factor: "Iran-Israel proxy escalation ongoing", impact: "Critical", timestamp: "15m ago" },
      { factor: "Maritime port OT systems targeted", impact: "High", timestamp: "1h ago" },
      { factor: "OPEC+ production adjustments", impact: "Medium", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 83, cyber: 52, geo: 60 },
      { hour: "04", price: 84, cyber: 54, geo: 62 },
      { hour: "08", price: 85, cyber: 55, geo: 64 },
      { hour: "12", price: 86, cyber: 56, geo: 66 },
      { hour: "16", price: 87, cyber: 58, geo: 67 },
      { hour: "20", price: 87.5, cyber: 59, geo: 68 },
      { hour: "Now", price: 87.1, cyber: 58, geo: 68 },
    ],
  },
  natgas: {
    name: "Natural Gas",
    type: "Gas",
    unit: "$/MMBtu",
    currentPrice: 3.45,
    change: -1.8,
    cyberRisk: 48,
    geoRisk: 52,
    forecast48h: 3.39,
    region: "Henry Hub",
    priceHistory: [
      { time: "Mon", price: 3.52, volume: 980, volatility: 18 },
      { time: "Tue", price: 3.48, volume: 1020, volatility: 16 },
      { time: "Wed", price: 3.51, volume: 990, volatility: 19 },
      { time: "Thu", price: 3.47, volume: 1050, volatility: 15 },
      { time: "Fri", price: 3.45, volume: 1030, volatility: 14 },
    ],
    riskFactors: [
      { factor: "Storage levels above seasonal average", impact: "Low", timestamp: "4h ago" },
      { factor: "LNG export facility maintenance", impact: "Medium", timestamp: "12h ago" },
      { factor: "Pipeline monitoring systems secure", impact: "Low", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 3.50, cyber: 45, geo: 48 },
      { hour: "04", price: 3.49, cyber: 46, geo: 49 },
      { hour: "08", price: 3.48, cyber: 46, geo: 50 },
      { hour: "12", price: 3.47, cyber: 47, geo: 51 },
      { hour: "16", price: 3.46, cyber: 48, geo: 52 },
      { hour: "20", price: 3.45, cyber: 48, geo: 52 },
      { hour: "Now", price: 3.45, cyber: 48, geo: 52 },
    ],
  },
};

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const market = marketData[id as keyof typeof marketData];

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Market Not Found</h1>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Market Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {market.name}
              </h1>
              <p className="text-muted-foreground">
                {market.type} • {market.region}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-foreground mb-1">
                ${market.currentPrice}
              </div>
              <div className="flex items-center gap-2 justify-end">
                {market.change > 0 ? (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-success" />
                )}
                <span
                  className={cn(
                    "text-xl font-semibold",
                    market.change > 0 ? "text-destructive" : "text-success"
                  )}
                >
                  {market.change > 0 ? "+" : ""}
                  {market.change}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                per {market.unit.split("/")[1]}
              </p>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center shadow-glow-cyber">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cyber Risk</p>
                  <p className="text-2xl font-bold text-cyber">{market.cyberRisk}/100</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-geo flex items-center justify-center shadow-glow-geo">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Geopolitical Risk</p>
                  <p className="text-2xl font-bold text-geopolitical">{market.geoRisk}/100</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">48h Forecast</p>
                  <p className="text-2xl font-bold text-primary">${market.forecast48h}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Forecasts */}
          <div className="lg:col-span-2 space-y-6">
            <ForecastChart />
            
            {/* Price History */}
            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                5-Day Price History
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={market.priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Right Column - Risk Tape */}
          <div>
            <RiskTape />
          </div>
        </div>

        {/* Evidence & Threat Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EvidencePanel />
          <ThreatAssetGraph />
        </div>

        {/* Risk Factors */}
        <Card className="p-6 bg-gradient-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Active Risk Factors
          </h3>
          <div className="space-y-3">
            {market.riskFactors.map((factor, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-secondary/50 border border-border flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                        factor.impact === "Critical" && "bg-destructive/20 text-destructive",
                        factor.impact === "High" && "bg-warning/20 text-warning",
                        factor.impact === "Medium" && "bg-primary/20 text-primary",
                        factor.impact === "Low" && "bg-success/20 text-success"
                      )}
                    >
                      {factor.impact}
                    </span>
                  </div>
                  <p className="text-foreground">{factor.factor}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {factor.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MarketDetail;
