import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  Textarea,
  Select,
  Sheet,
  Confirm,
  EmptyState,
} from "@/components/kit";
import { useApp } from "@/lib/store";
import { CATEGORIES, type Category, type Product } from "@/lib/types";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products — Shoes Store Management" },
      {
        name: "description",
        content: "Manage shoe products, prices, sizes, colors and minimum stock levels.",
      },
      { property: "og:title", content: "Products — Shoes Store Management" },
      {
        property: "og:description",
        content: "Add and edit shoe products with sizes, colors, prices and stock alerts.",
      },
    ],
  }),
  component: ProductsPage,
});

type FormState = {
  id?: string;
  name: string;
  sku: string;
  brand: string;
  category: Category;
  sellingPrice: string;
  purchasePrice: string;
  colors: string;
  sizes: string;
  minimumStock: string;
  notes: string;
};

function emptyForm(min: number): FormState {
  return {
    name: "",
    sku: "",
    brand: "",
    category: "Sneakers",
    sellingPrice: "",
    purchasePrice: "",
    colors: "",
    sizes: "",
    minimumStock: String(min),
    notes: "",
  };
}

function ProductsPage() {
  const app = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(app.settings.defaultMinimumStock));
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return app.products.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      const matchC = category === "All" || p.category === category;
      return matchQ && matchC;
    });
  }, [app.products, query, category]);

  function startCreate() {
    setForm(emptyForm(app.settings.defaultMinimumStock));
    setOpen(true);
  }

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      sku: p.sku,
      brand: p.brand,
      category: p.category,
      sellingPrice: String(p.sellingPrice),
      purchasePrice: String(p.purchasePrice),
      colors: p.colors.join(", "),
      sizes: p.sizes.join(", "),
      minimumStock: String(p.minimumStock),
      notes: p.notes ?? "",
    });
    setOpen(true);
  }

  function submit() {
    const sizes = form.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const colors = form.colors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!sizes.length) return toast.error("Add at least one size");
    if (!colors.length) return toast.error("Add at least one color");
    const selling = Number(form.sellingPrice) || 0;
    const purchase = Number(form.purchasePrice) || 0;
    if (selling <= 0) return toast.error("Selling price must be greater than zero");

    app.saveProduct({
      id: form.id,
      name: form.name.trim(),
      sku: form.sku.trim() || form.name.trim().slice(0, 6).toUpperCase(),
      brand: form.brand.trim(),
      category: form.category,
      sellingPrice: selling,
      purchasePrice: purchase,
      colors,
      sizes,
      minimumStock: Number(form.minimumStock) || 0,
      notes: form.notes.trim() || undefined,
    });
    setOpen(false);
    toast.success(form.id ? "Product updated" : "Product added");
  }

  return (
    <Screen
      title="Products"
      eyebrow="Catalog"
      action={
        <Button size="sm" onClick={startCreate}>
          <Plus className="size-4" /> New
        </Button>
      }
    >
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, SKU or brand"
      />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Chip active={category === "All"} onClick={() => setCategory("All")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No products"
          message="Add your first shoe product with its sizes, colors and prices."
          action={<Button onClick={startCreate}>Add product</Button>}
        />
      ) : (
        list.map((p) => {
          const status = app.productStatus(p);
          return (
            <GlassCard key={p.id} className="rise p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate font-display text-[15px] font-bold text-ink">
                      {p.name}
                    </h3>
                    <Badge
                      tone={status === "out" ? "danger" : status === "low" ? "amber" : "good"}
                    >
                      {status === "out" ? "Out" : status === "low" ? "Low" : "OK"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                    {p.sku} · {p.brand || "—"} · {p.category}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-ink">
                    {app.money(p.sellingPrice)}{" "}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      cost {app.money(p.purchasePrice)}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {p.sizes.length} sizes · {p.colors.length} colors ·{" "}
                    {app.productStock(p.id)} in stock
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button size="sm" variant="glass" onClick={() => startEdit(p)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="sm" variant="glass" onClick={() => setToDelete(p)}>
                    <Trash2 className="size-3.5 text-danger" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          );
        })
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={form.id ? "Edit Product" : "New Product"}>
        <div className="space-y-3">
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Aero Runner X"
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="SKU">
              <Input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="ARX-001"
              />
            </Field>
            <Field label="Brand">
              <Input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Selling Price">
              <Input
                inputMode="numeric"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
              />
            </Field>
            <Field label="Purchase Price">
              <Input
                inputMode="numeric"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Sizes" hint="Separate with commas, e.g. 39, 40, 41">
            <Input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="39, 40, 41"
            />
          </Field>
          <Field label="Colors" hint="Separate with commas, e.g. Black, White">
            <Input
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              placeholder="Black, White"
            />
          </Field>
          <Field label="Minimum Stock">
            <Input
              inputMode="numeric"
              value={form.minimumStock}
              onChange={(e) => setForm({ ...form, minimumStock: e.target.value })}
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          <Button className="w-full" onClick={submit}>
            {form.id ? "Save changes" : "Add product"}
          </Button>
        </div>
      </Sheet>

      <Confirm
        open={!!toDelete}
        title="Delete product?"
        message={`${toDelete?.name ?? ""} and all of its stock records will be removed.`}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) app.deleteProduct(toDelete.id);
          setToDelete(null);
          toast.success("Product deleted");
        }}
      />
    </Screen>
  );
}
