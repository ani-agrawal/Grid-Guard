import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCVEData = () => {
  return useQuery({
    queryKey: ['cve-data'],
    queryFn: async () => {
      console.log('Fetching CVE data from edge function');
      
      const { data, error } = await supabase.functions.invoke('fetch-cve-data', {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching CVE data:', error);
        throw error;
      }

      console.log('CVE data received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
};
