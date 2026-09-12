import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, History } from "lucide-react";
import { toast } from "sonner";
import {
  Screen,
  GlassCard,
  Button,
  Field,
  Input,
  Select,
  Textarea,
  SearchInput,
  EmptyState,
} from "@/components/kit";
import { useApp } from "@/lib/store";
import { PAYMENT_METHODS, type PaymentMethod, type SaleItem } from "@/lib/types";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "New Sale — Shoes Store Management" },
      {
        name: "description",
        content: "Create a shoe sale, pick size and color, and stock updates automatically.",
      },
      { property: "og:title", content: "New Sale — Shoes Store Management" },
      {
        property: "og:description",
        content: "Fast offline checkout for your shoe store with automatic stock deduction.",
      },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const app = useApp();
  const navigate = useNavigate();
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [query, setQuery] = useState("");
  const [picker, setPicker] = useState<{ productId: string; size: string; color: string; qty: string } | null>(
    null,
  );
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [customerId, setCustomerId] = useState("");
  const [notes, setNotes] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return app.products.slice(0, 5);
    return app.products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 8);
  }, [app.products, query]);

  const total = cart.reduce((s, i) => s + i.subtotal, 0);
  const pickerProduct = picker ? app.getProduct(picker.productId) : undefined;

  function choose(productId: string) {
    const p = app.getProduct(productId);
    if (!p) return;
    setPicker({ productId, size: p.sizes[0] ?? "", color: p.colors[0] ?? "", qty: "1" });
  }

  function addToCart() {
    if (!pickerProduct || !picker) return;
    const qty = Number(picker.qty) || 0;
    if (qty <= 0) return toast.error("Quantity must be at least 1");
    const available = app.getQty(pickerProduct.id, picker.size, picker.color);
    const already = cart
      .filter((i) => i.productId === pickerProduct.id && i.size === picker.size && i.color === picker.color)
      .reduce((s, i) => s + i.quantity, 0);
    if (qty + already > available) {
      return toast.error(`Only ${available - already} left for ${picker.size} / ${picker.color}`);
    }
    setCart((c) => [
      ...c,
      {
        productId: pickerProduct.id,
        productName: pickerProduct.name,
        size: picker.size,
        color: picker.color,
        quantity: qty,
        unitPrice: pickerProduct.sellingPrice,
        purchasePrice: pickerProduct.purchasePrice,
        subtotal: pickerProduct.sellingPrice * qty,
      },
    ]);
    setPicker(null);
    setQuery("");
  }

  function checkout() {
    if (!cart.length) return toast.error("Add at least one item");
    app.recordSale({
      items: cart,
      paymentMethod: payment,
      customerId: customerId || undefined,
      notes: notes.trim() || undefined,
    });
    setCart([]);
    setNotes("");
    setCustomerId("");
    toast.success("Sale recorded");
    navigate({ to: "/sales-history" });
  }

  return (
    <Screen
      title="New Sale"
      eyebrow="Checkout"
      action={
        <Link to="/sales-history">
          <Button size="sm" variant="glass">
            <History className="size-4" /> History
          </Button>
        </Link>
      }
    >
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search product to add"
      />

      {app.products.length === 0 ? (
        <EmptyState title="No products yet" message="Add products before recording a sale." />
      ) : (
        <GlassCard className="p-2">
          <ul className="divide-y divide-border">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => choose(p.id)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-1 py-2 text-left"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">{p.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {p.sku} · {app.productStock(p.id)} in stock
                    </div>
                  </div>
                  <div className="shrink-0 text-[12px] font-bold tabular-nums text-signal">
                    {app.money(p.sellingPrice)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {picker && pickerProduct ? (
        <GlassCard className="space-y-3 p-3">
          <p className="text-[13px] font-bold text-ink">{pickerProduct.name}</p>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Size">
              <Select
                value={picker.size}
                onChange={(e) => setPicker({ ...picker, size: e.target.value })}
              >
                {pickerProduct.sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Color">
              <Select
                value={picker.color}
                onChange={(e) => setPicker({ ...picker, color: e.target.value })}
              >
                {pickerProduct.colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Qty">
              <Input
                inputMode="numeric"
                value={picker.qty}
                onChange={(e) => setPicker({ ...picker, qty: e.target.value })}
              />
            </Field>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Available: {app.getQty(pickerProduct.id, picker.size, picker.color)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="glass" onClick={() => setPicker(null)}>
              Cancel
            </Button>
            <Button onClick={addToCart}>Add to cart</Button>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard className="p-3">
        <h2 className="font-display text-sm font-bold text-ink">Cart</h2>
        {cart.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">No items yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {cart.map((i, idx) => (
              <li key={idx} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2">
                <div className="min-w-0">
                  <div className="truncate text-[13px] text-ink">{i.productName}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {i.size} / {i.color} × {i.quantity}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[13px] font-bold tabular-nums text-ink">
                    {app.money(i.subtotal)}
                  </span>
                  <button
                    aria-label="Remove"
                    onClick={() => setCart((c) => c.filter((_, x) => x !== idx))}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span className="font-display text-xl font-extrabold tabular-nums text-signal">
            {app.money(total)}
          </span>
        </div>
      </GlassCard>

      <GlassCard className="space-y-3 p-3">
        <Field label="Payment Method">
          <Select value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Customer (optional)">
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in customer</option>
            {app.customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <Button className="w-full" onClick={checkout}>
          Complete sale · {app.money(total)}
        </Button>
      </GlassCard>
    </Screen>
  );
}
