import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, useCurrencyStore } from "@/hooks/useCurrencyConversion";
import { DollarSign } from "lucide-react";

export const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency } = useCurrencyStore();

  return (
    <div className="flex items-center gap-2">
      <DollarSign className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedCurrency.code}
        onValueChange={(code) => {
          const currency = CURRENCIES.find((c) => c.code === code);
          if (currency) setSelectedCurrency(currency);
        }}
      >
        <SelectTrigger className="w-[140px] h-9 bg-background/50 border-primary/20">
          <SelectValue>
            {selectedCurrency.symbol} {selectedCurrency.code}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{currency.symbol}</span>
                <span>{currency.code}</span>
                <span className="text-xs text-muted-foreground">- {currency.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
