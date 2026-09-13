import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Screen,
  GlassCard,
  Button,
  SearchInput,
  Field,
  Input,
  Textarea,
  Sheet,
  Confirm,
  EmptyState,
} from "@/components/kit";
import { useApp } from "@/lib/store";
import type { Customer } from "@/lib/types";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Shoes Store Management" },
      {
        name: "description",
        content: "Keep a simple list of shoe store customers with phone numbers and notes.",
      },
      { property: "og:title", content: "Customers — Shoes Store Management" },
      {
        property: "og:description",
        content: "A simple offline customer list for your shoe store.",
      },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return app.customers;
    return app.customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q),
    );
  }, [app.customers, query]);

  const spendById = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const s of app.sales) {
      if (!s.customerId) continue;
      const cur = map.get(s.customerId) ?? { total: 0, count: 0 };
      cur.total += s.total;
      cur.count += 1;
      map.set(s.customerId, cur);
    }
    return map;
  }, [app.sales]);

  function openNew() {
    setEditing(null);
    setName("");
    setPhone("");
    setNotes("");
    setOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setName(c.name);
    setPhone(c.phone ?? "");
    setNotes(c.notes ?? "");
    setOpen(true);
  }

  function save() {
    if (!name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    app.saveCustomer({
      id: editing?.id,
      name: name.trim(),
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    toast.success(editing ? "Customer updated" : "Customer added");
    setOpen(false);
  }

  return (
    <Screen
      title="Customers"
      eyebrow={`${app.customers.length} saved`}
      action={
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4" /> Add
        </Button>
      }
    >
      <SearchInput
        placeholder="Search name or phone"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {list.length === 0 ? (
        <EmptyState
          title="No customers yet"
          message="Add regular buyers so you can attach them to sales."
          action={<Button onClick={openNew}>Add customer</Button>}
        />
      ) : (
        list.map((c) => {
          const spend = spendById.get(c.id);
          return (
            <GlassCard key={c.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[14px] font-bold text-ink">{c.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {c.phone || "No phone"}
                </p>
                {c.notes ? (
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{c.notes}</p>
                ) : null}
                <p className="mt-1 font-mono text-[10px] text-signal">
                  {spend ? `${spend.count} sales · ${app.money(spend.total)}` : "No purchases yet"}
                </p>
              </div>
              <div className="flex items-start gap-1">
                <button
                  aria-label="Edit customer"
                  onClick={() => openEdit(c)}
                  className="grid size-8 place-items-center rounded-xl bg-ink/5 text-ink"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  aria-label="Delete customer"
                  onClick={() => setDeleteId(c.id)}
                  className="grid size-8 place-items-center rounded-xl bg-danger/10 text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </GlassCard>
          );
        })
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "Edit customer" : "New customer"}>
        <div className="space-y-3">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          </Field>
          <Field label="Phone">
            <Input
              value={phone}
              inputMode="tel"
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
            />
          </Field>
          <Field label="Notes">
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <Button className="w-full" onClick={save}>
            Save customer
          </Button>
        </div>
      </Sheet>

      <Confirm
        open={deleteId !== null}
        title="Delete customer?"
        message="Past sales keep their record, but the customer will be removed from the list."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) app.deleteCustomer(deleteId);
          setDeleteId(null);
          toast.success("Customer deleted");
        }}
      />
    </Screen>
  );
}
