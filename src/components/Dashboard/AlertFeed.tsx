import { Card } from "@/components/ui/card";
import { AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCVEData } from "@/hooks/useCVEData";

interface Alert {
  id: number;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  incidentId?: string;
  relatedMarkets?: string[];
}

const alerts: Alert[] = [
  {
    id: 1,
    type: "critical",
    title: "Ransomware Activity Detected",
    description: "Elevated OT targeting in Gulf Coast utilities sector",
    time: "2m ago",
    incidentId: "INC-001",
    relatedMarkets: ["ERCOT", "Henry Hub"],
  },
  {
    id: 2,
    type: "warning",
    title: "Iran-Israel Proxy Escalation",
    description: "Maritime port systems showing increased reconnaissance",
    time: "15m ago",
    incidentId: "INC-002",
    relatedMarkets: ["Brent Crude"],
  },
  {
    id: 3,
    type: "info",
    title: "ERCOT Price Normalization",
    description: "Grid stability restored, volatility decreasing",
    time: "1h ago",
    relatedMarkets: ["ERCOT"],
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
  const { data: cveData, isLoading } = useCVEData();

  // Generate alerts from CVE data
  const liveAlerts: Alert[] = [];
  
  if (cveData?.cisaKev) {
    cveData.cisaKev.slice(0, 2).forEach((kev: any, idx: number) => {
      const kevDate = new Date(kev.dateAdded);
      const now = new Date();
      const diffMs = now.getTime() - kevDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      let timeDisplay = '';
      if (diffMins < 1) timeDisplay = 'Just now';
      else if (diffMins < 60) timeDisplay = `${diffMins}m ago`;
      else if (diffMins < 1440) timeDisplay = `${Math.floor(diffMins / 60)}h ago`;
      else timeDisplay = `${Math.floor(diffMins / 1440)}d ago`;
      
      liveAlerts.push({
        id: idx + 1,
        type: kev.severity === 'critical' ? 'critical' : 'warning',
        title: `${kev.vendor} Vulnerability Detected`,
        description: kev.title.substring(0, 60) + '...',
        time: timeDisplay,
        incidentId: `CVE-${idx + 1}`,
        relatedMarkets: ["PJM", "CAISO"],
      });
    });
  }

  if (cveData?.malwareFamilies?.[0]) {
    const malware = cveData.malwareFamilies[0];
    liveAlerts.push({
      id: liveAlerts.length + 1,
      type: malware.severity === 'critical' ? 'critical' : 'warning',
      title: `${malware.name} Activity Detected`,
      description: `Targeting ${malware.targetSector} infrastructure`,
      time: malware.lastSeen,
      incidentId: `MAL-${liveAlerts.length + 1}`,
      relatedMarkets: ["ERCOT", "Henry Hub"],
    });
  }

  const now = new Date();
  const utcTime = now.toISOString().substring(11, 19);
  
  // Add a market info alert
  liveAlerts.push({
    id: liveAlerts.length + 1,
    type: 'info',
    title: 'Threat Intelligence Updated',
    description: `${cveData?.totalCVEs || 0} vulnerabilities monitored · As of ${utcTime} UTC`,
    time: cveData?.lastUpdated ? `${Math.floor((now.getTime() - new Date(cveData.lastUpdated).getTime()) / 60000)}m ago` : '0m ago'
  });

  const displayAlerts = liveAlerts.length > 0 ? liveAlerts : alerts;

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Active Alerts
        </h3>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        )}
      </div>
      <div className="space-y-3">
        {displayAlerts.map((alert) => {
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
    </Card>
  );
};
