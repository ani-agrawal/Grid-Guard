import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, TrendingUp, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { useNewsArticles } from "@/hooks/useNewsArticles";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  impact: string;
  source: string;
  published_at: string;
  url: string;
}

const getImpactColor = (impact: string) => {
  const lowerImpact = impact.toLowerCase();
  switch (lowerImpact) {
    case "high": return "destructive";
    case "medium": return "default";
    case "low": return "secondary";
    default: return "default";
  }
};

const getCategoryIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  return lowerCategory.includes("cyber") || lowerCategory.includes("security") ? 
    <Shield className="h-4 w-4" /> : 
    <TrendingUp className="h-4 w-4" />;
};

const getCategoryColor = (category: string) => {
  const lowerCategory = category.toLowerCase();
  return lowerCategory.includes("cyber") || lowerCategory.includes("security") ? 
    "bg-destructive/10" : 
    "bg-primary/10";
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const published = new Date(timestamp);
  const diffMs = now.getTime() - published.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
};

const NewsCard = ({ article }: { article: NewsArticle }) => (
  <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
    <Card className="p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getCategoryColor(article.category)}`}>
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
            <span>{formatTimeAgo(article.published_at)}</span>
          </div>
        </div>
      </div>
    </Card>
  </a>
);

export const MajorNews = () => {
  const { data: newsArticles, isLoading } = useNewsArticles();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Major News & Events</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-full h-32" />
          ))}
        </div>
      </div>
    );
  }

  const newsData = newsArticles || [];

  // Group articles by category
  const categories = ["All", "Cybersecurity", "Infrastructure", "Natural Gas", "Market", "Policy"];
  
  const getFilteredNews = (category: string) => {
    if (category === "All") return newsData;
    return newsData.filter(article => 
      article.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold">Major News & Events</h2>
      </div>
      
      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-4 mt-6">
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
            
            {getFilteredNews(category).length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No news articles available. News will refresh hourly.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {getFilteredNews(category).map(article => (
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