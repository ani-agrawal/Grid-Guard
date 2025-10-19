import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskScore {
  region: string;
  cpsi: number;
  gei: number;
  ecs: number;
  volatility_index: number;
  impact_probability: number;
  explanation: {
    trend: string;
    factors: string[];
  };
}

// Region infrastructure criticality data (based on grid interconnectivity)
const REGION_CRITICALITY: Record<string, number> = {
  'ERCOT': 88.3, // Large isolated grid
  'PJM': 85.6, // Largest interconnected grid
  'CAISO': 82.1, // Critical West Coast hub
  'Ukraine': 92.1, // Active conflict zone with ENTSO-E connections
  'MISO': 79.4,
  'SPP': 76.8,
  'NYISO': 84.2,
  'ISO-NE': 81.5,
};

// Calculate CPSI (Cyber-Physical Systems Index)
function calculateCPSI(
  cveData: any,
  threatEvents: any[],
  region: string
): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // CVE severity impact (0-40 points)
  if (cveData?.cisaKev) {
    const criticalCVEs = cveData.cisaKev.filter((c: any) => c.severity === 'critical').length;
    const highCVEs = cveData.cisaKev.filter((c: any) => c.severity === 'high').length;
    const cveScore = Math.min(40, (criticalCVEs * 4) + (highCVEs * 2));
    score += cveScore;
    
    if (criticalCVEs > 0) {
      factors.push(`${criticalCVEs} critical CVEs detected`);
    }
  }

  // Threat events affecting region (0-35 points)
  const regionalThreats = threatEvents.filter(t => 
    t.event_type === 'cyber' && 
    t.affected_regions?.includes(region)
  );
  
  const criticalThreats = regionalThreats.filter(t => t.severity === 'critical').length;
  const highThreats = regionalThreats.filter(t => t.severity === 'high').length;
  const threatScore = Math.min(35, (criticalThreats * 7) + (highThreats * 3));
  score += threatScore;

  if (regionalThreats.length > 0) {
    factors.push(`${regionalThreats.length} active cyber threats in region`);
  }

  // Malware family targeting (0-25 points)
  if (cveData?.malwareFamilies) {
    const activeMalware = cveData.malwareFamilies.filter((m: any) => {
      const daysSinceLastSeen = (Date.now() - new Date(m.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastSeen < 30;
    });
    
    const malwareScore = Math.min(25, activeMalware.length * 8);
    score += malwareScore;
    
    if (activeMalware.length > 0) {
      factors.push(`${activeMalware.length} active malware families targeting sector`);
    }
  }

  return { score: Math.min(100, score), factors };
}

// Calculate GEI (Geopolitical Event Index)
function calculateGEI(
  threatEvents: any[],
  region: string
): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // Regional geopolitical events (0-60 points)
  const geoThreats = threatEvents.filter(t => 
    t.event_type === 'geopolitical' && 
    t.affected_regions?.includes(region)
  );

  const criticalGeo = geoThreats.filter(t => t.severity === 'critical').length;
  const highGeo = geoThreats.filter(t => t.severity === 'high').length;
  const geoScore = Math.min(60, (criticalGeo * 15) + (highGeo * 8));
  score += geoScore;

  if (geoThreats.length > 0) {
    factors.push(`${geoThreats.length} geopolitical events affecting region`);
  }

  // Conflict zone proximity (0-40 points)
  const conflictRegions = ['Ukraine', 'Middle East', 'Persian Gulf'];
  if (conflictRegions.includes(region)) {
    score += 40;
    factors.push('Active conflict zone');
  } else {
    // Check spillover risk
    const spilloverRisk = geoThreats.some(t => 
      t.affected_regions?.some((r: string) => conflictRegions.includes(r))
    );
    if (spilloverRisk) {
      score += 20;
      factors.push('Spillover risk from nearby conflict');
    }
  }

  return { score: Math.min(100, score), factors };
}

// Calculate Volatility Index
function calculateVolatilityIndex(
  energyPrices: any[],
  region: string,
  historicalPrices?: number[]
): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  const regionPrice = energyPrices.find(p => p.region === region);
  
  if (regionPrice) {
    // Price change volatility (0-50 points)
    const absChange = Math.abs(regionPrice.change);
    const volatilityScore = Math.min(50, absChange * 5);
    score += volatilityScore;

    if (absChange > 5) {
      factors.push(`High price volatility: ${absChange.toFixed(1)}% change`);
    }

    // Historical volatility (0-30 points)
    if (historicalPrices && historicalPrices.length > 0) {
      const mean = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
      const variance = historicalPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / historicalPrices.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = (stdDev / mean) * 100;
      
      const histVolScore = Math.min(30, coefficientOfVariation * 3);
      score += histVolScore;
    }

    // Market stress indicator (0-20 points)
    if (regionPrice.threatLevel === 'High') {
      score += 20;
      factors.push('Market stress indicators elevated');
    } else if (regionPrice.threatLevel === 'Medium') {
      score += 10;
    }
  }

  return { score: Math.min(100, score), factors };
}

// Calculate Impact Probability
function calculateImpactProbability(
  cpsi: number,
  gei: number,
  ecs: number,
  volatilityIndex: number
): number {
  // Weighted combination of indices
  const weights = {
    cpsi: 0.35,
    gei: 0.30,
    ecs: 0.20,
    volatility: 0.15
  };

  const weightedScore = (
    (cpsi * weights.cpsi) +
    (gei * weights.gei) +
    (ecs * weights.ecs) +
    (volatilityIndex * weights.volatility)
  );

  // Convert to probability (0-1)
  return weightedScore / 100;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting risk score calculation');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch CVE data
    console.log('Fetching CVE data...');
    const cveResponse = await supabase.functions.invoke('fetch-cve-data');
    const cveData = cveResponse.data;

    // Fetch energy prices
    console.log('Fetching energy prices...');
    const priceResponse = await supabase.functions.invoke('fetch-energy-prices');
    const energyPrices = priceResponse.data?.energyPrices || [];

    // Fetch threat events
    console.log('Fetching threat events...');
    const { data: threatEvents } = await supabase
      .from('threat_events')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(100);

    // Define regions to calculate scores for
    const regions = ['ERCOT', 'PJM', 'CAISO', 'Ukraine', 'MISO', 'SPP', 'NYISO', 'ISO-NE'];
    
    const riskScores: RiskScore[] = [];

    for (const region of regions) {
      console.log(`Calculating risk scores for ${region}...`);

      // Calculate CPSI
      const cpsiResult = calculateCPSI(cveData, threatEvents || [], region);
      
      // Calculate GEI
      const geiResult = calculateGEI(threatEvents || [], region);
      
      // Get ECS (infrastructure criticality)
      const ecs = REGION_CRITICALITY[region] || 75.0;
      
      // Calculate Volatility Index
      const volatilityResult = calculateVolatilityIndex(energyPrices, region);
      
      // Calculate Impact Probability
      const impactProb = calculateImpactProbability(
        cpsiResult.score,
        geiResult.score,
        ecs,
        volatilityResult.score
      );

      // Determine trend
      let trend = 'stable';
      if (impactProb > 0.8) trend = 'critical';
      else if (impactProb > 0.65) trend = 'increasing';
      else if (impactProb < 0.4) trend = 'decreasing';

      // Combine all factors
      const allFactors = [
        ...cpsiResult.factors,
        ...geiResult.factors,
        ...volatilityResult.factors
      ].slice(0, 5); // Top 5 factors

      riskScores.push({
        region,
        cpsi: parseFloat(cpsiResult.score.toFixed(2)),
        gei: parseFloat(geiResult.score.toFixed(2)),
        ecs: parseFloat(ecs.toFixed(2)),
        volatility_index: parseFloat(volatilityResult.score.toFixed(2)),
        impact_probability: parseFloat(impactProb.toFixed(2)),
        explanation: {
          trend,
          factors: allFactors.length > 0 ? allFactors : ['Normal operating conditions']
        }
      });
    }

    // Update database with calculated scores
    console.log('Updating risk_scores table...');
    
    // Delete old scores
    await supabase.from('risk_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new scores
    const { error: insertError } = await supabase
      .from('risk_scores')
      .insert(riskScores);

    if (insertError) {
      console.error('Error inserting risk scores:', insertError);
      throw insertError;
    }

    console.log(`Successfully calculated and stored risk scores for ${riskScores.length} regions`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Calculated risk scores for ${riskScores.length} regions`,
        riskScores,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error calculating risk scores:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
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
