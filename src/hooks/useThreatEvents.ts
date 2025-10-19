import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThreatEvent {
  id: string;
  event_type: "cyber" | "geopolitical" | "infrastructure";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affected_regions: string[];
  affected_assets: string[];
  source: string;
  confidence_score: number;
  detected_at: string;
}

export const useThreatEvents = () => {
  return useQuery({
    queryKey: ["threat-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("threat_events")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as ThreatEvent[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
