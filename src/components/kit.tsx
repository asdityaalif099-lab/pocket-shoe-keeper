import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[460px] px-4 pb-28 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
            {eyebrow ?? "Sole Ledger"}
          </p>
          <h1 className="truncate font-display text-xl font-extrabold leading-none text-ink">
            {title}
          </h1>
        </div>
        {action}
      </header>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

export function GlassCard({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass rounded-2xl", className)} {...rest}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "ink",
  large,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ink" | "amber" | "danger" | "good" | "signal";
  large?: boolean;
}) {
  const toneClass = {
    ink: "text-ink",
    amber: "text-amber",
    danger: "text-danger",
    good: "text-good",
    signal: "text-signal",
  }[tone];
  return (
    <GlassCard className={cn("p-3", large ? "rounded-2xl" : "rounded-xl")}>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 font-display font-extrabold tabular-nums",
          large ? "text-2xl" : "text-lg",
          toneClass,
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{hint}</div>
      ) : null}
    </GlassCard>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "glass" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...rest }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-2xl font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
        size === "sm" ? "px-3 py-1.5 text-[12px]" : "px-4 py-3 text-[13px]",
        variant === "primary" && "bg-signal text-primary-foreground",
        variant === "glass" && "glass text-ink",
        variant === "ghost" && "text-signal",
        variant === "danger" && "bg-destructive text-destructive-foreground",
        className,
      )}
      {...rest}
    />
  );
}

export function Chip({
  active,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition active:scale-[.98]",
        active ? "bg-ink text-background font-semibold" : "glass text-ink",
      )}
      {...rest}
    />
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "amber" | "danger" | "good" | "muted";
  children: ReactNode;
}) {
  const cls = {
    amber: "bg-amber/15 text-amber",
    danger: "bg-danger/15 text-danger",
    good: "bg-good/15 text-good",
    muted: "bg-ink/5 text-muted-foreground",
  }[tone];
  return (
    <span className={cn("rounded-md px-2 py-0.5 font-mono text-[10px] font-medium", cls)}>
      {children}
    </span>
  );
}

export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="glass w-full rounded-full px-4 py-2 text-[13px] text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </label>
  );
}

const controlCls =
  "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-[14px] text-ink outline-none focus:ring-2 focus:ring-ring";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(controlCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(controlCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(controlCls, "appearance-none", props.className)} />;
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div className="relative max-h-[92vh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl border border-border bg-background px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="text-[12px] font-semibold text-muted-foreground">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center px-6">
      <button aria-label="Cancel" onClick={onCancel} className="absolute inset-0 bg-ink/40" />
      <div className="relative w-full max-w-[340px] rounded-2xl border border-border bg-background p-4 shadow-2xl">
        <h3 className="font-display text-base font-bold text-ink">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{message}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="glass" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard className="rise px-4 py-8 text-center">
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-[260px] text-[12px] leading-relaxed text-muted-foreground">
        {message}
      </p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </GlassCard>
  );
}
