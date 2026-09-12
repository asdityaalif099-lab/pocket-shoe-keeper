import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Screen,
  GlassCard,
  Button,
  Chip,
  Badge,
  SearchInput,
  Field,
  Input,
  Select,
  Sheet,
  EmptyState,
} from "@/components/kit";
import { useApp } from "@/lib/store";
import { ADJUST_REASONS } from "@/lib/types";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Shoes Store Management" },
      {
        name: "description",
        content: "Track stock per size and color, add incoming stock and adjust quantities.",
      },
      { property: "og:title", content: "Inventory — Shoes Store Management" },
      {
        property: "og:description",
        content: "Per-variant shoe stock control with low-stock alerts, fully offline.",
      },
    ],
  }),
  component: InventoryPage,
});

type Filter = "all" | "low" | "out";

function InventoryPage() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ productId: string } | null>(null);
  const [form, setForm] = useState({ size: "", color: "", qty: "", reason: "Correction", mode: "in" as "in" | "adjust" });

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return app.products.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const status = app.productStatus(p);
      const matchF =
        filter === "all" || (filter === "low" && status === "low") || (filter === "out" && status === "out");
      return matchQ && matchF;
    });
  }, [app, query, filter]);

  const sheetProduct = sheet ? app.getProduct(sheet.productId) : undefined;

  function openSheet(productId: string, mode: "in" | "adjust", size?: string, color?: string) {
    const p = app.getProduct(productId);
    setForm({
      size: size ?? p?.sizes[0] ?? "",
      color: color ?? p?.colors[0] ?? "",
      qty: "",
      reason: "Correction",
      mode,
    });
    setSheet({ productId });
  }

  function submit() {
    if (!sheetProduct) return;
    const qty = Number(form.qty);
    if (!qty || Number.isNaN(qty)) return toast.error("Enter a quantity");
    if (form.mode === "in") {
      app.stockIn(sheetProduct.id, form.size, form.color, Math.abs(qty));
      toast.success(`Added ${Math.abs(qty)} to ${sheetProduct.name}`);
    } else {
      app.adjustStock(sheetProduct.id, form.size, form.color, qty);
      toast.success(`Stock adjusted (${form.reason})`);
    }
    setSheet(null);
  }

  return (
    <Screen title="Inventory" eyebrow="Stock">
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search product"
      />
      <div className="flex gap-2">
        {(["all", "low", "out"] as Filter[]).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "low" ? "Low stock" : "Out of stock"}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Nothing here" message="No products match this filter." />
      ) : (
        list.map((p) => {
          const status = app.productStatus(p);
          const isOpen = expanded === p.id;
          return (
            <GlassCard key={p.id} className="rise p-3">
              <button
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-left"
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                <div className="min-w-0">
                  <h3 className="truncate font-display text-[15px] font-bold text-ink">{p.name}</h3>
                  <p className="font-mono text-[10px] uppercase text-muted-foreground">
                    {p.sku} · min {p.minimumStock}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={status === "out" ? "danger" : status === "low" ? "amber" : "good"}>
                    {app.productStock(p.id)} pcs
                  </Badge>
                </div>
              </button>

              {isOpen ? (
                <div className="mt-3 space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="font-mono text-[10px] uppercase text-muted-foreground">
                          <th className="py-1 text-left">Size</th>
                          <th className="py-1 text-left">Color</th>
                          <th className="py-1 text-right">Qty</th>
                          <th className="py-1 text-right">Edit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {p.sizes.flatMap((size) =>
                          p.colors.map((color) => {
                            const qty = app.getQty(p.id, size, color);
                            return (
                              <tr key={`${size}-${color}`}>
                                <td className="py-1.5 text-ink">{size}</td>
                                <td className="py-1.5 text-ink">{color}</td>
                                <td
                                  className={
                                    "py-1.5 text-right tabular-nums " +
                                    (qty === 0 ? "text-danger" : "text-ink")
                                  }
                                >
                                  {qty}
                                </td>
                                <td className="py-1.5">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      aria-label="Decrease"
                                      className="glass rounded-lg p-1"
                                      onClick={() => app.adjustStock(p.id, size, color, -1)}
                                    >
                                      <Minus className="size-3.5" />
                                    </button>
                                    <button
                                      aria-label="Increase"
                                      className="glass rounded-lg p-1"
                                      onClick={() => app.adjustStock(p.id, size, color, 1)}
                                    >
                                      <Plus className="size-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }),
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" onClick={() => openSheet(p.id, "in")}>
                      Stock in
                    </Button>
                    <Button size="sm" variant="glass" onClick={() => openSheet(p.id, "adjust")}>
                      Adjust
                    </Button>
                  </div>
                </div>
              ) : null}
            </GlassCard>
          );
        })
      )}

      <Sheet
        open={!!sheet}
        onClose={() => setSheet(null)}
        title={form.mode === "in" ? "Stock In" : "Adjust Stock"}
      >
        {sheetProduct ? (
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-ink">{sheetProduct.name}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Size">
                <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
                  {sheetProduct.sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Color">
                <Select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
                  {sheetProduct.colors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              label="Quantity"
              hint={form.mode === "adjust" ? "Use a negative number to reduce stock" : undefined}
            >
              <Input
                inputMode="numeric"
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                placeholder={form.mode === "adjust" ? "-2" : "10"}
              />
            </Field>
            {form.mode === "adjust" ? (
              <Field label="Reason">
                <Select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
                  {ADJUST_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <p className="text-[11px] text-muted-foreground">
              Current quantity: {app.getQty(sheetProduct.id, form.size, form.color)}
            </p>
            <Button className="w-full" onClick={submit}>
              Save
            </Button>
          </div>
        ) : null}
      </Sheet>
    </Screen>
  );
}
