import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  gradient?: "primary" | "cyber" | "geo";
  subtitle?: string;
  marketId?: string;
  source?: string;
  lastUpdated?: number; // minutes ago
}

export const MetricCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  gradient = "primary",
  subtitle,
  marketId,
  source,
  lastUpdated = 1,
}: MetricCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (marketId) {
      navigate(`/market/${marketId}`);
    }
  };

  const getLagColor = () => {
    if (lastUpdated < 2) return "bg-success";
    if (lastUpdated <= 10) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-border bg-gradient-card p-6",
        marketId && "cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            {source && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                  {source}
                </span>
                <div className={cn("h-1.5 w-1.5 rounded-full", getLagColor())} title={`Updated ${lastUpdated}m ago`} />
              </div>
            )}
          </div>
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
                {changeType === "up" && "↑ +"}
                {changeType === "down" && "↓ "}
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
