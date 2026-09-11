import type { Settings } from "./types";

export const CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: "IDR", symbol: "Rp", label: "Indonesian Rupiah" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "MYR", symbol: "RM", label: "Malaysian Ringgit" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
];

const ZERO_DECIMAL = ["IDR", "JPY"];

export function formatMoney(amount: number, settings: Settings) {
  const decimals = ZERO_DECIMAL.includes(settings.currency) ? 0 : 2;
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${settings.currencySymbol} ${formatted}`;
}
