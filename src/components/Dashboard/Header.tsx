import { Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useNavigate } from "react-router-dom";
import { useForecastAccuracy } from "@/hooks/useForecastAccuracy";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { accuracy } = useForecastAccuracy();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-foreground">
                GridGuard
              </h1>
              <p className="text-xs text-muted-foreground">
                Geopolitical & Cyber Threat Dashboard
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-foreground font-medium">{accuracy}% Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-foreground font-medium">3 Active Alerts</span>
              </div>
            </div>
            <CurrencySelector />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
