import { Card } from "@/components/ui/card";
import { AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertData } from "@/hooks/useAlertData";

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
  const { alerts, isLoading, error } = useAlertData();

  if (error) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Active Alerts
          </h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Unable to load alerts. Please try again later.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Active Alerts {alerts.length > 0 && `(${alerts.length})`}
        </h3>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        )}
      </div>
      
      {alerts.length === 0 && !isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No active alerts at this time</p>
        </div>
      ) : (
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
                <p className="text-xs text-muted-foreground mb-2">
                  {alert.description}
                </p>
                {alert.relatedMarkets && alert.relatedMarkets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {alert.relatedMarkets.map((market, idx) => (
                      <span key={idx} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                        {market}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}
    </Card>
  );
};
