import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Screen, GlassCard, Button, Confirm } from "@/components/kit";
import { useApp } from "@/lib/store";
import type { AppData } from "@/lib/types";

export const Route = createFileRoute("/backup")({
  head: () => ({
    meta: [
      { title: "Backup & Restore — Shoes Store Management" },
      {
        name: "description",
        content: "Export your shoe store data to a file or restore it from a previous backup.",
      },
      { property: "og:title", content: "Backup & Restore — Shoes Store Management" },
      {
        property: "og:description",
        content: "Export and import your offline shoe store data safely.",
      },
    ],
  }),
  component: BackupPage,
});

function BackupPage() {
  const app = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<null | "clear" | "sample">(null);
  const [pending, setPending] = useState<Partial<AppData> | null>(null);

  function exportData() {
    try {
      const blob = new Blob([JSON.stringify(app.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shoes-store-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup file created");
    } catch {
      toast.error("Could not create the backup file");
    }
  }

  async function pickFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppData>;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.products)) {
        toast.error("That file is not a valid backup");
        return;
      }
      setPending(parsed);
    } catch {
      toast.error("Could not read that file");
    }
  }

  const counts = [
    ["Products", app.products.length],
    ["Stock rows", app.inventory.length],
    ["Sales", app.sales.length],
    ["Customers", app.customers.length],
    ["Expenses", app.expenses.length],
  ] as const;

  return (
    <Screen title="Backup & Restore" eyebrow="Your data stays on this device">
      <GlassCard className="p-3">
        <h2 className="font-display text-[14px] font-bold text-ink">Current data</h2>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
          {counts.map(([label, n]) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <span className="text-[12px] text-muted-foreground">{label}</span>
              <span className="font-mono text-[12px] tabular-nums text-ink">{n}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="space-y-3 p-3">
        <div>
          <h2 className="font-display text-[14px] font-bold text-ink">Export</h2>
          <p className="text-[11px] text-muted-foreground">
            Save everything into one file you can keep somewhere safe.
          </p>
        </div>
        <Button className="w-full" onClick={exportData}>
          <Download className="size-4" /> Export backup file
        </Button>
      </GlassCard>

      <GlassCard className="space-y-3 p-3">
        <div>
          <h2 className="font-display text-[14px] font-bold text-ink">Restore</h2>
          <p className="text-[11px] text-muted-foreground">
            Importing replaces everything currently stored on this device.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void pickFile(file);
            e.target.value = "";
          }}
        />
        <Button variant="glass" className="w-full" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" /> Choose backup file
        </Button>
      </GlassCard>

      <GlassCard className="space-y-3 p-3">
        <div>
          <h2 className="font-display text-[14px] font-bold text-ink">Demo & reset</h2>
          <p className="text-[11px] text-muted-foreground">
            Load example shoes to try the app, or wipe everything and start fresh.
          </p>
        </div>
        <Button variant="glass" className="w-full" onClick={() => setConfirm("sample")}>
          <Sparkles className="size-4" /> Load sample data
        </Button>
        <Button variant="danger" className="w-full" onClick={() => setConfirm("clear")}>
          <Trash2 className="size-4" /> Clear all data
        </Button>
      </GlassCard>

      <Confirm
        open={confirm === "clear"}
        title="Clear all data?"
        message="Products, stock, sales, customers and expenses will be permanently deleted."
        confirmLabel="Clear"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          app.clearAll();
          setConfirm(null);
          toast.success("All data cleared");
        }}
      />

      <Confirm
        open={confirm === "sample"}
        title="Load sample data?"
        message="Example shoes, stock and sales will be added to what you already have."
        confirmLabel="Load"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          app.loadSampleData();
          setConfirm(null);
          toast.success("Sample data loaded");
        }}
      />

      <Confirm
        open={pending !== null}
        title="Restore this backup?"
        message="Everything currently on this device will be replaced by the file contents."
        confirmLabel="Restore"
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) app.importData(pending);
          setPending(null);
          toast.success("Backup restored");
        }}
      />
    </Screen>
  );
}
