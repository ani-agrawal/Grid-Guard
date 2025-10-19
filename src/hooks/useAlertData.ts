import { useMemo } from 'react';
import { useCVEData } from './useCVEData';

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  timestamp: number;
  incidentId?: string;
  relatedMarkets?: string[];
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Handle invalid dates
  if (isNaN(diffMs) || diffMs < 0) {
    return 'Just now';
  }
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const useAlertData = () => {
  const { data: cveData, isLoading, error } = useCVEData();

  const alerts = useMemo(() => {
    const liveAlerts: Alert[] = [];
    
    if (!cveData) return liveAlerts;

    // Generate alerts from CISA KEV data
    if (cveData?.cisaKev && Array.isArray(cveData.cisaKev)) {
      cveData.cisaKev.slice(0, 2).forEach((kev: any, idx: number) => {
        try {
          const kevDate = new Date(kev.dateAdded);
          
          // Validate date
          if (isNaN(kevDate.getTime())) {
            console.warn('Invalid KEV date:', kev.dateAdded);
            return;
          }

          liveAlerts.push({
            id: `kev-${idx}-${kev.cveID || idx}`,
            type: kev.severity === 'critical' ? 'critical' : 'warning',
            title: `${kev.vendor || 'Vendor'} Vulnerability Detected`,
            description: (kev.title || kev.shortDescription || 'Security vulnerability').substring(0, 80) + '...',
            time: formatTimeAgo(kevDate),
            timestamp: kevDate.getTime(),
            incidentId: kev.cveID || `CVE-${idx + 1}`,
            relatedMarkets: ["PJM", "CAISO"],
          });
        } catch (err) {
          console.error('Error processing KEV alert:', err);
        }
      });
    }

    // Generate alerts from malware data
    if (cveData?.malwareFamilies && Array.isArray(cveData.malwareFamilies)) {
      cveData.malwareFamilies.slice(0, 1).forEach((malware: any, idx: number) => {
        try {
          // Try to parse lastSeen as a date, fallback to now
          let malwareDate = new Date();
          if (malware.lastSeen) {
            const parsedDate = new Date(malware.lastSeen);
            if (!isNaN(parsedDate.getTime())) {
              malwareDate = parsedDate;
            }
          }

          liveAlerts.push({
            id: `malware-${idx}-${malware.name || idx}`,
            type: malware.severity === 'critical' ? 'critical' : 'warning',
            title: `${malware.name || 'Malware'} Activity Detected`,
            description: `Targeting ${malware.targetSector || 'energy'} infrastructure`,
            time: formatTimeAgo(malwareDate),
            timestamp: malwareDate.getTime(),
            incidentId: `MAL-${idx + 1}`,
            relatedMarkets: ["ERCOT", "Henry Hub"],
          });
        } catch (err) {
          console.error('Error processing malware alert:', err);
        }
      });
    }

    // Add system info alert
    try {
      const now = new Date();
      const utcTime = now.toISOString().substring(11, 19);
      
      let updateTime = 'Just now';
      if (cveData.lastUpdated) {
        const lastUpdateDate = new Date(cveData.lastUpdated);
        if (!isNaN(lastUpdateDate.getTime())) {
          updateTime = formatTimeAgo(lastUpdateDate);
        }
      }

      liveAlerts.push({
        id: 'system-info',
        type: 'info',
        title: 'Threat Intelligence Updated',
        description: `${cveData?.totalCVEs || 0} vulnerabilities monitored · As of ${utcTime} UTC`,
        time: updateTime,
        timestamp: cveData.lastUpdated ? new Date(cveData.lastUpdated).getTime() : now.getTime(),
      });
    } catch (err) {
      console.error('Error processing system info alert:', err);
    }

    // Sort alerts by timestamp (most recent first)
    return liveAlerts.sort((a, b) => b.timestamp - a.timestamp);
  }, [cveData]);

  return {
    alerts,
    isLoading,
    error,
    alertCount: alerts.length,
  };
};
