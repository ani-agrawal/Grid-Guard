import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Server, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetNode {
  id: string;
  name: string;
  type: "infrastructure" | "vendor" | "system";
  criticality: "critical" | "high" | "medium";
  exposureScore: number;
  activeThreats: number;
}

interface ThreatEdge {
  from: string;
  to: string;
  threatType: string;
  severity: "critical" | "high" | "medium";
  impact: number;
}

const assets: AssetNode[] = [
  {
    id: "grid-1",
    name: "Northeast Grid Substations",
    type: "infrastructure",
    criticality: "critical",
    exposureScore: 92,
    activeThreats: 3,
  },
  {
    id: "vendor-1",
    name: "Schneider Electric SCADA",
    type: "vendor",
    criticality: "critical",
    exposureScore: 88,
    activeThreats: 2,
  },
  {
    id: "vendor-2",
    name: "GE Digital iFIX",
    type: "vendor",
    criticality: "high",
    exposureScore: 76,
    activeThreats: 2,
  },
  {
    id: "system-1",
    name: "HMI Control Systems",
    type: "system",
    criticality: "critical",
    exposureScore: 84,
    activeThreats: 4,
  },
  {
    id: "vendor-3",
    name: "Siemens SIMATIC",
    type: "vendor",
    criticality: "high",
    exposureScore: 72,
    activeThreats: 1,
  },
  {
    id: "grid-2",
    name: "Generation Facilities",
    type: "infrastructure",
    criticality: "critical",
    exposureScore: 68,
    activeThreats: 2,
  },
];

const threats: ThreatEdge[] = [
  {
    from: "CVE-2025-1234",
    to: "vendor-1",
    threatType: "RCE Vulnerability",
    severity: "critical",
    impact: 8.5,
  },
  {
    from: "Industroyer2",
    to: "system-1",
    threatType: "Malware Campaign",
    severity: "critical",
    impact: 9.2,
  },
  {
    from: "Dark Web Intel",
    to: "vendor-2",
    threatType: "Credential Leak",
    severity: "high",
    impact: 7.8,
  },
];

export const ThreatAssetGraph = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Threat → Asset Dependency Map
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Critical infrastructure and vendor systems with active threat exposure
      </p>
      
      <div className="space-y-6">
        {/* Asset Nodes */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Server className="h-4 w-4" />
            Critical Assets & Vendors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  asset.criticality === "critical" && "bg-destructive/5 border-destructive/30",
                  asset.criticality === "high" && "bg-warning/5 border-warning/30",
                  asset.criticality === "medium" && "bg-secondary/50 border-border"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          asset.criticality === "critical" && "border-destructive text-destructive",
                          asset.criticality === "high" && "border-warning text-warning"
                        )}
                      >
                        {asset.criticality}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {asset.type}
                      </Badge>
                    </div>
                    <h5 className="font-semibold text-foreground text-sm">
                      {asset.name}
                    </h5>
                  </div>
                  {asset.activeThreats > 0 && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-bold">{asset.activeThreats}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        asset.exposureScore >= 80 && "bg-destructive",
                        asset.exposureScore >= 60 && asset.exposureScore < 80 && "bg-warning",
                        asset.exposureScore < 60 && "bg-success"
                      )}
                      style={{ width: `${asset.exposureScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {asset.exposureScore}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Threat Connections */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Active Threat → Asset Connections
          </h4>
          <div className="space-y-2">
            {threats.map((threat, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-secondary/50 border border-border"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant="destructive"
                    className="text-xs flex-shrink-0"
                  >
                    {threat.from}
                  </Badge>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-px bg-border relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-r border-t border-border" />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {assets.find((a) => a.id === threat.to)?.name}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{threat.threatType}</span>
                  <span className="font-semibold text-destructive">
                    Impact: {threat.impact}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Fragility Summary */}
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-foreground mb-1">
                Market Fragility Assessment
              </h5>
              <p className="text-sm text-muted-foreground">
                6 critical assets with 12 active threat vectors. Schneider Electric SCADA
                and HMI Control Systems represent single points of failure affecting 68% of
                regional grid capacity. Current exposure creates elevated price volatility risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
