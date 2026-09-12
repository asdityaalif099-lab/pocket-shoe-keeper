import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Screen,
  GlassCard,
  Chip,
  Stat,
  SearchInput,
  Confirm,
  EmptyState,
  Badge,
} from "@/components/kit";
import { useApp } from "@/lib/store";
import { RANGE_LABELS, formatDateTime, inRange, type RangeKey } from "@/lib/dates";

export const Route = createFileRoute("/sales-history")({
  head: () => ({
    meta: [
      { title: "Sales History — Shoes Store Management" },
      {
        name: "description",
        content: "Browse past shoe sales by day, week or month with full transaction details.",
      },
      { property: "og:title", content: "Sales History — Shoes Store Management" },
      {
        property: "og:description",
        content: "Search transactions, review items sold and delete mistaken sales safely.",
      },
    ],
  }),
  component: HistoryPage,
});

const RANGES: RangeKey[] = ["today", "week", "month", "all"];

function HistoryPage() {
  const app = useApp();
  const [range, setRange] = useState<RangeKey>("today");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return app.sales.filter((s) => {
      if (!inRange(s.createdAt, range)) return false;
      if (!q) return true;
      return (
        s.transactionNumber.toLowerCase().includes(q) ||
        s.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });
  }, [app.sales, range, query]);

  const total = list.reduce((s, x) => s + x.total, 0);
  const profit = list.reduce(
    (sum, s) => sum + s.items.reduce((p, i) => p + (i.unitPrice - i.purchasePrice) * i.quantity, 0),
    0,
  );

  return (
    <Screen title="Sales History" eyebrow="Transactions">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RANGES.map((r) => (
          <Chip key={r} active={range === r} onClick={() => setRange(r)}>
            {RANGE_LABELS[r]}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Sales" value={String(list.length)} />
        <Stat label="Revenue" value={app.money(total)} tone="signal" />
        <Stat label="Profit" value={app.money(profit)} tone="good" />
      </div>
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search transaction or product"
      />

      {list.length === 0 ? (
        <EmptyState title="No transactions" message="No sales found for this period." />
      ) : (
        list.map((s) => {
          const isOpen = open === s.id;
          const customer = app.getCustomer(s.customerId);
          return (
            <GlassCard key={s.id} className="rise p-3">
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 text-left"
              >
                <div className="min-w-0">
                  <div className="font-mono text-[11px] text-signal">{s.transactionNumber}</div>
                  <div className="truncate text-[12px] text-muted-foreground">
                    {formatDateTime(s.createdAt)} · {s.items.length} items
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-[14px] font-bold tabular-nums text-ink">
                    {app.money(s.total)}
                  </div>
                  <Badge tone="muted">{s.paymentMethod}</Badge>
                </div>
              </button>
              {isOpen ? (
                <div className="mt-3 space-y-2 border-t border-border pt-2">
                  {customer ? (
                    <p className="text-[12px] text-ink">Customer: {customer.name}</p>
                  ) : null}
                  <ul className="space-y-1">
                    {s.items.map((i, idx) => (
                      <li key={idx} className="flex justify-between gap-2 text-[12px]">
                        <span className="min-w-0 truncate text-ink">
                          {i.productName} · {i.size}/{i.color} × {i.quantity}
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                          {app.money(i.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {s.notes ? (
                    <p className="text-[11px] text-muted-foreground">Note: {s.notes}</p>
                  ) : null}
                  <button
                    onClick={() => setToDelete(s.id)}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-danger"
                  >
                    <Trash2 className="size-3.5" /> Delete & restore stock
                  </button>
                </div>
              ) : null}
            </GlassCard>
          );
        })
      )}

      <Confirm
        open={!!toDelete}
        title="Delete transaction?"
        message="The sold items will be returned to your stock."
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) app.deleteSale(toDelete);
          setToDelete(null);
          toast.success("Transaction deleted, stock restored");
        }}
      />
    </Screen>
  );
}
