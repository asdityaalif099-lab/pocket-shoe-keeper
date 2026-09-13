import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Screen, GlassCard, Stat, Chip, Field, Input } from "@/components/kit";
import { useApp } from "@/lib/store";
import { inRange, RANGE_LABELS, type RangeKey } from "@/lib/dates";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Shoes Store Management" },
      {
        name: "description",
        content: "Revenue, profit, expenses and best selling shoes for any date range.",
      },
      { property: "og:title", content: "Reports — Shoes Store Management" },
      {
        property: "og:description",
        content: "See revenue, profit, expenses and best sellers for your shoe store.",
      },
    ],
  }),
  component: ReportsPage,
});

const RANGES: RangeKey[] = ["today", "week", "month", "all", "custom"];

function ReportsPage() {
  const app = useApp();
  const [range, setRange] = useState<RangeKey>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const custom = { from, to };

  const sales = useMemo(
    () => app.sales.filter((s) => inRange(s.createdAt, range, custom)),
    [app.sales, range, from, to],
  );
  const expenses = useMemo(
    () => app.expenses.filter((e) => inRange(e.date, range, custom)),
    [app.expenses, range, from, to],
  );

  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const cogs = sales.reduce(
    (s, x) => s + x.items.reduce((t, i) => t + i.purchasePrice * i.quantity, 0),
    0,
  );
  const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - expenseTotal;
  const unitsSold = sales.reduce(
    (s, x) => s + x.items.reduce((t, i) => t + i.quantity, 0),
    0,
  );

  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const sale of sales) {
      for (const item of sale.items) {
        const cur = map.get(item.productId) ?? {
          name: item.productName,
          qty: 0,
          revenue: 0,
        };
        cur.qty += item.quantity;
        cur.revenue += item.subtotal;
        map.set(item.productId, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [sales]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of sales) map.set(s.paymentMethod, (map.get(s.paymentMethod) ?? 0) + s.total);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [sales]);

  return (
    <Screen title="Reports" eyebrow={app.settings.storeName}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RANGES.map((r) => (
          <Chip key={r} active={range === r} onClick={() => setRange(r)}>
            {RANGE_LABELS[r]}
          </Chip>
        ))}
      </div>

      {range === "custom" ? (
        <GlassCard className="grid grid-cols-2 gap-3 p-3">
          <Field label="From">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </GlassCard>
      ) : null}

      <Stat label="Revenue" value={app.money(revenue)} hint={`${sales.length} transactions`} large />
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Gross profit" value={app.money(grossProfit)} tone="good" />
        <Stat label="Expenses" value={app.money(expenseTotal)} tone="amber" />
        <Stat
          label="Net profit"
          value={app.money(netProfit)}
          tone={netProfit >= 0 ? "good" : "danger"}
        />
        <Stat label="Units sold" value={String(unitsSold)} />
      </div>

      <GlassCard className="p-3">
        <h2 className="font-display text-[14px] font-bold text-ink">Best sellers</h2>
        {bestSellers.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">No sales in this period.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {bestSellers.map((b) => (
              <li key={b.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink">
                    {b.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {b.qty} pcs
                  </span>
                </span>
                <span className="font-mono text-[12px] tabular-nums text-ink">
                  {app.money(b.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard className="p-3">
        <h2 className="font-display text-[14px] font-bold text-ink">By payment method</h2>
        {byPayment.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">No sales in this period.</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {byPayment.map(([method, total]) => (
              <li key={method} className="flex items-center justify-between gap-2">
                <span className="text-[13px] text-ink">{method}</span>
                <span className="font-mono text-[12px] tabular-nums text-ink">
                  {app.money(total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </Screen>
  );
}
