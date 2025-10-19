import { useParams, useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/Dashboard/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Shield, AlertTriangle } from "lucide-react";
import { ForecastChart } from "@/components/MarketDetail/ForecastChart";
import { RiskTape } from "@/components/MarketDetail/RiskTape";
import { EvidencePanel } from "@/components/MarketDetail/EvidencePanel";
import { ThreatAssetGraph } from "@/components/MarketDetail/ThreatAssetGraph";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const marketData = {
  pjm: {
    name: "PJM Interconnection",
    type: "Electricity",
    unit: "$/MWh",
    currentPrice: 46.80,
    change: 2.4,
    cyberRisk: 72,
    geoRisk: 45,
    forecast48h: 49.25,
    region: "US Northeast",
    priceHistory: [
      { time: "Mon", price: 44.2, volume: 1250, volatility: 12 },
      { time: "Tue", price: 45.1, volume: 1320, volatility: 15 },
      { time: "Wed", price: 44.8, volume: 1280, volatility: 13 },
      { time: "Thu", price: 46.3, volume: 1390, volatility: 18 },
      { time: "Fri", price: 46.8, volume: 1410, volatility: 16 },
    ],
    riskFactors: [
      { factor: "Ransomware targeting utility vendors", impact: "High", timestamp: "2h ago" },
      { factor: "Grid infrastructure modernization", impact: "Medium", timestamp: "1d ago" },
      { factor: "Increased renewable integration", impact: "Low", timestamp: "3d ago" },
    ],
    correlationData: [
      { hour: "00", price: 42, cyber: 65, geo: 40 },
      { hour: "04", price: 43, cyber: 68, geo: 42 },
      { hour: "08", price: 45, cyber: 70, geo: 43 },
      { hour: "12", price: 46, cyber: 72, geo: 44 },
      { hour: "16", price: 47, cyber: 73, geo: 45 },
      { hour: "20", price: 46.5, cyber: 71, geo: 45 },
      { hour: "Now", price: 46.8, cyber: 72, geo: 45 },
    ],
  },
  ercot: {
    name: "ERCOT (Texas)",
    type: "Electricity",
    unit: "$/MWh",
    currentPrice: 52.30,
    change: 4.2,
    cyberRisk: 78,
    geoRisk: 52,
    forecast48h: 57.85,
    region: "Texas",
    priceHistory: [
      { time: "Mon", price: 48.5, volume: 1450, volatility: 20 },
      { time: "Tue", price: 50.1, volume: 1520, volatility: 22 },
      { time: "Wed", price: 49.8, volume: 1480, volatility: 21 },
      { time: "Thu", price: 51.3, volume: 1590, volatility: 25 },
      { time: "Fri", price: 52.3, volume: 1610, volatility: 24 },
    ],
    riskFactors: [
      { factor: "Grid infrastructure vulnerabilities detected", impact: "Critical", timestamp: "1h ago" },
      { factor: "ICS systems under active reconnaissance", impact: "High", timestamp: "3h ago" },
      { factor: "Extreme weather forecast impact", impact: "Medium", timestamp: "12h ago" },
    ],
    correlationData: [
      { hour: "00", price: 48, cyber: 70, geo: 45 },
      { hour: "04", price: 49, cyber: 73, geo: 47 },
      { hour: "08", price: 50, cyber: 75, geo: 49 },
      { hour: "12", price: 51, cyber: 77, geo: 51 },
      { hour: "16", price: 52, cyber: 78, geo: 52 },
      { hour: "20", price: 52.5, cyber: 79, geo: 52 },
      { hour: "Now", price: 52.3, cyber: 78, geo: 52 },
    ],
  },
  caiso: {
    name: "CAISO (California)",
    type: "Electricity",
    unit: "$/MWh",
    currentPrice: 58.90,
    change: 1.8,
    cyberRisk: 65,
    geoRisk: 58,
    forecast48h: 61.20,
    region: "California",
    priceHistory: [
      { time: "Mon", price: 56.8, volume: 1350, volatility: 16 },
      { time: "Tue", price: 57.5, volume: 1390, volatility: 17 },
      { time: "Wed", price: 57.9, volume: 1370, volatility: 18 },
      { time: "Thu", price: 58.4, volume: 1420, volatility: 19 },
      { time: "Fri", price: 58.9, volume: 1440, volatility: 18 },
    ],
    riskFactors: [
      { factor: "Geopolitical tensions affecting supply chains", impact: "Medium", timestamp: "6h ago" },
      { factor: "Renewable integration challenges", impact: "Medium", timestamp: "1d ago" },
      { factor: "Grid modernization in progress", impact: "Low", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 56, cyber: 60, geo: 52 },
      { hour: "04", price: 57, cyber: 62, geo: 54 },
      { hour: "08", price: 57.5, cyber: 63, geo: 55 },
      { hour: "12", price: 58, cyber: 64, geo: 57 },
      { hour: "16", price: 58.5, cyber: 65, geo: 58 },
      { hour: "20", price: 59, cyber: 66, geo: 58 },
      { hour: "Now", price: 58.9, cyber: 65, geo: 58 },
    ],
  },
  brent: {
    name: "Brent Crude Oil",
    type: "Oil",
    unit: "$/bbl",
    currentPrice: 87.10,
    change: 3.2,
    cyberRisk: 58,
    geoRisk: 68,
    forecast48h: 95.20,
    region: "Global",
    priceHistory: [
      { time: "Mon", price: 82.5, volume: 2450, volatility: 22 },
      { time: "Tue", price: 84.2, volume: 2520, volatility: 25 },
      { time: "Wed", price: 85.8, volume: 2480, volatility: 23 },
      { time: "Thu", price: 86.4, volume: 2590, volatility: 28 },
      { time: "Fri", price: 87.1, volume: 2610, volatility: 26 },
    ],
    riskFactors: [
      { factor: "Iran-Israel proxy escalation ongoing", impact: "Critical", timestamp: "15m ago" },
      { factor: "Maritime port OT systems targeted", impact: "High", timestamp: "1h ago" },
      { factor: "OPEC+ production adjustments", impact: "Medium", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 83, cyber: 52, geo: 60 },
      { hour: "04", price: 84, cyber: 54, geo: 62 },
      { hour: "08", price: 85, cyber: 55, geo: 64 },
      { hour: "12", price: 86, cyber: 56, geo: 66 },
      { hour: "16", price: 87, cyber: 58, geo: 67 },
      { hour: "20", price: 87.5, cyber: 59, geo: 68 },
      { hour: "Now", price: 87.1, cyber: 58, geo: 68 },
    ],
  },
  north_sea: {
    name: "North Sea Brent",
    type: "Oil",
    unit: "$/bbl",
    currentPrice: 87.10,
    change: 3.2,
    cyberRisk: 62,
    geoRisk: 72,
    forecast48h: 92.50,
    region: "North Sea",
    priceHistory: [
      { time: "Mon", price: 82.8, volume: 2350, volatility: 24 },
      { time: "Tue", price: 84.5, volume: 2420, volatility: 26 },
      { time: "Wed", price: 86.0, volume: 2380, volatility: 25 },
      { time: "Thu", price: 86.7, volume: 2490, volatility: 29 },
      { time: "Fri", price: 87.1, volume: 2510, volatility: 27 },
    ],
    riskFactors: [
      { factor: "Maritime infrastructure reconnaissance detected", impact: "High", timestamp: "30m ago" },
      { factor: "North Sea production disruptions", impact: "Medium", timestamp: "4h ago" },
      { factor: "European energy security concerns", impact: "Medium", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 83, cyber: 56, geo: 65 },
      { hour: "04", price: 84, cyber: 58, geo: 67 },
      { hour: "08", price: 85, cyber: 60, geo: 69 },
      { hour: "12", price: 86, cyber: 61, geo: 71 },
      { hour: "16", price: 87, cyber: 62, geo: 72 },
      { hour: "20", price: 87.3, cyber: 63, geo: 72 },
      { hour: "Now", price: 87.1, cyber: 62, geo: 72 },
    ],
  },
  persian_gulf: {
    name: "Persian Gulf",
    type: "Oil & Gas",
    unit: "$/bbl",
    currentPrice: 89.50,
    change: 5.1,
    cyberRisk: 70,
    geoRisk: 85,
    forecast48h: 98.30,
    region: "Middle East",
    priceHistory: [
      { time: "Mon", price: 83.2, volume: 2650, volatility: 30 },
      { time: "Tue", price: 85.8, volume: 2720, volatility: 32 },
      { time: "Wed", price: 87.4, volume: 2680, volatility: 34 },
      { time: "Thu", price: 88.9, volume: 2790, volatility: 36 },
      { time: "Fri", price: 89.5, volume: 2810, volatility: 35 },
    ],
    riskFactors: [
      { factor: "Iran-Israel proxy escalation intensifying", impact: "Critical", timestamp: "10m ago" },
      { factor: "Strait of Hormuz security threats", impact: "Critical", timestamp: "45m ago" },
      { factor: "Regional cyber warfare campaigns", impact: "High", timestamp: "2h ago" },
    ],
    correlationData: [
      { hour: "00", price: 84, cyber: 62, geo: 78 },
      { hour: "04", price: 85, cyber: 64, geo: 80 },
      { hour: "08", price: 86, cyber: 66, geo: 81 },
      { hour: "12", price: 88, cyber: 68, geo: 83 },
      { hour: "16", price: 89, cyber: 70, geo: 84 },
      { hour: "20", price: 89.8, cyber: 71, geo: 85 },
      { hour: "Now", price: 89.5, cyber: 70, geo: 85 },
    ],
  },
  natgas: {
    name: "Natural Gas",
    type: "Gas",
    unit: "$/MMBtu",
    currentPrice: 3.45,
    change: -1.8,
    cyberRisk: 48,
    geoRisk: 52,
    forecast48h: 3.39,
    region: "Henry Hub",
    priceHistory: [
      { time: "Mon", price: 3.52, volume: 980, volatility: 18 },
      { time: "Tue", price: 3.48, volume: 1020, volatility: 16 },
      { time: "Wed", price: 3.51, volume: 990, volatility: 19 },
      { time: "Thu", price: 3.47, volume: 1050, volatility: 15 },
      { time: "Fri", price: 3.45, volume: 1030, volatility: 14 },
    ],
    riskFactors: [
      { factor: "Storage levels above seasonal average", impact: "Low", timestamp: "4h ago" },
      { factor: "LNG export facility maintenance", impact: "Medium", timestamp: "12h ago" },
      { factor: "Pipeline monitoring systems secure", impact: "Low", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 3.50, cyber: 45, geo: 48 },
      { hour: "04", price: 3.49, cyber: 46, geo: 49 },
      { hour: "08", price: 3.48, cyber: 46, geo: 50 },
      { hour: "12", price: 3.47, cyber: 47, geo: 51 },
      { hour: "16", price: 3.46, cyber: 48, geo: 52 },
      { hour: "20", price: 3.45, cyber: 48, geo: 52 },
      { hour: "Now", price: 3.45, cyber: 48, geo: 52 },
    ],
  },
  henry_hub: {
    name: "Henry Hub (Louisiana)",
    type: "Natural Gas",
    unit: "$/MMBtu",
    currentPrice: 3.45,
    change: -1.8,
    cyberRisk: 45,
    geoRisk: 48,
    forecast48h: 3.38,
    region: "US Gulf Coast",
    priceHistory: [
      { time: "Mon", price: 3.53, volume: 1050, volatility: 17 },
      { time: "Tue", price: 3.49, volume: 1080, volatility: 16 },
      { time: "Wed", price: 3.52, volume: 1020, volatility: 18 },
      { time: "Thu", price: 3.48, volume: 1100, volatility: 15 },
      { time: "Fri", price: 3.45, volume: 1070, volatility: 14 },
    ],
    riskFactors: [
      { factor: "Minimal threat activity detected", impact: "Low", timestamp: "8h ago" },
      { factor: "Export terminal operations normal", impact: "Low", timestamp: "1d ago" },
      { factor: "Pipeline infrastructure stable", impact: "Low", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 3.51, cyber: 42, geo: 44 },
      { hour: "04", price: 3.50, cyber: 43, geo: 45 },
      { hour: "08", price: 3.49, cyber: 44, geo: 46 },
      { hour: "12", price: 3.48, cyber: 44, geo: 47 },
      { hour: "16", price: 3.47, cyber: 45, geo: 48 },
      { hour: "20", price: 3.46, cyber: 45, geo: 48 },
      { hour: "Now", price: 3.45, cyber: 45, geo: 48 },
    ],
  },
  singapore: {
    name: "Singapore Hub",
    type: "LNG & Electricity",
    unit: "$/MMBtu",
    currentPrice: 4.20,
    change: 2.8,
    cyberRisk: 68,
    geoRisk: 62,
    forecast48h: 4.48,
    region: "Southeast Asia",
    priceHistory: [
      { time: "Mon", price: 4.05, volume: 890, volatility: 20 },
      { time: "Tue", price: 4.12, volume: 920, volatility: 21 },
      { time: "Wed", price: 4.08, volume: 900, volatility: 19 },
      { time: "Thu", price: 4.18, volume: 950, volatility: 23 },
      { time: "Fri", price: 4.20, volume: 960, volatility: 22 },
    ],
    riskFactors: [
      { factor: "Regional LNG supply chain vulnerabilities", impact: "High", timestamp: "2h ago" },
      { factor: "Shipping route security concerns", impact: "Medium", timestamp: "6h ago" },
      { factor: "Grid infrastructure monitoring increased", impact: "Medium", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 4.05, cyber: 62, geo: 56 },
      { hour: "04", price: 4.08, cyber: 64, geo: 58 },
      { hour: "08", price: 4.12, cyber: 65, geo: 59 },
      { hour: "12", price: 4.16, cyber: 67, geo: 61 },
      { hour: "16", price: 4.19, cyber: 68, geo: 62 },
      { hour: "20", price: 4.21, cyber: 69, geo: 62 },
      { hour: "Now", price: 4.20, cyber: 68, geo: 62 },
    ],
  },
  japan: {
    name: "Tokyo (JEPX)",
    type: "Electricity",
    unit: "¥/MWh",
    currentPrice: 8500,
    change: 3.5,
    cyberRisk: 70,
    geoRisk: 55,
    forecast48h: 9150,
    region: "Japan",
    priceHistory: [
      { time: "Mon", price: 8100, volume: 1150, volatility: 18 },
      { time: "Tue", price: 8250, volume: 1180, volatility: 20 },
      { time: "Wed", price: 8200, volume: 1160, volatility: 19 },
      { time: "Thu", price: 8400, volume: 1220, volatility: 22 },
      { time: "Fri", price: 8500, volume: 1240, volatility: 21 },
    ],
    riskFactors: [
      { factor: "SCADA system vulnerability disclosures", impact: "High", timestamp: "3h ago" },
      { factor: "Nuclear facility security monitoring", impact: "Medium", timestamp: "8h ago" },
      { factor: "Energy import dependency risks", impact: "Medium", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 8150, cyber: 64, geo: 50 },
      { hour: "04", price: 8250, cyber: 66, geo: 51 },
      { hour: "08", price: 8350, cyber: 68, geo: 53 },
      { hour: "12", price: 8450, cyber: 69, geo: 54 },
      { hour: "16", price: 8500, cyber: 70, geo: 55 },
      { hour: "20", price: 8520, cyber: 71, geo: 55 },
      { hour: "Now", price: 8500, cyber: 70, geo: 55 },
    ],
  },
  china: {
    name: "Shanghai Energy Exchange",
    type: "Oil & Gas",
    unit: "¥/bbl",
    currentPrice: 520,
    change: 1.5,
    cyberRisk: 52,
    geoRisk: 58,
    forecast48h: 530,
    region: "China",
    priceHistory: [
      { time: "Mon", price: 508, volume: 2200, volatility: 14 },
      { time: "Tue", price: 512, volume: 2250, volatility: 15 },
      { time: "Wed", price: 515, volume: 2220, volatility: 16 },
      { time: "Thu", price: 518, volume: 2280, volatility: 17 },
      { time: "Fri", price: 520, volume: 2300, volatility: 16 },
    ],
    riskFactors: [
      { factor: "Minor supply chain monitoring activity", impact: "Low", timestamp: "5h ago" },
      { factor: "Regional energy security measures", impact: "Medium", timestamp: "12h ago" },
      { factor: "Infrastructure development ongoing", impact: "Low", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 510, cyber: 48, geo: 52 },
      { hour: "04", price: 512, cyber: 49, geo: 54 },
      { hour: "08", price: 515, cyber: 50, geo: 55 },
      { hour: "12", price: 517, cyber: 51, geo: 57 },
      { hour: "16", price: 519, cyber: 52, geo: 58 },
      { hour: "20", price: 521, cyber: 53, geo: 58 },
      { hour: "Now", price: 520, cyber: 52, geo: 58 },
    ],
  },
  india: {
    name: "India Energy Exchange",
    type: "Electricity",
    unit: "₹/kWh",
    currentPrice: 4.50,
    change: 4.8,
    cyberRisk: 82,
    geoRisk: 68,
    forecast48h: 4.95,
    region: "India",
    priceHistory: [
      { time: "Mon", price: 4.18, volume: 1450, volatility: 26 },
      { time: "Tue", price: 4.28, volume: 1520, volatility: 28 },
      { time: "Wed", price: 4.35, volume: 1480, volatility: 27 },
      { time: "Thu", price: 4.42, volume: 1590, volatility: 30 },
      { time: "Fri", price: 4.50, volume: 1610, volatility: 29 },
    ],
    riskFactors: [
      { factor: "Critical infrastructure targeting detected", impact: "Critical", timestamp: "1h ago" },
      { factor: "Grid strain from demand surge", impact: "High", timestamp: "4h ago" },
      { factor: "Cross-border security concerns", impact: "High", timestamp: "8h ago" },
    ],
    correlationData: [
      { hour: "00", price: 4.20, cyber: 75, geo: 62 },
      { hour: "04", price: 4.28, cyber: 77, geo: 64 },
      { hour: "08", price: 4.35, cyber: 79, geo: 65 },
      { hour: "12", price: 4.42, cyber: 80, geo: 67 },
      { hour: "16", price: 4.48, cyber: 82, geo: 68 },
      { hour: "20", price: 4.52, cyber: 83, geo: 68 },
      { hour: "Now", price: 4.50, cyber: 82, geo: 68 },
    ],
  },
  australia: {
    name: "Australian NEM",
    type: "Electricity",
    unit: "A$/MWh",
    currentPrice: 95,
    change: 2.1,
    cyberRisk: 64,
    geoRisk: 48,
    forecast48h: 99,
    region: "Australia",
    priceHistory: [
      { time: "Mon", price: 91, volume: 1250, volatility: 16 },
      { time: "Tue", price: 92, volume: 1280, volatility: 17 },
      { time: "Wed", price: 93, volume: 1260, volatility: 18 },
      { time: "Thu", price: 94, volume: 1320, volatility: 19 },
      { time: "Fri", price: 95, volume: 1340, volatility: 18 },
    ],
    riskFactors: [
      { factor: "OT targeting in mining sector increased", impact: "Medium", timestamp: "3h ago" },
      { factor: "Energy export infrastructure monitoring", impact: "Medium", timestamp: "10h ago" },
      { factor: "Grid modernization in progress", impact: "Low", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 91, cyber: 58, geo: 42 },
      { hour: "04", price: 92, cyber: 60, geo: 44 },
      { hour: "08", price: 93, cyber: 62, geo: 46 },
      { hour: "12", price: 94, cyber: 63, geo: 47 },
      { hour: "16", price: 95, cyber: 64, geo: 48 },
      { hour: "20", price: 95.5, cyber: 65, geo: 48 },
      { hour: "Now", price: 95, cyber: 64, geo: 48 },
    ],
  },
  newzealand: {
    name: "New Zealand Grid",
    type: "Electricity",
    unit: "NZ$/MWh",
    currentPrice: 120,
    change: -0.5,
    cyberRisk: 42,
    geoRisk: 35,
    forecast48h: 118,
    region: "New Zealand",
    priceHistory: [
      { time: "Mon", price: 121, volume: 850, volatility: 10 },
      { time: "Tue", price: 120.5, volume: 870, volatility: 11 },
      { time: "Wed", price: 121.2, volume: 860, volatility: 12 },
      { time: "Thu", price: 120.8, volume: 890, volatility: 11 },
      { time: "Fri", price: 120, volume: 880, volatility: 10 },
    ],
    riskFactors: [
      { factor: "Minimal threat activity detected", impact: "Low", timestamp: "12h ago" },
      { factor: "Renewable energy integration stable", impact: "Low", timestamp: "1d ago" },
      { factor: "Grid infrastructure secure", impact: "Low", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 121, cyber: 38, geo: 32 },
      { hour: "04", price: 120.8, cyber: 39, geo: 33 },
      { hour: "08", price: 120.5, cyber: 40, geo: 34 },
      { hour: "12", price: 120.3, cyber: 41, geo: 34 },
      { hour: "16", price: 120.1, cyber: 42, geo: 35 },
      { hour: "20", price: 120, cyber: 42, geo: 35 },
      { hour: "Now", price: 120, cyber: 42, geo: 35 },
    ],
  },
  wind: {
    name: "Wind Energy",
    type: "Renewable",
    unit: "$/MWh",
    currentPrice: 28.50,
    change: 1.2,
    cyberRisk: 55,
    geoRisk: 38,
    forecast48h: 29.10,
    region: "Global",
    priceHistory: [
      { time: "Mon", price: 27.8, volume: 780, volatility: 14 },
      { time: "Tue", price: 28.0, volume: 800, volatility: 15 },
      { time: "Wed", price: 28.2, volume: 790, volatility: 14 },
      { time: "Thu", price: 28.4, volume: 820, volatility: 16 },
      { time: "Fri", price: 28.5, volume: 830, volatility: 15 },
    ],
    riskFactors: [
      { factor: "Wind farm SCADA systems monitoring", impact: "Medium", timestamp: "4h ago" },
      { factor: "Grid integration challenges", impact: "Low", timestamp: "12h ago" },
      { factor: "Weather forecast favorable", impact: "Low", timestamp: "1d ago" },
    ],
    correlationData: [
      { hour: "00", price: 27.9, cyber: 50, geo: 34 },
      { hour: "04", price: 28.0, cyber: 52, geo: 35 },
      { hour: "08", price: 28.2, cyber: 53, geo: 36 },
      { hour: "12", price: 28.3, cyber: 54, geo: 37 },
      { hour: "16", price: 28.4, cyber: 55, geo: 38 },
      { hour: "20", price: 28.5, cyber: 56, geo: 38 },
      { hour: "Now", price: 28.5, cyber: 55, geo: 38 },
    ],
  },
  solar: {
    name: "Solar Energy",
    type: "Renewable",
    unit: "$/MWh",
    currentPrice: 32.90,
    change: 0.8,
    cyberRisk: 52,
    geoRisk: 35,
    forecast48h: 33.45,
    region: "Global",
    priceHistory: [
      { time: "Mon", price: 32.3, volume: 720, volatility: 12 },
      { time: "Tue", price: 32.5, volume: 740, volatility: 13 },
      { time: "Wed", price: 32.6, volume: 730, volatility: 12 },
      { time: "Thu", price: 32.8, volume: 760, volatility: 14 },
      { time: "Fri", price: 32.9, volume: 770, volatility: 13 },
    ],
    riskFactors: [
      { factor: "Solar farm infrastructure secure", impact: "Low", timestamp: "6h ago" },
      { factor: "Panel efficiency optimization ongoing", impact: "Low", timestamp: "1d ago" },
      { factor: "Grid storage integration stable", impact: "Low", timestamp: "2d ago" },
    ],
    correlationData: [
      { hour: "00", price: 32.4, cyber: 48, geo: 32 },
      { hour: "04", price: 32.5, cyber: 49, geo: 33 },
      { hour: "08", price: 32.6, cyber: 50, geo: 33 },
      { hour: "12", price: 32.7, cyber: 51, geo: 34 },
      { hour: "16", price: 32.8, cyber: 52, geo: 35 },
      { hour: "20", price: 32.9, cyber: 53, geo: 35 },
      { hour: "Now", price: 32.9, cyber: 52, geo: 35 },
    ],
  },
};

const MarketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const market = marketData[id as keyof typeof marketData];

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Market Not Found</h1>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Market Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {market.name}
              </h1>
              <p className="text-muted-foreground">
                {market.type} • {market.region}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-foreground mb-1">
                ${market.currentPrice}
              </div>
              <div className="flex items-center gap-2 justify-end">
                {market.change > 0 ? (
                  <TrendingUp className="h-5 w-5 text-destructive" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-success" />
                )}
                <span
                  className={cn(
                    "text-xl font-semibold",
                    market.change > 0 ? "text-destructive" : "text-success"
                  )}
                >
                  {market.change > 0 ? "+" : ""}
                  {market.change}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                per {market.unit.split("/")[1]}
              </p>
            </div>
          </div>

          {/* Risk Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-cyber flex items-center justify-center shadow-glow-cyber">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cyber Risk</p>
                  <p className="text-2xl font-bold text-cyber">{market.cyberRisk}/100</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-geo flex items-center justify-center shadow-glow-geo">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Geopolitical Risk</p>
                  <p className="text-2xl font-bold text-geopolitical">{market.geoRisk}/100</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-gradient-card border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">48h Forecast</p>
                  <p className="text-2xl font-bold text-primary">${market.forecast48h}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Forecasts */}
          <div className="lg:col-span-2 space-y-6">
            <ForecastChart />
            
            {/* Price History */}
            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                5-Day Price History
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={market.priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Right Column - Risk Tape */}
          <div>
            <RiskTape />
          </div>
        </div>

        {/* Evidence & Threat Intelligence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <EvidencePanel />
          <ThreatAssetGraph />
        </div>

        {/* Risk Factors */}
        <Card className="p-6 bg-gradient-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Active Risk Factors
          </h3>
          <div className="space-y-3">
            {market.riskFactors.map((factor, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-secondary/50 border border-border flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                        factor.impact === "Critical" && "bg-destructive/20 text-destructive",
                        factor.impact === "High" && "bg-warning/20 text-warning",
                        factor.impact === "Medium" && "bg-primary/20 text-primary",
                        factor.impact === "Low" && "bg-success/20 text-success"
                      )}
                    >
                      {factor.impact}
                    </span>
                  </div>
                  <p className="text-foreground">{factor.factor}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {factor.timestamp}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default MarketDetail;
