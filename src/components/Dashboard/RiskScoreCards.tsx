import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRiskScores } from "@/hooks/useRiskScores";
import { Activity, TrendingUp, AlertTriangle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const scoreColors = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
  critical: "text-destructive",
};

const getScoreLevel = (score: number): "low" | "medium" | "high" | "critical" => {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  if (score < 80) return "high";
  return "critical";
};

export const RiskScoreCards = () => {
  const { data: scores, isLoading } = useRiskScores();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No risk scores available</p>
        </CardContent>
      </Card>
    );
  }

  // Organize scores by market type
  const electricityScores = scores.filter(s => 
    ['ERCOT', 'PJM', 'CAISO', 'MISO', 'SPP', 'NYISO', 'ISO-NE', 'Ukraine'].includes(s.region)
  );
  
  const oilGasScores = scores.filter(s => 
    !['ERCOT', 'PJM', 'CAISO', 'MISO', 'SPP', 'NYISO', 'ISO-NE', 'Ukraine'].includes(s.region)
  );

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Electricity Markets */}
        {electricityScores.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Electricity Markets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {electricityScores.map((score) => (
                <Card key={score.id} className="bg-gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{score.region}</span>
                      <Badge variant={score.explanation.trend === "increasing" ? "destructive" : "secondary"}>
                        {score.explanation.trend}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>Impact Probability: {(score.impact_probability * 100).toFixed(0)}%</div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Confidence bands:</span>{" "}
                        <span className="font-mono">68%: ±{(score.impact_probability * 15).toFixed(0)}pts</span>{" "}
                        <span className="text-muted-foreground">|</span>{" "}
                        <span className="font-mono">90%: ±{(score.impact_probability * 25).toFixed(0)}pts</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Event-Driven Volatility Index */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Volatility Index</span>
                        </div>
                        <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.volatility_index)])}>
                          {score.volatility_index.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${score.volatility_index}%` }}
                        />
                      </div>
                    </div>

                    {/* CPSI - Cyber Price Shock Index */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-cyber" />
                          <span className="text-sm font-medium">CPSI</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Cyber Price Shock Index</p>
                              <p className="text-xs">Range: 0-100. Measures vulnerability to cyber incidents affecting energy infrastructure. Factors: CVE prevalence, OT/ICS targeting, ransomware activity. Decays over 72h unless refreshed.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.cpsi)])}>
                          {score.cpsi.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-cyber h-full transition-all"
                          style={{ width: `${score.cpsi}%` }}
                        />
                      </div>
                    </div>

                    {/* GEI - Geopolitical Escalation Index */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-geopolitical" />
                          <span className="text-sm font-medium">GEI</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Geopolitical Escalation Index</p>
                              <p className="text-xs">Range: 0-100. Tracks political tensions, sanctions, maritime incidents, and infrastructure sabotage. Weighted by proximity to major energy corridors. 48h decay.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.gei)])}>
                          {score.gei.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-geopolitical h-full transition-all"
                          style={{ width: `${score.gei}%` }}
                        />
                      </div>
                    </div>

                    {/* ECS - Energy Criticality Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium">ECS</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold mb-1">Energy Criticality Score</p>
                              <p className="text-xs">Range: 0-100. Infrastructure dependency measure combining asset concentration, spare capacity, and seasonal demand. Higher = single points of failure. Example: 85 = 1 refinery outage → ≥15% price spike.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.ecs)])}>
                          {score.ecs.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-warning h-full transition-all"
                          style={{ width: `${score.ecs}%` }}
                        />
                      </div>
                    </div>

                    {/* Contributing Factors */}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs font-semibold mb-2">Key Factors:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {score.explanation.factors.slice(0, 3).map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Oil & Gas Markets */}
        {oilGasScores.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Oil & Gas Markets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oilGasScores.map((score) => (
          <Card key={score.id} className="bg-gradient-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{score.region}</span>
              <Badge variant={score.explanation.trend === "increasing" ? "destructive" : "secondary"}>
                {score.explanation.trend}
              </Badge>
            </CardTitle>
            <CardDescription className="space-y-1">
              <div>Impact Probability: {(score.impact_probability * 100).toFixed(0)}%</div>
              <div className="text-xs">
                <span className="text-muted-foreground">Confidence bands:</span>{" "}
                <span className="font-mono">68%: ±{(score.impact_probability * 15).toFixed(0)}pts</span>{" "}
                <span className="text-muted-foreground">|</span>{" "}
                <span className="font-mono">90%: ±{(score.impact_probability * 25).toFixed(0)}pts</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Event-Driven Volatility Index */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Volatility Index</span>
                </div>
                <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.volatility_index)])}>
                  {score.volatility_index.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${score.volatility_index}%` }}
                />
              </div>
            </div>

            {/* CPSI - Cyber Price Shock Index */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyber" />
                  <span className="text-sm font-medium">CPSI</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Cyber Price Shock Index</p>
                      <p className="text-xs">Range: 0-100. Measures vulnerability to cyber incidents affecting energy infrastructure. Factors: CVE prevalence, OT/ICS targeting, ransomware activity. Decays over 72h unless refreshed.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.cpsi)])}>
                  {score.cpsi.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyber h-full transition-all"
                  style={{ width: `${score.cpsi}%` }}
                />
              </div>
            </div>

            {/* GEI - Geopolitical Escalation Index */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-geopolitical" />
                  <span className="text-sm font-medium">GEI</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Geopolitical Escalation Index</p>
                      <p className="text-xs">Range: 0-100. Tracks political tensions, sanctions, maritime incidents, and infrastructure sabotage. Weighted by proximity to major energy corridors. 48h decay.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.gei)])}>
                  {score.gei.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-geopolitical h-full transition-all"
                  style={{ width: `${score.gei}%` }}
                />
              </div>
            </div>

            {/* ECS - Energy Criticality Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">ECS</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Energy Criticality Score</p>
                      <p className="text-xs">Range: 0-100. Infrastructure dependency measure combining asset concentration, spare capacity, and seasonal demand. Higher = single points of failure. Example: 85 = 1 refinery outage → ≥15% price spike.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={cn("text-lg font-bold", scoreColors[getScoreLevel(score.ecs)])}>
                  {score.ecs.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-warning h-full transition-all"
                  style={{ width: `${score.ecs}%` }}
                />
              </div>
            </div>

            {/* Contributing Factors */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-semibold mb-2">Key Factors:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {score.explanation.factors.slice(0, 3).map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-primary">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
