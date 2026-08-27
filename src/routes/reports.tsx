import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SampleBanner } from "@/components/sample-banner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, startOfVnToday, toInputDate } from "@/lib/dates";
import { formatVnd, formatVndCompact } from "@/lib/format";
import { useHydrated } from "@/hooks/use-hydrated";
import { computeReport, rangeForPeriod, type PeriodKey } from "@/lib/stats";
import { useShopStore } from "@/lib/store";
import { STATUS_LABEL } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "week", label: "Tuần này" },
  { key: "month", label: "Tháng này" },
  { key: "year", label: "Năm nay" },
  { key: "custom", label: "Tùy chọn" },
];

function ReportsPage() {
  const hydrated = useHydrated();
  const orders = useShopStore((s) => s.orders);
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [from, setFrom] = useState(() => toInputDate(startOfVnToday() - 29 * 86_400_000));
  const [to, setTo] = useState(() => toInputDate(Date.now()));

  const range = useMemo(
    () => rangeForPeriod(period, { from, to }),
    [period, from, to],
  );
  const stats = useMemo(() => computeReport(orders, range, period), [orders, range, period]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface" />;
  }

  return (
    <div>
      <SampleBanner />
      <header className="mb-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Báo cáo doanh thu</h1>
        <p className="mt-1 text-sm text-muted">
          {formatDate(range.from)} – {formatDate(range.to)}
        </p>
      </header>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {PERIODS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPeriod(item.key)}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
              period === item.key
                ? "bg-primary text-primary-fg"
                : "bg-surface text-muted shadow-[var(--shadow-card)] hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {period === "custom" ? (
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="from">Từ ngày</Label>
            <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="to">Đến ngày</Label>
            <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
      ) : null}

      <Card className="mb-4 p-5">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">
          Số tiền đã bán (đã nhận về tài khoản)
        </p>
        <p className="font-display mt-2 text-4xl font-semibold tracking-tight tabular-nums">
          {formatVnd(stats.paidTotal)}
        </p>
        <p className="mt-1 text-sm text-muted">{stats.paidCount} đơn đã thu tiền</p>
      </Card>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Mini label="Tổng đơn tạo" value={String(stats.orderCount)} sub={formatVnd(stats.orderTotal)} />
        <Mini label="Đang giao" value={formatVnd(stats.deliveringTotal)} sub={STATUS_LABEL.delivering} />
        <Mini
          label="Chờ thu tiền"
          value={formatVnd(stats.deliveredUnpaid)}
          sub={STATUS_LABEL.delivered}
        />
        <Mini label="Đã nhận tiền" value={formatVnd(stats.paidTotal)} sub={STATUS_LABEL.paid} />
      </div>

      <Card className="mb-6 p-5">
        <h2 className="font-display mb-4 text-lg font-semibold">Biểu đồ đã thu</h2>
        {stats.series.every((s) => s.paid === 0 && s.created === 0) ? (
          <p className="py-10 text-center text-sm text-muted">Chưa có số liệu trong khoảng này.</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.series} barGap={4}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatVndCompact(v)}
                  width={72}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-primary-soft)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const paid = Number(payload.find((p) => p.dataKey === "paid")?.value ?? 0);
                    const created = Number(
                      payload.find((p) => p.dataKey === "created")?.value ?? 0,
                    );
                    return (
                      <div className="rounded-md bg-surface px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
                        <p className="mb-1 font-medium">{label}</p>
                        <p>Đã thu: {formatVnd(paid)}</p>
                        <p className="text-muted">Đơn tạo: {formatVnd(created)}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="created" fill="var(--color-primary-soft)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {(["delivering", "delivered", "paid"] as const).map((status) => (
          <Card key={status} className="p-4">
            <p className="text-sm font-medium">{STATUS_LABEL[status]}</p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
              {stats.byStatus[status].count}
            </p>
            <p className="text-sm text-muted">{formatVnd(stats.byStatus[status].total)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-faint">{sub}</p>
    </Card>
  );
}
