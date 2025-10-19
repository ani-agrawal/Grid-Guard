import { Card } from "@/components/ui/card";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: number;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
}

const alerts: Alert[] = [
  {
    id: 1,
    type: "critical",
    title: "Ransomware Activity Detected",
    description: "Elevated OT targeting in Gulf Coast utilities sector",
    time: "2m ago",
  },
  {
    id: 2,
    type: "warning",
    title: "Iran-Israel Proxy Escalation",
    description: "Maritime port systems showing increased reconnaissance",
    time: "15m ago",
  },
  {
    id: 3,
    type: "info",
    title: "ERCOT Price Normalization",
    description: "Grid stability restored, volatility decreasing",
    time: "1h ago",
  },
];

const alertConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  info: {
    icon: Info,
    color: "text-primary",
    bg: "bg-primary/10",
  },
};

export const AlertFeed = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Active Alerts
      </h3>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          return (
            <div
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border border-border flex gap-3",
                config.bg
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", config.color)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-foreground text-sm">
                    {alert.title}
                  </h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
