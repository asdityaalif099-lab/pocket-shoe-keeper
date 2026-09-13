import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";
import { Screen, GlassCard, Button, Field, Input, Select } from "@/components/kit";
import { useApp } from "@/lib/store";
import { CURRENCIES } from "@/lib/currency";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Shoes Store Management" },
      {
        name: "description",
        content: "Set your store name, currency, default minimum stock and app theme.",
      },
      { property: "og:title", content: "Settings — Shoes Store Management" },
      {
        property: "og:description",
        content: "Store name, currency, stock defaults and light or dark theme.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const app = useApp();
  const [storeName, setStoreName] = useState(app.settings.storeName);
  const [currency, setCurrency] = useState(app.settings.currency);
  const [symbol, setSymbol] = useState(app.settings.currencySymbol);
  const [minStock, setMinStock] = useState(String(app.settings.defaultMinimumStock));

  const dark = app.settings.theme === "dark";

  function save() {
    const min = Number(minStock);
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return;
    }
    app.updateSettings({
      storeName: storeName.trim(),
      currency,
      currencySymbol: symbol.trim() || currency,
      defaultMinimumStock: Number.isFinite(min) && min >= 0 ? Math.floor(min) : 3,
    });
    toast.success("Settings saved");
  }

  return (
    <Screen title="Settings" eyebrow={app.settings.storeName}>
      <GlassCard className="space-y-3 p-3">
        <Field label="Store name">
          <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Currency">
            <Select
              value={currency}
              onChange={(e) => {
                const code = e.target.value;
                setCurrency(code);
                const found = CURRENCIES.find((c) => c.code === code);
                if (found) setSymbol(found.symbol);
              }}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Symbol">
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </Field>
        </div>
        <Field label="Default minimum stock" hint="Used when adding a new product.">
          <Input
            value={minStock}
            inputMode="numeric"
            onChange={(e) => setMinStock(e.target.value)}
          />
        </Field>
        <p className="font-mono text-[11px] text-muted-foreground">
          Preview: {app.money(1250000)}
        </p>
        <Button className="w-full" onClick={save}>
          Save settings
        </Button>
      </GlassCard>

      <GlassCard className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="font-display text-[14px] font-bold text-ink">Appearance</p>
          <p className="text-[11px] text-muted-foreground">
            {dark ? "Dark mode is on" : "Light mode is on"}
          </p>
        </div>
        <Button
          variant="glass"
          size="sm"
          onClick={() => app.updateSettings({ theme: dark ? "light" : "dark" })}
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {dark ? "Light" : "Dark"}
        </Button>
      </GlassCard>

      <p className="pt-2 text-center font-mono text-[10px] text-muted-foreground">
        Shoes Store Management · offline · v1.0
      </p>
    </Screen>
  );
}
