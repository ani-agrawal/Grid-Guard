import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreatDelta {
  id: string;
  timestamp: string;
  type: "cyber" | "geo";
  severity: "critical" | "high" | "medium" | "low";
  delta: number;
  description: string;
  source: string;
  priceImpact: number;
}

const recentDeltas: ThreatDelta[] = [
  {
    id: "1",
    timestamp: "2m ago",
    type: "cyber",
    severity: "high",
    delta: 8,
    description: "CISA KEV: CVE-2025-1234 - Schneider Electric SCADA RCE",
    source: "CISA",
    priceImpact: 2.3,
  },
  {
    id: "2",
    timestamp: "15m ago",
    type: "geo",
    severity: "critical",
    delta: 12,
    description: "Iran-proxy forces targeting Red Sea shipping lanes",
    source: "OSINT",
    priceImpact: 5.1,
  },
  {
    id: "3",
    timestamp: "32m ago",
    type: "cyber",
    severity: "medium",
    delta: 5,
    description: "Industroyer2 variant detected in Ukrainian grid sector",
    source: "CERT-UA",
    priceImpact: 1.8,
  },
  {
    id: "4",
    timestamp: "1h ago",
    type: "cyber",
    severity: "high",
    delta: 7,
    description: "Dark web chatter: GE Digital OT credentials for sale",
    source: "ThreatConnect",
    priceImpact: 2.9,
  },
  {
    id: "5",
    timestamp: "2h ago",
    type: "geo",
    severity: "medium",
    delta: -3,
    description: "Diplomatic talks reduce Iran-Israel escalation probability",
    source: "Reuters",
    priceImpact: -1.2,
  },
];

export const RiskTape = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          CTI Risk Tape - Live Threat Deltas
        </h3>
        <Badge variant="outline" className="border-primary text-primary">
          Real-time
        </Badge>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {recentDeltas.map((delta) => (
          <div
            key={delta.id}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 hover:border-primary/50",
              "bg-secondary/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  delta.type === "cyber" ? "bg-gradient-cyber" : "bg-gradient-geo"
                )}
              >
                {delta.type === "cyber" ? (
                  <Shield className="h-5 w-5 text-white" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-white" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        delta.severity === "critical" && "border-destructive text-destructive",
                        delta.severity === "high" && "border-warning text-warning",
                        delta.severity === "medium" && "border-primary text-primary",
                        delta.severity === "low" && "border-muted-foreground text-muted-foreground"
                      )}
                    >
                      {delta.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {delta.source}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {delta.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-foreground mb-2">
                  {delta.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    {delta.delta > 0 ? (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-success" />
                    )}
                    <span
                      className={cn(
                        "font-semibold",
                        delta.delta > 0 ? "text-destructive" : "text-success"
                      )}
                    >
                      {delta.delta > 0 ? "+" : ""}
                      {delta.delta} risk pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Price impact:</span>
                    <span
                      className={cn(
                        "font-semibold",
                        delta.priceImpact > 0 ? "text-destructive" : "text-success"
                      )}
                    >
                      {delta.priceImpact > 0 ? "+" : ""}
                      {delta.priceImpact}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
