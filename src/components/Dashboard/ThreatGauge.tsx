import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ThreatGaugeProps {
  title: string;
  level: "low" | "moderate" | "elevated" | "high" | "critical";
  score: number;
  description: string;
  type: "cyber" | "geopolitical";
}

const levelColors = {
  low: "text-success",
  moderate: "text-primary",
  elevated: "text-warning",
  high: "text-warning",
  critical: "text-destructive",
};

const levelBg = {
  low: "bg-success/10",
  moderate: "bg-primary/10",
  elevated: "bg-warning/10",
  high: "bg-warning/10",
  critical: "bg-destructive/10",
};

export const ThreatGauge = ({
  title,
  level,
  score,
  description,
  type,
}: ThreatGaugeProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        </div>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold uppercase",
            levelColors[level],
            levelBg[level]
          )}
        >
          {level}
        </div>
      </div>

      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-4">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
            type === "cyber" ? "bg-gradient-cyber" : "bg-gradient-geo"
          )}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
};
