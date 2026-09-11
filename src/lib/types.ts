export const CATEGORIES = [
  "Sneakers",
  "Running",
  "Casual",
  "Formal",
  "Sandals",
  "Boots",
  "Sports",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PAYMENT_METHODS = ["Cash", "Bank Transfer", "E-Wallet", "Other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ADJUST_REASONS = ["Damaged", "Lost", "Correction", "Return", "Other"] as const;

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Electricity",
  "Shipping",
  "Packaging",
  "Employee",
  "Marketing",
  "Other",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Product = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: Category;
  sellingPrice: number;
  purchasePrice: number;
  colors: string[];
  sizes: string[];
  minimumStock: number;
  image?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryItem = {
  id: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  updatedAt: string;
};

export type SaleItem = {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  transactionNumber: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  customerId?: string;
  notes?: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
};

export type Settings = {
  storeName: string;
  currency: string;
  currencySymbol: string;
  defaultMinimumStock: number;
  theme: "light" | "dark";
};

export type AppData = {
  products: Product[];
  inventory: InventoryItem[];
  sales: Sale[];
  customers: Customer[];
  expenses: Expense[];
  settings: Settings;
};
