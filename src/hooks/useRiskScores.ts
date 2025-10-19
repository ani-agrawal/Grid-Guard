import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RiskScore {
  id: string;
  region: string;
  cpsi: number;
  gei: number;
  ecs: number;
  volatility_index: number;
  impact_probability: number;
  explanation: {
    factors: string[];
    trend: string;
  };
  calculated_at: string;
}

export const useRiskScores = () => {
  return useQuery({
    queryKey: ["risk-scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_scores")
        .select("*")
        .order("calculated_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        explanation: item.explanation as { factors: string[]; trend: string }
      })) as RiskScore[];
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
