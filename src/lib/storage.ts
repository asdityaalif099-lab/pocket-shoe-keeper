import type { AppData, Settings } from "./types";

export const STORAGE_KEY = "shoes-store-management:v1";

export const DEFAULT_SETTINGS: Settings = {
  storeName: "My Shoe Store",
  currency: "IDR",
  currencySymbol: "Rp",
  defaultMinimumStock: 3,
  theme: "light",
};

export const EMPTY_DATA: AppData = {
  products: [],
  inventory: [],
  sales: [],
  customers: [],
  expenses: [],
  settings: DEFAULT_SETTINGS,
};

export function loadData(): AppData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DATA;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      products: parsed.products ?? [],
      inventory: parsed.inventory ?? [],
      sales: parsed.sales ?? [],
      customers: parsed.customers ?? [],
      expenses: parsed.expenses ?? [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return EMPTY_DATA;
  }
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable — app keeps working in memory */
  }
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
