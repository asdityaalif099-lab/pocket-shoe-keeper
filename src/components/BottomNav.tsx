import { Link } from "@tanstack/react-router";
import { LayoutGrid, Boxes, Package, Receipt, Menu } from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", Icon: LayoutGrid },
  { to: "/products", label: "Products", Icon: Package },
  { to: "/inventory", label: "Inventory", Icon: Boxes },
  { to: "/sales", label: "Sales", Icon: Receipt },
  { to: "/more", label: "More", Icon: Menu },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="glass mx-auto flex w-full max-w-[460px] justify-between border-t px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.6rem)]">
        {items.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-1 flex-col items-center gap-0.5 px-1 py-1 text-muted-foreground [&.active]:text-signal"
          >
            <Icon className="size-5" strokeWidth={2} />
            <span className="text-[9px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
