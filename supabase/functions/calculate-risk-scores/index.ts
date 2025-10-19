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

// Region infrastructure criticality data (based on grid interconnectivity and market dependencies)
const REGION_CRITICALITY: Record<string, number> = {
  // Electricity Markets
  'ERCOT': 88.3, // Large isolated grid
  'PJM': 85.6, // Largest interconnected grid
  'CAISO': 82.1, // Critical West Coast hub
  'Ukraine': 92.1, // Active conflict zone with ENTSO-E connections
  'MISO': 79.4,
  'SPP': 76.8,
  'NYISO': 84.2,
  'ISO-NE': 81.5,
  // Oil & Gas Markets
  'Henry Hub': 83.5, // Major US natural gas hub
  'NBP (UK)': 87.2, // Major European gas hub
  'Tokyo LNG': 89.6, // Critical Asian LNG pricing point
  'Brent Crude': 91.3, // Global oil benchmark
  'WTI Crude': 88.7, // US oil benchmark
  'Dubai Crude': 86.4, // Middle East benchmark
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

// Fetch real-time geopolitical events from GDELT
async function fetchGDELTEvents(region: string): Promise<{ eventCount: number; severity: 'low' | 'medium' | 'high' | 'critical'; topics: string[] }> {
  try {
    // Map regions to countries/areas for GDELT query
    const regionMapping: Record<string, string[]> = {
      'ERCOT': ['United States', 'Texas'],
      'PJM': ['United States', 'Pennsylvania', 'New Jersey'],
      'CAISO': ['United States', 'California'],
      'MISO': ['United States', 'Midwest'],
      'SPP': ['United States', 'Southwest'],
      'NYISO': ['United States', 'New York'],
      'ISO-NE': ['United States', 'New England'],
      'Ukraine': ['Ukraine', 'Russia'],
      'Henry Hub': ['United States', 'Louisiana'],
      'NBP (UK)': ['United Kingdom', 'Europe'],
      'Tokyo LNG': ['Japan', 'Asia'],
      'Brent Crude': ['United Kingdom', 'North Sea', 'Europe'],
      'WTI Crude': ['United States', 'Oklahoma'],
      'Dubai Crude': ['United Arab Emirates', 'Middle East'],
    };

    const countries = regionMapping[region] || ['United States'];
    const query = `energy OR oil OR gas OR pipeline OR power OR grid OR ${countries.join(' OR ')}`;
    
    // GDELT Event Database - last 24 hours
    const timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dateStr = timeAgo.toISOString().split('T')[0].replace(/-/g, '');
    
    // Use GDELT GKG (Global Knowledge Graph) API for conflict/threat monitoring
    const gdeltUrl = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=50&format=json&startdatetime=${dateStr}000000`;
    
    const response = await fetch(gdeltUrl, {
      headers: { 'User-Agent': 'GridGuard-Risk-Monitor/1.0' }
    });

    if (!response.ok) {
      console.warn('GDELT API returned non-OK status:', response.status);
      return { eventCount: 0, severity: 'low', topics: [] };
    }

    const data = await response.json();
    const articles = data.articles || [];

    // Analyze article themes and tones
    let conflictScore = 0;
    const topics = new Set<string>();

    articles.forEach((article: any) => {
      const title = (article.title || '').toLowerCase();
      const url = (article.url || '').toLowerCase();
      
      // High-risk keywords
      if (title.match(/attack|war|conflict|sanction|crisis|strike|explosion|sabotage/)) {
        conflictScore += 15;
        topics.add('Armed conflict or sabotage');
      }
      if (title.match(/tension|dispute|threat|warning|escalat/)) {
        conflictScore += 8;
        topics.add('Rising tensions');
      }
      if (title.match(/embargo|blockade|restrict|ban/)) {
        conflictScore += 12;
        topics.add('Trade restrictions');
      }
      if (title.match(/cyber|hack|breach/)) {
        conflictScore += 10;
        topics.add('Cyber threats');
      }
      if (title.match(/protest|riot|unrest/)) {
        conflictScore += 6;
        topics.add('Civil unrest');
      }
    });

    // Determine severity based on score
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (conflictScore > 150) severity = 'critical';
    else if (conflictScore > 80) severity = 'high';
    else if (conflictScore > 30) severity = 'medium';

    return {
      eventCount: articles.length,
      severity,
      topics: Array.from(topics).slice(0, 3)
    };
  } catch (error) {
    console.error('Error fetching GDELT data:', error);
    return { eventCount: 0, severity: 'low', topics: [] };
  }
}

// Calculate GEI (Geopolitical Event Index) with real-time data
async function calculateGEI(
  threatEvents: any[],
  region: string
): Promise<{ score: number; factors: string[] }> {
  let score = 0;
  const factors: string[] = [];

  // Fetch real-time geopolitical events from GDELT
  const gdeltData = await fetchGDELTEvents(region);
  
  // Real-time event severity scoring (0-50 points)
  const severityScores = { low: 5, medium: 15, high: 35, critical: 50 };
  const rtScore = severityScores[gdeltData.severity];
  score += rtScore;

  if (gdeltData.eventCount > 0) {
    factors.push(`${gdeltData.eventCount} recent events monitored in region`);
    if (gdeltData.topics.length > 0) {
      factors.push(`Active: ${gdeltData.topics[0]}`);
    }
  }

  // Regional geopolitical events from database (0-30 points)
  const geoThreats = threatEvents.filter(t => 
    t.event_type === 'geopolitical' && 
    t.affected_regions?.includes(region)
  );

  const criticalGeo = geoThreats.filter(t => t.severity === 'critical').length;
  const highGeo = geoThreats.filter(t => t.severity === 'high').length;
  const dbScore = Math.min(30, (criticalGeo * 10) + (highGeo * 5));
  score += dbScore;

  if (geoThreats.length > 0) {
    factors.push(`${geoThreats.length} tracked geopolitical threats`);
  }

  // Conflict zone proximity (0-20 points)
  const conflictRegions = ['Ukraine', 'Middle East', 'Persian Gulf'];
  if (conflictRegions.includes(region)) {
    score += 20;
    factors.push('High-risk conflict zone');
  } else {
    // Check spillover risk
    const spilloverRisk = geoThreats.some(t => 
      t.affected_regions?.some((r: string) => conflictRegions.includes(r))
    );
    if (spilloverRisk) {
      score += 10;
      factors.push('Spillover risk proximity');
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

    // Get all unique regions from energy prices data
    const regions: string[] = energyPrices.length > 0 
      ? Array.from(new Set(energyPrices.map((p: any) => p.region as string)))
      : ['ERCOT', 'PJM', 'CAISO', 'Ukraine', 'MISO', 'SPP', 'NYISO', 'ISO-NE'];
    
    const riskScores: RiskScore[] = [];

    for (const region of regions) {
      console.log(`Calculating risk scores for ${region}...`);

      // Calculate CPSI
      const cpsiResult = calculateCPSI(cveData, threatEvents || [], region);
      
      // Calculate GEI with real-time data
      const geiResult = await calculateGEI(threatEvents || [], region);
      
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
