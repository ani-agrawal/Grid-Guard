import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useThreatAssetLinks } from "@/hooks/useThreatAssetLinks";
import { useThreatEvents } from "@/hooks/useThreatEvents";
import { ArrowRight, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const assetTypeIcons: Record<string, string> = {
  pipeline: "🔧",
  refinery: "🏭",
  substation: "⚡",
  transmission: "🔌",
  port: "🚢",
  storage: "🛢️",
};

export const ThreatAssetLinker = () => {
  const { data: links, isLoading: linksLoading } = useThreatAssetLinks();
  const { data: threats, isLoading: threatsLoading } = useThreatEvents();

  if (linksLoading || threatsLoading) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>Threat-to-Asset Linkages</CardTitle>
          <CardDescription>Real-time threat impact analysis on critical infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!links || links.length === 0) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle>Threat-to-Asset Linkages</CardTitle>
          <CardDescription>Real-time threat impact analysis on critical infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active threat linkages detected</p>
        </CardContent>
      </Card>
    );
  }

  const getThreatTitle = (threatId: string) => {
    const threat = threats?.find(t => t.id === threatId);
    return threat?.title || "Unknown Threat";
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Threat-to-Asset Linkages
        </CardTitle>
        <CardDescription>
          Connecting cyber threats to specific energy assets with spillover risk analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3"
          >
            {/* Threat Event */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="text-xs">
                    THREAT
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {link.confidence_level} confidence
                  </Badge>
                </div>
                <p className="text-sm font-medium">{getThreatTitle(link.threat_event_id)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span className="text-xs">impacts</span>
            </div>

            {/* Affected Asset */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{assetTypeIcons[link.asset_type]}</span>
                <div>
                  <p className="text-sm font-semibold">{link.asset_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {link.asset_type} • {link.region}
                  </p>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Impact Score:</span>
                  <span className={cn(
                    "font-bold",
                    link.impact_score >= 80 ? "text-destructive" : 
                    link.impact_score >= 50 ? "text-warning" : "text-success"
                  )}>
                    {link.impact_score.toFixed(0)}/100
                  </span>
                </div>
                {link.price_impact_24h && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-destructive" />
                    <span className="text-destructive font-bold">
                      +{link.price_impact_24h.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">24h volatility</span>
                  </div>
                )}
              </div>

              {/* Spillover Regions */}
              {link.spillover_regions && link.spillover_regions.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold mb-1">Spillover Risk:</p>
                  <div className="flex flex-wrap gap-1">
                    {link.spillover_regions.map((region, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {region}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="pt-2 bg-background/50 p-3 rounded text-xs">
                <p className="text-muted-foreground italic">{link.reasoning}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
