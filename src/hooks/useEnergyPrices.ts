import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnergyPrice {
  region: string;
  marketType: string;
  price: number;
  change: number;
  timestamp: string;
  forecast: string;
  threatLevel: string;
}

export const useEnergyPrices = () => {
  return useQuery({
    queryKey: ['energy-prices'],
    queryFn: async () => {
      console.log('Fetching energy prices from edge function');
      
      const { data, error } = await supabase.functions.invoke('fetch-energy-prices', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching energy prices:', error);
        throw error;
      }

      console.log('Energy prices received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  });
};
