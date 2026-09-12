import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Users, Wallet, Database, Settings as Cog, ChevronRight } from "lucide-react";
import { Screen, GlassCard } from "@/components/kit";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — Shoes Store Management" },
      {
        name: "description",
        content: "Reports, customers, expenses, backup and settings for your shoe store.",
      },
      { property: "og:title", content: "More — Shoes Store Management" },
      {
        property: "og:description",
        content: "Everything else: reports, customers, expenses, backup and store settings.",
      },
    ],
  }),
  component: MorePage,
});

const links = [
  { to: "/reports", label: "Reports", desc: "Revenue, profit and best sellers", Icon: BarChart3 },
  { to: "/customers", label: "Customers", desc: "Simple customer list", Icon: Users },
  { to: "/expenses", label: "Expenses", desc: "Track store operational costs", Icon: Wallet },
  { to: "/backup", label: "Backup & Restore", desc: "Export or import your data", Icon: Database },
  { to: "/settings", label: "Settings", desc: "Store name, currency, theme", Icon: Cog },
] as const;

function MorePage() {
  const app = useApp();
  return (
    <Screen title="More" eyebrow={app.settings.storeName}>
      {links.map(({ to, label, desc, Icon }) => (
        <Link key={to} to={to}>
          <GlassCard className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-signal/10">
              <Icon className="size-4 text-signal" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[14px] font-bold text-ink">
                {label}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">{desc}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </GlassCard>
        </Link>
      ))}
      <p className="pt-2 text-center font-mono text-[10px] text-muted-foreground">
        Offline app · data stored on this device
      </p>
    </Screen>
  );
}
