import type { AppData, InventoryItem, Product } from "./types";
import { uid } from "./storage";

const now = () => new Date().toISOString();

function makeProduct(p: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
  return { ...p, id: uid(), createdAt: now(), updatedAt: now() };
}

export function buildSampleData(base: AppData): AppData {
  const products: Product[] = [
    makeProduct({
      name: "Aero Runner X",
      sku: "ARX-001",
      brand: "Aero",
      category: "Running",
      sellingPrice: 449000,
      purchasePrice: 300000,
      colors: ["Black", "White", "Red"],
      sizes: ["40", "41", "42"],
      minimumStock: base.settings.defaultMinimumStock,
      notes: "Best seller for daily runs",
    }),
    makeProduct({
      name: "Velour Court",
      sku: "VLC-002",
      brand: "Velour",
      category: "Sneakers",
      sellingPrice: 465000,
      purchasePrice: 310000,
      colors: ["White", "Navy"],
      sizes: ["39", "40", "41"],
      minimumStock: base.settings.defaultMinimumStock,
    }),
    makeProduct({
      name: "Formal Oxford LX",
      sku: "FOX-003",
      brand: "Ledger",
      category: "Formal",
      sellingPrice: 720000,
      purchasePrice: 480000,
      colors: ["Brown", "Black"],
      sizes: ["41", "42"],
      minimumStock: base.settings.defaultMinimumStock,
    }),
    makeProduct({
      name: "Terra Casual",
      sku: "TRC-004",
      brand: "Terra",
      category: "Casual",
      sellingPrice: 359000,
      purchasePrice: 220000,
      colors: ["Tan", "Grey"],
      sizes: ["42", "43"],
      minimumStock: base.settings.defaultMinimumStock,
    }),
  ];

  const quantities: Record<string, number[]> = {
    "ARX-001": [4, 3, 0, 2, 1, 0, 5, 2, 1],
    "VLC-002": [5, 2, 6, 3, 2, 1],
    "FOX-003": [6, 5, 7, 4],
    "TRC-004": [0, 0, 2, 1],
  };

  const inventory: InventoryItem[] = [];
  for (const product of products) {
    const list = quantities[product.sku] ?? [];
    let i = 0;
    for (const size of product.sizes) {
      for (const color of product.colors) {
        inventory.push({
          id: uid(),
          productId: product.id,
          size,
          color,
          quantity: list[i] ?? 0,
          updatedAt: now(),
        });
        i++;
      }
    }
  }

  return { ...base, products, inventory, sales: [], customers: [], expenses: [] };
}
