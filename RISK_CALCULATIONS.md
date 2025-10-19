# Risk Score Calculation Methodology

This document explains how the proprietary risk indices are calculated using real-time data from multiple sources.

## Data Sources

### 1. CVE/Vulnerability Data
- **Source**: Exploit-DB (GitLab repository)
- **Endpoint**: `https://gitlab.com/exploit-database/exploitdb/-/raw/main/files_exploits.csv`
- **Filtered for**: ICS/OT/Energy sector keywords (SCADA, industrial control systems, power grid, etc.)
- **Update Frequency**: Real-time via edge function

### 2. Energy Price Data
- **Source**: EIA (Energy Information Administration) Open Data API
- **Markets Monitored**: 
  - WTI Crude Oil (Cushing)
  - Brent Crude Oil (North Sea)
  - ERCOT, CAISO, PJM electricity markets
  - Natural Gas (Henry Hub, TTF Netherlands)
  - LNG (Singapore, Tokyo)
- **Update Frequency**: Daily official data, simulated real-time volatility

### 3. Threat Events
- **Source**: Internal database populated from threat intelligence feeds
- **Types**: Cyber threats and geopolitical events
- **Fields**: Severity, affected regions, affected assets, confidence scores

## Risk Index Calculations

### 1. CPSI (Cyber-Physical Systems Index)
**Range**: 0-100

**Components**:
- **CVE Severity Impact (0-40 points)**
  - Critical CVEs: 4 points each
  - High CVEs: 2 points each
  - Capped at 40 points

- **Regional Threat Events (0-35 points)**
  - Critical cyber threats: 7 points each
  - High cyber threats: 3 points each
  - Only counts threats affecting the specific region

- **Active Malware Families (0-25 points)**
  - 8 points per active malware family (seen within 30 days)
  - Focuses on ICS-targeting malware (Industroyer2, PIPEDREAM, BlackEnergy)

**Formula**:
```
CPSI = min(100, CVE_Score + Threat_Score + Malware_Score)
```

### 2. GEI (Geopolitical Event Index)
**Range**: 0-100

**Components**:
- **Regional Geopolitical Events (0-60 points)**
  - Critical geopolitical events: 15 points each
  - High geopolitical events: 8 points each
  - Only counts events affecting the specific region

- **Conflict Zone Proximity (0-40 points)**
  - Active conflict zone: 40 points
  - Spillover risk area: 20 points
  - Safe regions: 0 points

**Conflict Zones Monitored**:
- Ukraine
- Middle East
- Persian Gulf

**Formula**:
```
GEI = min(100, Geopolitical_Events_Score + Proximity_Score)
```

### 3. ECS (Energy Criticality Score)
**Range**: 0-100

**Method**: Static infrastructure criticality assessment based on:
- Grid interconnectivity
- Generation capacity
- Strategic importance
- Population served
- Economic impact

**Regional Scores**:
- Ukraine: 92.1 (active conflict + ENTSO-E hub)
- ERCOT: 88.3 (isolated large grid)
- PJM: 85.6 (largest interconnected grid)
- NYISO: 84.2 (critical Northeast hub)
- CAISO: 82.1 (West Coast hub)
- ISO-NE: 81.5 (New England reliability)
- MISO: 79.4 (Midwest interconnect)
- SPP: 76.8 (Southwest Power Pool)

### 4. Volatility Index
**Range**: 0-100

**Components**:
- **Price Change Volatility (0-50 points)**
  - Based on absolute percentage change
  - Formula: `min(50, |price_change| × 5)`

- **Historical Volatility (0-30 points)**
  - Coefficient of variation from historical prices
  - Formula: `min(30, (stdDev/mean) × 100 × 3)`

- **Market Stress Indicator (0-20 points)**
  - High threat level: 20 points
  - Medium threat level: 10 points
  - Low threat level: 0 points

**Formula**:
```
Volatility = min(100, Price_Volatility + Historical_Volatility + Market_Stress)
```

### 5. Impact Probability
**Range**: 0.00-1.00 (0-100%)

**Method**: Weighted combination of all indices

**Weights**:
- CPSI: 35% (cyber threat impact)
- GEI: 30% (geopolitical risk)
- ECS: 20% (infrastructure criticality)
- Volatility Index: 15% (market stability)

**Formula**:
```
Impact_Probability = (
  CPSI × 0.35 + 
  GEI × 0.30 + 
  ECS × 0.20 + 
  Volatility × 0.15
) / 100
```

## Trend Classification

Based on Impact Probability:
- **Critical**: > 0.80 (80%)
- **Increasing**: 0.65-0.80 (65-80%)
- **Stable**: 0.40-0.65 (40-65%)
- **Decreasing**: < 0.40 (40%)

## Update Schedule

1. **Automatic Calculation**:
   - Triggered on page load
   - Re-calculated every 5 minutes
   - Real-time data integration

2. **Manual Refresh**:
   - Available via "Refresh Scores" button
   - Forces immediate recalculation
   - Updates all indices simultaneously

3. **Data Refresh**:
   - CVE data: On-demand from Exploit-DB
   - Energy prices: Every fetch from EIA + simulated updates
   - Threat events: Database query (real-time)

## Edge Function Architecture

**Function**: `calculate-risk-scores`

**Process**:
1. Fetch CVE data via `fetch-cve-data` function
2. Fetch energy prices via `fetch-energy-prices` function
3. Query threat events from database
4. Calculate all indices for each monitored region
5. Delete old risk scores
6. Insert new calculated scores
7. Return results with timestamp

**Execution Time**: ~2-5 seconds (depending on API response times)

**Error Handling**: Graceful fallback if external APIs fail

## Key Contributing Factors

The system tracks the top 5 contributing factors for each region, which may include:
- Number of critical/high CVEs detected
- Active cyber threats in the region
- Active malware families targeting the sector
- Geopolitical events affecting the region
- Conflict zone status
- Price volatility indicators
- Market stress levels

These factors are displayed in the UI to provide transparency into the risk calculations.
