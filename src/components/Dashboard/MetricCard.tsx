import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  gradient?: "primary" | "cyber" | "geo";
  subtitle?: string;
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "primary",
  subtitle,
}: MetricCardProps) => {
  return (
    <Card className="relative overflow-hidden border-border bg-gradient-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  changeType === "up" && "text-success",
                  changeType === "down" && "text-destructive",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {changeType === "up" && "↑"}
                {changeType === "down" && "↓"}
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            gradient === "primary" && "bg-gradient-primary shadow-glow-primary",
            gradient === "cyber" && "bg-gradient-cyber shadow-glow-cyber",
            gradient === "geo" && "bg-gradient-geo shadow-glow-geo"
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};
