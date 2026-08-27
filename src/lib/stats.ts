import {
  addVnDays,
  getVnYmd,
  startOfVnMonth,
  startOfVnToday,
  startOfVnWeek,
  startOfVnYear,
  vnDayEnd,
  vnDayStart,
} from "@/lib/dates";
import type { Order, OrderStatus } from "@/lib/types";

export type PeriodKey = "week" | "month" | "year" | "custom";

export interface DateRange {
  from: number;
  to: number;
}

export function rangeForPeriod(
  key: PeriodKey,
  custom?: { from: string; to: string },
  now = new Date(),
): DateRange {
  if (key === "custom" && custom?.from && custom?.to) {
    const [fy, fm, fd] = custom.from.split("-").map(Number);
    const [ty, tm, td] = custom.to.split("-").map(Number);
    return { from: vnDayStart(fy, fm, fd), to: vnDayEnd(ty, tm, td) };
  }
  const { y, m, d } = getVnYmd(now);
  if (key === "week") {
    return { from: startOfVnWeek(now), to: vnDayEnd(y, m, d) };
  }
  if (key === "month") {
    return { from: startOfVnMonth(now), to: vnDayEnd(y, m, d) };
  }
  if (key === "year") {
    return { from: startOfVnYear(now), to: vnDayEnd(y, m, d) };
  }
  return { from: startOfVnToday(now), to: vnDayEnd(y, m, d) };
}

export function inRange(ts: number, range: DateRange) {
  return ts >= range.from && ts <= range.to;
}

export interface ReportStats {
  orderCount: number;
  orderTotal: number;
  paidCount: number;
  paidTotal: number;
  deliveredUnpaid: number;
  deliveringTotal: number;
  byStatus: Record<OrderStatus, { count: number; total: number }>;
  series: Array<{ key: string; label: string; paid: number; created: number }>;
}

function emptyStatus() {
  return {
    delivering: { count: 0, total: 0 },
    delivered: { count: 0, total: 0 },
    paid: { count: 0, total: 0 },
  } satisfies Record<OrderStatus, { count: number; total: number }>;
}

export function computeReport(
  orders: Order[],
  range: DateRange,
  period: PeriodKey,
): ReportStats {
  const created = orders.filter((o) => inRange(o.createdAt, range));
  const byStatus = emptyStatus();
  for (const order of created) {
    byStatus[order.status].count += 1;
    byStatus[order.status].total += order.amount;
  }

  const paidInRange = orders.filter(
    (o) => o.status === "paid" && o.paidAt && inRange(o.paidAt, range),
  );

  return {
    orderCount: created.length,
    orderTotal: created.reduce((s, o) => s + o.amount, 0),
    paidCount: paidInRange.length,
    paidTotal: paidInRange.reduce((s, o) => s + o.amount, 0),
    deliveredUnpaid: created
      .filter((o) => o.status === "delivered")
      .reduce((s, o) => s + o.amount, 0),
    deliveringTotal: created
      .filter((o) => o.status === "delivering")
      .reduce((s, o) => s + o.amount, 0),
    byStatus,
    series: buildSeries(created, paidInRange, range, period),
  };
}

function buildSeries(
  created: Order[],
  paid: Order[],
  range: DateRange,
  period: PeriodKey,
): ReportStats["series"] {
  const span = range.to - range.from;
  const day = 86_400_000;

  if (period === "year" || span > 45 * day) {
    const buckets = new Map<string, { paid: number; created: number; label: string }>();
    const fromYmd = getVnYmd(new Date(range.from));
    const toYmd = getVnYmd(new Date(range.to));
    let y = fromYmd.y;
    let m = fromYmd.m;
    while (y < toYmd.y || (y === toYmd.y && m <= toYmd.m)) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      buckets.set(key, { paid: 0, created: 0, label: `Thg ${m}` });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    for (const o of created) {
      const p = getVnYmd(new Date(o.createdAt));
      const key = `${p.y}-${String(p.m).padStart(2, "0")}`;
      const b = buckets.get(key);
      if (b) b.created += o.amount;
    }
    for (const o of paid) {
      const ts = o.paidAt ?? o.createdAt;
      const p = getVnYmd(new Date(ts));
      const key = `${p.y}-${String(p.m).padStart(2, "0")}`;
      const b = buckets.get(key);
      if (b) b.paid += o.amount;
    }
    return [...buckets.entries()].map(([key, b]) => ({ key, ...b }));
  }

  const buckets: ReportStats["series"] = [];
  let t = range.from;
  let i = 0;
  while (t <= range.to && i < 62) {
    const ymd = getVnYmd(new Date(t + 12 * 3_600_000));
    const start = vnDayStart(ymd.y, ymd.m, ymd.d);
    const end = vnDayEnd(ymd.y, ymd.m, ymd.d);
    buckets.push({
      key: `${ymd.y}-${ymd.m}-${ymd.d}`,
      label: `${ymd.d}/${ymd.m}`,
      paid: paid
        .filter((o) => {
          const ts = o.paidAt ?? o.createdAt;
          return ts >= start && ts <= end;
        })
        .reduce((s, o) => s + o.amount, 0),
      created: created
        .filter((o) => o.createdAt >= start && o.createdAt <= end)
        .reduce((s, o) => s + o.amount, 0),
    });
    t = addVnDays(start, 1);
    i += 1;
  }
  return buckets;
}
