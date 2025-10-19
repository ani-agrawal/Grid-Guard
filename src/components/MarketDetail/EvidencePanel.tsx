import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Bug, History } from "lucide-react";
import { cn } from "@/lib/utils";

interface KEVItem {
  id: string;
  cveId: string;
  vendor: string;
  product: string;
  vulnerability: string;
  dateAdded: string;
  dueDate: string;
  exploited: boolean;
}

interface VendorAdvisory {
  id: string;
  vendor: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  date: string;
  affectedProducts: string[];
  url: string;
}

interface MalwareNote {
  id: string;
  family: string;
  variant: string;
  targetSector: string;
  capabilities: string[];
  lastSeen: string;
  attribution: string;
}

interface HistoricalAnalog {
  id: string;
  date: string;
  incident: string;
  threatType: "cyber" | "geo";
  similarity: number;
  priceImpact: number;
  duration: string;
  resolution: string;
}

const kevItems: KEVItem[] = [
  {
    id: "1",
    cveId: "CVE-2025-1234",
    vendor: "Schneider Electric",
    product: "EcoStruxure SCADA Expert",
    vulnerability: "Remote Code Execution in HMI",
    dateAdded: "2025-10-18",
    dueDate: "2025-11-08",
    exploited: true,
  },
  {
    id: "2",
    cveId: "CVE-2025-5678",
    vendor: "Siemens",
    product: "SIMATIC PCS 7",
    vulnerability: "Authentication Bypass",
    dateAdded: "2025-10-17",
    dueDate: "2025-11-07",
    exploited: true,
  },
];

const advisories: VendorAdvisory[] = [
  {
    id: "1",
    vendor: "GE Digital",
    title: "Critical Vulnerabilities in iFIX SCADA Software",
    severity: "critical",
    date: "2025-10-19",
    affectedProducts: ["iFIX 6.5", "iFIX 7.0"],
    url: "#",
  },
  {
    id: "2",
    vendor: "Rockwell Automation",
    title: "ControlLogix PLC Firmware Update Required",
    severity: "high",
    date: "2025-10-18",
    affectedProducts: ["ControlLogix 5580", "CompactLogix 5380"],
    url: "#",
  },
];

const malwareNotes: MalwareNote[] = [
  {
    id: "1",
    family: "Industroyer",
    variant: "Industroyer2",
    targetSector: "Electric Grid",
    capabilities: ["IEC 104 Protocol", "Grid Disruption", "Substation Control"],
    lastSeen: "2025-10-15",
    attribution: "Sandworm (GRU)",
  },
  {
    id: "2",
    family: "PIPEDREAM",
    variant: "PIPEDREAM.v2",
    targetSector: "Oil & Gas",
    capabilities: ["OPC UA Exploitation", "Safety System Manipulation"],
    lastSeen: "2025-10-10",
    attribution: "APT (Unknown)",
  },
];

const historicalAnalogs: HistoricalAnalog[] = [
  {
    id: "1",
    date: "2022-04-08",
    incident: "Colonial Pipeline Ransomware (DarkSide)",
    threatType: "cyber",
    similarity: 87,
    priceImpact: 18.5,
    duration: "6 days",
    resolution: "Ransom paid, systems restored",
  },
  {
    id: "2",
    date: "2015-12-23",
    incident: "Ukraine Power Grid Attack (BlackEnergy/Industroyer)",
    threatType: "cyber",
    similarity: 82,
    priceImpact: 12.3,
    duration: "3 days",
    resolution: "Manual restoration, grid recovery",
  },
  {
    id: "3",
    date: "2019-09-14",
    incident: "Saudi Aramco Drone Attacks (Yemen-Iran proxy)",
    threatType: "geo",
    similarity: 78,
    priceImpact: 19.8,
    duration: "11 days",
    resolution: "Infrastructure repairs completed",
  },
  {
    id: "4",
    date: "2021-05-07",
    incident: "Iran-Israel Cyber Escalation (Port of Eilat)",
    threatType: "geo",
    similarity: 74,
    priceImpact: 8.2,
    duration: "4 days",
    resolution: "Diplomatic de-escalation",
  },
  {
    id: "5",
    date: "2023-02-10",
    incident: "Turkish Pipeline Sabotage Attempt",
    threatType: "geo",
    similarity: 71,
    priceImpact: 6.5,
    duration: "2 days",
    resolution: "Security forces intervention",
  },
];

export const EvidencePanel = () => {
  return (
    <Card className="p-6 bg-gradient-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Evidence & Intelligence Sources
      </h3>
      
      <Tabs defaultValue="kev" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="kev">CISA KEV</TabsTrigger>
          <TabsTrigger value="advisories">Advisories</TabsTrigger>
          <TabsTrigger value="malware">Malware</TabsTrigger>
          <TabsTrigger value="analogs">Analogs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="kev" className="mt-0 space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            Known Exploited Vulnerabilities affecting energy sector OT/ICS systems
          </p>
          {kevItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="text-xs">
                      {item.cveId}
                    </Badge>
                    {item.exploited && (
                      <Badge variant="outline" className="text-xs border-warning text-warning">
                        ACTIVE EXPLOIT
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground">
                    {item.vendor} - {item.product}
                  </h4>
                </div>
              </div>
              <p className="text-sm text-foreground mb-2">{item.vulnerability}</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Added: {item.dateAdded}</span>
                <span>Remediation Due: {item.dueDate}</span>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="advisories" className="mt-0 space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            Vendor security advisories from Schneider, Siemens, GE, Rockwell, ABB
          </p>
          {advisories.map((advisory) => (
            <div
              key={advisory.id}
              className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-muted-foreground">
                      {advisory.vendor}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        advisory.severity === "critical" && "border-destructive text-destructive",
                        advisory.severity === "high" && "border-warning text-warning"
                      )}
                    >
                      {advisory.severity}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {advisory.title}
                  </h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {advisory.affectedProducts.map((product, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{advisory.date}</span>
                <a
                  href={advisory.url}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View Advisory <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="malware" className="mt-0 space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            Active malware families targeting energy infrastructure
          </p>
          {malwareNotes.map((malware) => (
            <div
              key={malware.id}
              className="p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex items-start gap-3 mb-2">
                <Bug className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      {malware.family}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {malware.variant}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Target: {malware.targetSector}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {malware.capabilities.map((cap, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Last Seen: {malware.lastSeen}</span>
                    <span>Attribution: {malware.attribution}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
        
        <TabsContent value="analogs" className="mt-0 space-y-3">
          <p className="text-sm text-muted-foreground mb-3">
            Top 5 historical incidents with similar threat profiles and realized market impact
          </p>
          {historicalAnalogs.map((analog, index) => (
            <div
              key={analog.id}
              className="p-4 rounded-lg bg-secondary/50 border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <History className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {analog.date}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        analog.threatType === "cyber" ? "border-cyber text-cyber" : "border-geopolitical text-geopolitical"
                      )}
                    >
                      {analog.threatType}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {analog.similarity}% match
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {analog.incident}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Price Impact:</span>
                      <span className="ml-1 font-semibold text-destructive">
                        +{analog.priceImpact}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-1 font-semibold text-foreground">
                        {analog.duration}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resolution:</span>
                      <span className="ml-1 text-foreground">
                        {analog.resolution}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
