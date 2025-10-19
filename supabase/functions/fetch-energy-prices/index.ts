import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnergyPrice {
  region: string;
  marketType: string;
  price: number;
  change: number;
  timestamp: string;
  forecast: string;
  threatLevel: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching energy price data from EIA and other sources');

    // Fetch WTI Crude Oil prices from EIA open data
    const wtiResponse = await fetch(
      'https://api.eia.gov/v2/petroleum/pri/spt/data/?frequency=daily&data[0]=value&facets[product][]=EPCBRENT&facets[product][]=EPCWTI&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5'
    );

    let energyPrices: EnergyPrice[] = [];

    if (wtiResponse.ok) {
      const wtiData = await wtiResponse.json();
      console.log('EIA data received:', wtiData);

      // Process EIA data
      if (wtiData.response?.data) {
        const latestWTI = wtiData.response.data.find((d: any) => d.product === 'EPCWTI');
        const latestBrent = wtiData.response.data.find((d: any) => d.product === 'EPCBRENT');

        if (latestWTI) {
          energyPrices.push({
            region: 'WTI Cushing',
            marketType: 'Crude Oil',
            price: latestWTI.value,
            change: (Math.random() * 6 - 3), // Simulated change
            timestamp: latestWTI.period,
            forecast: latestWTI.value > 75 ? 'Bullish' : 'Stable',
            threatLevel: latestWTI.value > 80 ? 'High' : 'Medium'
          });
        }

        if (latestBrent) {
          energyPrices.push({
            region: 'Brent North Sea',
            marketType: 'Crude Oil',
            price: latestBrent.value,
            change: (Math.random() * 6 - 3),
            timestamp: latestBrent.period,
            forecast: latestBrent.value > 78 ? 'Bullish' : 'Stable',
            threatLevel: latestBrent.value > 82 ? 'High' : 'Medium'
          });
        }
      }
    }

    // Add simulated data for regions without free APIs
    const simulatedRegions = [
      { region: 'ERCOT', marketType: 'Electricity', basePrice: 45, lat: 30.2672, lng: -97.7431 },
      { region: 'CAISO', marketType: 'Electricity', basePrice: 52, lat: 34.0522, lng: -118.2437 },
      { region: 'PJM', marketType: 'Electricity', basePrice: 38, lat: 39.9526, lng: -75.1652 },
      { region: 'Henry Hub', marketType: 'Natural Gas', basePrice: 2.85, lat: 30.0, lng: -92.0 },
      { region: 'TTF Netherlands', marketType: 'Natural Gas', basePrice: 35, lat: 52.3676, lng: 4.9041 },
      { region: 'Singapore', marketType: 'LNG', basePrice: 12.5, lat: 1.3521, lng: 103.8198 },
      { region: 'Tokyo', marketType: 'LNG', basePrice: 13.2, lat: 35.6762, lng: 139.6503 },
      { region: 'NBP UK', marketType: 'Natural Gas', basePrice: 32, lat: 51.5074, lng: -0.1278 }
    ];

    simulatedRegions.forEach(region => {
      const variance = (Math.random() * 0.2 - 0.1) * region.basePrice;
      const price = region.basePrice + variance;
      const change = (Math.random() * 10 - 5);

      energyPrices.push({
        region: region.region,
        marketType: region.marketType,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        timestamp: new Date().toISOString(),
        forecast: change > 2 ? 'Bullish' : change < -2 ? 'Bearish' : 'Stable',
        threatLevel: Math.abs(change) > 5 ? 'High' : Math.abs(change) > 2 ? 'Medium' : 'Low'
      });
    });

    console.log('Processed energy prices:', energyPrices.length);

    return new Response(
      JSON.stringify({ 
        energyPrices,
        timestamp: new Date().toISOString(),
        source: 'EIA Open Data & Market Simulations'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error fetching energy prices:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        energyPrices: []
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
