-- Create table for threat intelligence events
CREATE TABLE public.threat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('cyber', 'geopolitical', 'infrastructure')),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_regions TEXT[] NOT NULL,
  affected_assets TEXT[] NOT NULL,
  source TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for proprietary risk scores
CREATE TABLE public.risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  cpsi DECIMAL(5,2) NOT NULL, -- Cyber Price Shock Index (0-100)
  gei DECIMAL(5,2) NOT NULL,  -- Geopolitical Escalation Index (0-100)
  ecs DECIMAL(5,2) NOT NULL,  -- Energy Criticality Score (0-100)
  volatility_index DECIMAL(5,2) NOT NULL, -- Event-Driven Volatility Index (0-100)
  impact_probability DECIMAL(3,2) NOT NULL, -- 0-1
  explanation JSONB,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for threat-to-asset linkages
CREATE TABLE public.threat_asset_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threat_event_id UUID REFERENCES public.threat_events(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('pipeline', 'refinery', 'substation', 'transmission', 'port', 'storage')),
  region TEXT NOT NULL,
  impact_score DECIMAL(5,2) NOT NULL, -- 0-100
  spillover_regions TEXT[],
  price_impact_24h DECIMAL(5,2), -- percentage change
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_threat_events_detected_at ON public.threat_events(detected_at DESC);
CREATE INDEX idx_threat_events_regions ON public.threat_events USING GIN(affected_regions);
CREATE INDEX idx_risk_scores_region ON public.risk_scores(region, calculated_at DESC);
CREATE INDEX idx_threat_asset_links_threat_id ON public.threat_asset_links(threat_event_id);
CREATE INDEX idx_threat_asset_links_region ON public.threat_asset_links(region);

-- Enable RLS
ALTER TABLE public.threat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_asset_links ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for this dashboard)
CREATE POLICY "Allow public read access to threat_events"
  ON public.threat_events FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to risk_scores"
  ON public.risk_scores FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to threat_asset_links"
  ON public.threat_asset_links FOR SELECT
  USING (true);

-- Insert sample threat events
INSERT INTO public.threat_events (event_type, title, description, severity, affected_regions, affected_assets, source, confidence_score)
VALUES
  ('cyber', 'Suspected OT malware targeting Ukrainian substations', 'New malware variant detected targeting supervisory control systems in power grid infrastructure', 'critical', ARRAY['Ukraine', 'Poland', 'Romania'], ARRAY['Grid Infrastructure', 'SCADA Systems'], 'CISA Alert AA24-123', 0.85),
  ('geopolitical', 'Naval tensions spike in Strait of Hormuz', 'Increased military presence and reconnaissance activity reported near key maritime chokepoint', 'high', ARRAY['Middle East', 'Persian Gulf'], ARRAY['Oil Tankers', 'LNG Terminals'], 'Maritime Security Report', 0.78),
  ('cyber', 'Ransomware attacks on energy suppliers increase 40%', 'Coordinated campaign targeting midstream oil and gas operators across multiple regions', 'high', ARRAY['US', 'Canada', 'Western Europe'], ARRAY['Pipeline Controls', 'Distribution Networks'], 'Energy-ISAC', 0.82);

-- Insert sample risk scores
INSERT INTO public.risk_scores (region, cpsi, gei, ecs, volatility_index, impact_probability, explanation)
VALUES
  ('ERCOT', 72.5, 45.2, 88.3, 68.7, 0.73, '{"factors": ["3 cyber events in supplier network", "OT exploit published", "Grid interconnect vulnerability"], "trend": "increasing"}'),
  ('PJM', 68.3, 52.1, 85.6, 65.4, 0.68, '{"factors": ["Regional threat activity elevated", "Infrastructure criticality high"], "trend": "stable"}'),
  ('Ukraine', 89.2, 94.5, 92.1, 91.8, 0.89, '{"factors": ["Active conflict zone", "Critical infrastructure targeting", "Spillover risk to ENTSO-E"], "trend": "critical"}');

-- Insert sample threat-asset linkages
INSERT INTO public.threat_asset_links (threat_event_id, asset_name, asset_type, region, impact_score, spillover_regions, price_impact_24h, confidence_level, reasoning)
SELECT 
  id,
  'Zaporizhzhia Nuclear Power Plant Grid Connection',
  'transmission',
  'Ukraine',
  92.5,
  ARRAY['Poland', 'Slovakia', 'Hungary', 'Romania'],
  6.2,
  'high',
  'Malware targeting substation controls creates risk of cascade failure through ENTSO-E interconnects, potentially affecting Central European power markets'
FROM public.threat_events
WHERE title LIKE '%Ukrainian substations%'
LIMIT 1;