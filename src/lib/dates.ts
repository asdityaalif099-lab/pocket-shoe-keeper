export type RangeKey = "today" | "week" | "month" | "all" | "custom";

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All Time",
  custom: "Custom",
};

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function inRange(
  iso: string,
  range: RangeKey,
  custom?: { from?: string; to?: string },
): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (range === "all") return true;
  if (range === "today") return isSameDay(date, now);
  if (range === "week") {
    const start = startOfDay(now);
    const day = (start.getDay() + 6) % 7; // Monday first
    start.setDate(start.getDate() - day);
    return date >= start;
  }
  if (range === "month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  const from = custom?.from ? startOfDay(new Date(custom.from)) : null;
  const to = custom?.to ? new Date(new Date(custom.to).setHours(23, 59, 59, 999)) : null;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function todayInput() {
  return new Date().toISOString().slice(0, 10);
}
