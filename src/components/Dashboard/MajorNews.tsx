import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, Shield, AlertTriangle, ExternalLink } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: "energy" | "cyber";
  impact: "high" | "medium" | "low";
  source: string;
  publishedAt: string;
  region: string;
  url: string;
}

const newsData: NewsArticle[] = [
  {
    id: "1",
    title: "North Sea Oil Production Disrupted by Storm",
    summary: "Major offshore platforms shut down operations due to severe weather conditions, affecting Brent crude supply.",
    category: "energy",
    impact: "high",
    source: "Reuters Energy",
    publishedAt: "2 hours ago",
    region: "UK",
    url: "https://www.reuters.com/business/energy/north-sea-oil-production-storm-2024"
  },
  {
    id: "2",
    title: "Ransomware Attack Targets European Grid Operators",
    summary: "Coordinated cyberattack on multiple electricity distribution networks raises supply security concerns.",
    category: "cyber",
    impact: "high",
    source: "CyberSecurity Today",
    publishedAt: "4 hours ago",
    region: "EU",
    url: "https://www.cybersecuritytoday.com/ransomware-european-grid-operators-2024"
  },
  {
    id: "3",
    title: "Texas Natural Gas Prices Surge Amid Cold Snap",
    summary: "Unexpected freeze drives heating demand, pushing spot prices to highest levels this winter.",
    category: "energy",
    impact: "medium",
    source: "Energy Intelligence",
    publishedAt: "6 hours ago",
    region: "US",
    url: "https://www.energyintel.com/texas-natural-gas-prices-cold-snap-2024"
  },
  {
    id: "4",
    title: "OPEC+ Announces Production Cuts Extension",
    summary: "Coalition extends output restrictions through Q2, tightening global oil supply outlook.",
    category: "energy",
    impact: "high",
    source: "Bloomberg Energy",
    publishedAt: "8 hours ago",
    region: "Global",
    url: "https://www.bloomberg.com/news/articles/opec-production-cuts-extension-2024"
  },
  {
    id: "5",
    title: "Chinese Pipeline Network Hit by DDoS Attack",
    summary: "State-owned gas infrastructure faced coordinated distributed denial of service attack affecting monitoring systems.",
    category: "cyber",
    impact: "medium",
    source: "Asia Energy Watch",
    publishedAt: "10 hours ago",
    region: "Asia",
    url: "https://www.asiaenergywatch.com/chinese-pipeline-ddos-attack-2024"
  },
  {
    id: "6",
    title: "UK Electricity Grid Nears Capacity in Peak Demand",
    summary: "National Grid issues warning as renewable generation drops during low wind conditions.",
    category: "energy",
    impact: "medium",
    source: "UK Power News",
    publishedAt: "12 hours ago",
    region: "UK",
    url: "https://www.ukpowernews.com/electricity-grid-capacity-peak-demand-2024"
  },
  {
    id: "7",
    title: "New Zero-Day Vulnerability Found in SCADA Systems",
    summary: "Critical flaw discovered in widely-used industrial control systems could affect energy infrastructure globally.",
    category: "cyber",
    impact: "high",
    source: "Industrial Security Alert",
    publishedAt: "14 hours ago",
    region: "Global",
    url: "https://www.industrialsecurityalert.com/zero-day-scada-vulnerability-2024"
  },
  {
    id: "8",
    title: "US Strategic Petroleum Reserve Release Announced",
    summary: "Department of Energy plans to release 10M barrels to stabilize domestic fuel prices.",
    category: "energy",
    impact: "medium",
    source: "DOE News",
    publishedAt: "1 day ago",
    region: "US",
    url: "https://www.energy.gov/articles/strategic-petroleum-reserve-release-2024"
  }
];

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "default";
  }
};

const getCategoryIcon = (category: string) => {
  return category === "energy" ? <TrendingUp className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
};

const NewsCard = ({ article }: { article: NewsArticle }) => (
  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
    <Card className="p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${article.category === "energy" ? "bg-primary/10" : "bg-destructive/10"}`}>
          {getCategoryIcon(article.category)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors flex items-center gap-2">
              {article.title}
              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <Badge variant={getImpactColor(article.impact)} className="shrink-0">
              {article.impact}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{article.summary}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Newspaper className="h-3 w-3" />
              {article.source}
            </span>
            <span>{article.publishedAt}</span>
          </div>
        </div>
      </div>
    </Card>
  </a>
);

export const MajorNews = () => {
  const regions = ["All", "Global", "UK", "EU", "US", "Asia"];
  
  const getFilteredNews = (region: string) => {
    if (region === "All") return newsData;
    return newsData.filter(article => article.region === region);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Major News & Events</h2>
      </div>
      
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {regions.map(region => (
            <TabsTrigger key={region} value={region}>
              {region}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {regions.map(region => (
          <TabsContent key={region} value={region} className="space-y-4 mt-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span>Energy News</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span>Cyber Security</span>
              </div>
            </div>
            
            {getFilteredNews(region).length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No news articles for this region</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {getFilteredNews(region).map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
