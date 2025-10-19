import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThreatAssetLink {
  id: string;
  threat_event_id: string;
  asset_name: string;
  asset_type: "pipeline" | "refinery" | "substation" | "transmission" | "port" | "storage";
  region: string;
  impact_score: number;
  spillover_regions: string[];
  price_impact_24h: number;
  confidence_level: "low" | "medium" | "high";
  reasoning: string;
  created_at: string;
}

export const useThreatAssetLinks = () => {
  return useQuery({
    queryKey: ["threat-asset-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("threat_asset_links")
        .select("*")
        .order("impact_score", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as ThreatAssetLink[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
