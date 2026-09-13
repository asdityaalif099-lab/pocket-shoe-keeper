import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Screen,
  GlassCard,
  Stat,
  Button,
  Chip,
  Field,
  Input,
  Select,
  Textarea,
  Sheet,
  Confirm,
  EmptyState,
} from "@/components/kit";
import { useApp } from "@/lib/store";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/lib/types";
import { formatDate, inRange, RANGE_LABELS, todayInput, type RangeKey } from "@/lib/dates";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Shoes Store Management" },
      {
        name: "description",
        content: "Record rent, shipping, packaging and other shoe store operational costs.",
      },
      { property: "og:title", content: "Expenses — Shoes Store Management" },
      {
        property: "og:description",
        content: "Track operational costs for your shoe store, fully offline.",
      },
    ],
  }),
  component: ExpensesPage,
});

const RANGES: RangeKey[] = ["today", "week", "month", "all"];

function ExpensesPage() {
  const app = useApp();
  const [range, setRange] = useState<RangeKey>("month");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Rent");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayInput());
  const [notes, setNotes] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const list = useMemo(
    () =>
      app.expenses
        .filter((e) => inRange(e.date, range))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [app.expenses, range],
  );

  const total = list.reduce((s, e) => s + e.amount, 0);

  function openNew() {
    setEditing(null);
    setName("");
    setCategory("Rent");
    setAmount("");
    setDate(todayInput());
    setNotes("");
    setOpen(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setName(e.name);
    setCategory(e.category);
    setAmount(String(e.amount));
    setDate(e.date.slice(0, 10));
    setNotes(e.notes ?? "");
    setOpen(true);
  }

  function save() {
    const value = Number(amount);
    if (!name.trim()) {
      toast.error("Expense name is required");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter an amount greater than zero");
      return;
    }
    app.saveExpense({
      id: editing?.id,
      name: name.trim(),
      category,
      amount: value,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });
    toast.success(editing ? "Expense updated" : "Expense added");
    setOpen(false);
  }

  return (
    <Screen
      title="Expenses"
      eyebrow={app.settings.storeName}
      action={
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4" /> Add
        </Button>
      }
    >
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {RANGES.map((r) => (
          <Chip key={r} active={range === r} onClick={() => setRange(r)}>
            {RANGE_LABELS[r]}
          </Chip>
        ))}
      </div>

      <Stat
        label={`${RANGE_LABELS[range]} total`}
        value={app.money(total)}
        hint={`${list.length} entries`}
        tone="amber"
        large
      />

      {list.length === 0 ? (
        <EmptyState
          title="No expenses recorded"
          message="Log rent, electricity, shipping and other costs to see real profit."
          action={<Button onClick={openNew}>Add expense</Button>}
        />
      ) : (
        list.map((e) => (
          <GlassCard key={e.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 p-3">
            <div className="min-w-0">
              <p className="truncate font-display text-[14px] font-bold text-ink">{e.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {e.category} · {formatDate(e.date)}
              </p>
              {e.notes ? (
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{e.notes}</p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-mono text-[13px] font-semibold tabular-nums text-amber">
                {app.money(e.amount)}
              </span>
              <div className="flex gap-1">
                <button
                  aria-label="Edit expense"
                  onClick={() => openEdit(e)}
                  className="grid size-8 place-items-center rounded-xl bg-ink/5 text-ink"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  aria-label="Delete expense"
                  onClick={() => setDeleteId(e.id)}
                  className="grid size-8 place-items-center rounded-xl bg-danger/10 text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "Edit expense" : "New expense"}>
        <div className="space-y-3">
          <Field label="Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shop rent September"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Amount">
              <Input
                value={amount}
                inputMode="numeric"
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <Button className="w-full" onClick={save}>
            Save expense
          </Button>
        </div>
      </Sheet>

      <Confirm
        open={deleteId !== null}
        title="Delete expense?"
        message="This entry will be removed from your records."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) app.deleteExpense(deleteId);
          setDeleteId(null);
          toast.success("Expense deleted");
        }}
      />
    </Screen>
  );
}
