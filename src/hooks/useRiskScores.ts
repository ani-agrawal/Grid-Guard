import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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

// Function to trigger risk score calculation
export const calculateRiskScores = async () => {
  console.log('Triggering risk score calculation...');
  const { data, error } = await supabase.functions.invoke('calculate-risk-scores');
  
  if (error) {
    console.error('Error calculating risk scores:', error);
    throw error;
  }
  
  console.log('Risk scores calculated successfully:', data);
  return data;
};

export const useRiskScores = (autoCalculate: boolean = true) => {
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Trigger calculation on mount if enabled
    if (autoCalculate) {
      const triggerCalculation = async () => {
        try {
          setIsCalculating(true);
          await calculateRiskScores();
        } catch (error) {
          console.error('Failed to calculate risk scores:', error);
        } finally {
          setIsCalculating(false);
        }
      };

      // Trigger immediately on mount
      triggerCalculation();

      // Then trigger every 5 minutes
      const interval = setInterval(triggerCalculation, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [autoCalculate]);

  const query = useQuery({
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    ...query,
    isCalculating,
    calculateRiskScores: async () => {
      setIsCalculating(true);
      try {
        await calculateRiskScores();
        await query.refetch();
      } finally {
        setIsCalculating(false);
      }
    }
  };
};
