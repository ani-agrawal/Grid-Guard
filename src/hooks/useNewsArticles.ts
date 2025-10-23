import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  impact: string;
  url: string;
  published_at: string;
  fetched_at: string;
}

export const useNewsArticles = () => {
  return useQuery({
    queryKey: ["news-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as NewsArticle[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};