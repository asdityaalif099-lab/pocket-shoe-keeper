import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EMPTY_DATA, loadData, saveData, uid } from "./storage";
import { formatMoney } from "./currency";
import { buildSampleData } from "./sample-data";
import type {
  AppData,
  Customer,
  Expense,
  InventoryItem,
  Product,
  Sale,
  SaleItem,
  Settings,
} from "./types";

type Ctx = {
  data: AppData;
  ready: boolean;
  money: (n: number) => string;
  update: (fn: (d: AppData) => AppData) => void;
  replaceAll: (d: AppData) => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveData(data);
  }, [data, ready]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", data.settings.theme === "dark");
  }, [data.settings.theme]);

  const update = useCallback((fn: (d: AppData) => AppData) => setData((prev) => fn(prev)), []);
  const replaceAll = useCallback((d: AppData) => setData(d), []);

  const money = useCallback((n: number) => formatMoney(n, data.settings), [data.settings]);

  const value = useMemo(
    () => ({ data, ready, money, update, replaceAll }),
    [data, ready, money, update, replaceAll],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function useCtx() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

const stamp = () => new Date().toISOString();

export function useApp() {
  const { data, ready, money, update, replaceAll } = useCtx();

  const api = useMemo(() => {
    const getQty = (productId: string, size: string, color: string) =>
      data.inventory.find(
        (i) => i.productId === productId && i.size === size && i.color === color,
      )?.quantity ?? 0;

    const productStock = (productId: string) =>
      data.inventory
        .filter((i) => i.productId === productId)
        .reduce((sum, i) => sum + i.quantity, 0);

    const productStatus = (product: Product): "out" | "low" | "ok" => {
      const total = productStock(product.id);
      if (total === 0) return "out";
      if (total <= product.minimumStock) return "low";
      return "ok";
    };

    const syncVariants = (d: AppData, product: Product): InventoryItem[] => {
      const existing = d.inventory.filter((i) => i.productId === product.id);
      const kept = existing.filter(
        (i) => product.sizes.includes(i.size) && product.colors.includes(i.color),
      );
      const additions: InventoryItem[] = [];
      for (const size of product.sizes) {
        for (const color of product.colors) {
          if (!kept.some((i) => i.size === size && i.color === color)) {
            additions.push({
              id: uid(),
              productId: product.id,
              size,
              color,
              quantity: 0,
              updatedAt: stamp(),
            });
          }
        }
      }
      return [...d.inventory.filter((i) => i.productId !== product.id), ...kept, ...additions];
    };

    const setQty = (
      d: AppData,
      productId: string,
      size: string,
      color: string,
      change: number,
    ): InventoryItem[] => {
      const idx = d.inventory.findIndex(
        (i) => i.productId === productId && i.size === size && i.color === color,
      );
      if (idx === -1) {
        return [
          ...d.inventory,
          {
            id: uid(),
            productId,
            size,
            color,
            quantity: Math.max(0, change),
            updatedAt: stamp(),
          },
        ];
      }
      const next = [...d.inventory];
      const current = next[idx] as InventoryItem;
      next[idx] = {
        ...current,
        quantity: Math.max(0, current.quantity + change),
        updatedAt: stamp(),
      };
      return next;
    };

    return {
      data,
      ready,
      money,
      settings: data.settings,
      products: data.products,
      inventory: data.inventory,
      sales: data.sales,
      customers: data.customers,
      expenses: data.expenses,

      getQty,
      productStock,
      productStatus,
      getProduct: (id: string) => data.products.find((p) => p.id === id),
      getCustomer: (id?: string) =>
        id ? data.customers.find((c) => c.id === id) : undefined,

      saveProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }) {
        update((d) => {
          if (input.id) {
            const updated: Product = {
              ...(d.products.find((p) => p.id === input.id) as Product),
              ...input,
              id: input.id,
              updatedAt: stamp(),
            };
            const withProduct = {
              ...d,
              products: d.products.map((p) => (p.id === input.id ? updated : p)),
            };
            return { ...withProduct, inventory: syncVariants(withProduct, updated) };
          }
          const created: Product = {
            ...input,
            id: uid(),
            createdAt: stamp(),
            updatedAt: stamp(),
          };
          const withProduct = { ...d, products: [created, ...d.products] };
          return { ...withProduct, inventory: syncVariants(withProduct, created) };
        });
      },

      deleteProduct(id: string) {
        update((d) => ({
          ...d,
          products: d.products.filter((p) => p.id !== id),
          inventory: d.inventory.filter((i) => i.productId !== id),
        }));
      },

      stockIn(productId: string, size: string, color: string, qty: number) {
        update((d) => ({ ...d, inventory: setQty(d, productId, size, color, qty) }));
      },

      adjustStock(productId: string, size: string, color: string, change: number) {
        update((d) => ({ ...d, inventory: setQty(d, productId, size, color, change) }));
      },

      recordSale(sale: {
        items: SaleItem[];
        paymentMethod: Sale["paymentMethod"];
        customerId?: string;
        notes?: string;
      }) {
        const total = sale.items.reduce((s, i) => s + i.subtotal, 0);
        update((d) => {
          let inventory = d.inventory;
          for (const item of sale.items) {
            inventory = setQty(
              { ...d, inventory },
              item.productId,
              item.size,
              item.color,
              -item.quantity,
            );
          }
          const seq = String(d.sales.length + 1).padStart(5, "0");
          const record: Sale = {
            id: uid(),
            transactionNumber: `TXN-${seq}`,
            items: sale.items,
            total,
            paymentMethod: sale.paymentMethod,
            customerId: sale.customerId,
            notes: sale.notes,
            createdAt: stamp(),
          };
          return { ...d, inventory, sales: [record, ...d.sales] };
        });
      },

      deleteSale(id: string) {
        update((d) => {
          const sale = d.sales.find((s) => s.id === id);
          if (!sale) return d;
          let inventory = d.inventory;
          for (const item of sale.items) {
            inventory = setQty(
              { ...d, inventory },
              item.productId,
              item.size,
              item.color,
              item.quantity,
            );
          }
          return { ...d, inventory, sales: d.sales.filter((s) => s.id !== id) };
        });
      },

      saveCustomer(input: Omit<Customer, "id" | "createdAt"> & { id?: string }) {
        update((d) =>
          input.id
            ? {
                ...d,
                customers: d.customers.map((c) =>
                  c.id === input.id ? { ...c, ...input, id: input.id } : c,
                ),
              }
            : {
                ...d,
                customers: [
                  { ...input, id: uid(), createdAt: stamp() },
                  ...d.customers,
                ],
              },
        );
      },

      deleteCustomer(id: string) {
        update((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== id) }));
      },

      saveExpense(input: Omit<Expense, "id"> & { id?: string }) {
        update((d) =>
          input.id
            ? {
                ...d,
                expenses: d.expenses.map((e) =>
                  e.id === input.id ? { ...e, ...input, id: input.id } : e,
                ),
              }
            : { ...d, expenses: [{ ...input, id: uid() }, ...d.expenses] },
        );
      },

      deleteExpense(id: string) {
        update((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
      },

      updateSettings(patch: Partial<Settings>) {
        update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
      },

      loadSampleData() {
        update((d) => buildSampleData(d));
      },

      clearAll() {
        update((d) => ({ ...EMPTY_DATA, settings: d.settings }));
      },

      importData(incoming: Partial<AppData>) {
        replaceAll({
          products: incoming.products ?? [],
          inventory: incoming.inventory ?? [],
          sales: incoming.sales ?? [],
          customers: incoming.customers ?? [],
          expenses: incoming.expenses ?? [],
          settings: { ...data.settings, ...(incoming.settings ?? {}) },
        });
      },
    };
  }, [data, ready, money, update, replaceAll]);

  return api;
}
