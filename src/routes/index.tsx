import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus, Package, Boxes, AlertTriangle } from "lucide-react";
import { Screen, GlassCard, Stat, Button, Badge, EmptyState } from "@/components/kit";
import { useApp } from "@/lib/store";
import { inRange, formatDateTime } from "@/lib/dates";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Shoes Store Management" },
      {
        name: "description",
        content:
          "Today's revenue, profit, stock alerts and recent transactions for your shoe store.",
      },
      { property: "og:title", content: "Dashboard — Shoes Store Management" },
      {
        property: "og:description",
        content: "Track daily sales, profit and low stock for your shoe store, fully offline.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const app = useApp();
  const { sales, products, inventory, money } = app;

  const stats = useMemo(() => {
    const today = sales.filter((s) => inRange(s.createdAt, "today"));
    const revenue = today.reduce((sum, s) => sum + s.total, 0);
    const profit = today.reduce(
      (sum, s) =>
        sum +
        s.items.reduce((p, i) => p + (i.unitPrice - i.purchasePrice) * i.quantity, 0),
      0,
    );
    const totalStock = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const stockValue = inventory.reduce((sum, i) => {
      const p = products.find((x) => x.id === i.productId);
      return sum + (p ? p.purchasePrice * i.quantity : 0);
    }, 0);
    const low = products.filter((p) => app.productStatus(p) !== "ok");
    return { revenue, profit, count: today.length, totalStock, stockValue, low };
  }, [sales, products, inventory, app]);

  const recent = sales.slice(0, 5);

  return (
    <Screen title={app.settings.storeName} eyebrow="Dashboard">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Today Revenue" value={money(stats.revenue)} tone="signal" large />
        <Stat label="Today Profit" value={money(stats.profit)} tone="good" large />
        <Stat label="Transactions" value={String(stats.count)} hint="today" />
        <Stat label="Stock Units" value={String(stats.totalStock)} hint="all variants" />
        <Stat label="Products" value={String(products.length)} />
        <Stat label="Stock Value" value={money(stats.stockValue)} hint="at cost" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link to="/sales">
          <Button className="w-full">
            <Plus className="size-4" /> New Sale
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="glass" className="w-full">
            <Package className="size-4" /> Add Product
          </Button>
        </Link>
      </div>

      <GlassCard className="p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-ink">Stock Alerts</h2>
          <Link to="/inventory" className="text-[11px] font-semibold text-signal">
            Inventory
          </Link>
        </div>
        {stats.low.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">
            All products are above their minimum stock.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {stats.low.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <AlertTriangle className="size-3.5 shrink-0 text-amber" />
                  <span className="truncate text-[13px] text-ink">{p.name}</span>
                </span>
                <Badge tone={app.productStatus(p) === "out" ? "danger" : "amber"}>
                  {app.productStock(p.id)} left
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard className="p-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-ink">Recent Sales</h2>
          <Link to="/sales-history" className="text-[11px] font-semibold text-signal">
            History
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-2 text-[12px] text-muted-foreground">No sales recorded yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <div className="truncate font-mono text-[11px] text-muted-foreground">
                    {s.transactionNumber}
                  </div>
                  <div className="truncate text-[12px] text-ink">
                    {formatDateTime(s.createdAt)}
                  </div>
                </div>
                <div className="shrink-0 font-display text-[13px] font-bold tabular-nums text-ink">
                  {money(s.total)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {products.length === 0 ? (
        <EmptyState
          title="Start your store"
          message="Add your first product, or load sample data from the More tab to explore the app."
          action={
            <Link to="/more">
              <Button variant="glass">
                <Boxes className="size-4" /> Open More
              </Button>
            </Link>
          }
        />
      ) : null}
    </Screen>
  );
}
