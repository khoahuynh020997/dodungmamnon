import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Banknote, Package, Truck, Wallet } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { OrderCard } from "@/components/order-card";
import { SampleBanner } from "@/components/sample-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatWeekdayDate, startOfVnMonth, startOfVnToday, startOfVnWeek } from "@/lib/dates";
import { formatVnd } from "@/lib/format";
import { useHydrated } from "@/hooks/use-hydrated";
import { useShopStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const hydrated = useHydrated();
  const orders = useShopStore((s) => s.orders);
  const openCreate = useShopStore((s) => s.openCreateOrder);

  if (!hydrated) return <HomeSkeleton />;

  const today = startOfVnToday();
  const week = startOfVnWeek();
  const month = startOfVnMonth();

  const todayOrders = orders.filter((o) => o.createdAt >= today);
  const delivering = orders.filter((o) => o.status === "delivering");
  const weekPaid = orders
    .filter((o) => o.status === "paid" && (o.paidAt ?? 0) >= week)
    .reduce((s, o) => s + o.amount, 0);
  const monthPaid = orders
    .filter((o) => o.status === "paid" && (o.paidAt ?? 0) >= month)
    .reduce((s, o) => s + o.amount, 0);

  const recent = orders.slice(0, 5);

  return (
    <div>
      <SampleBanner />
      <section className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Xin chào</p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Quản lý đơn hàng
          </h1>
          <p className="mt-2 text-sm text-muted capitalize">{formatWeekdayDate(Date.now())}</p>
        </div>
        <Button size="lg" onClick={() => openCreate()}>
          Tạo đơn hàng
        </Button>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Đơn hôm nay"
          value={String(todayOrders.length)}
          hint={formatVnd(todayOrders.reduce((s, o) => s + o.amount, 0))}
          icon={<Package className="size-4" />}
        />
        <Stat
          label="Đang giao"
          value={String(delivering.length)}
          hint="Cần theo dõi"
          icon={<Truck className="size-4" />}
        />
        <Stat
          label="Thu tuần này"
          value={formatVnd(weekPaid)}
          hint="Đã nhận tiền"
          icon={<Wallet className="size-4" />}
        />
        <Stat
          label="Thu tháng này"
          value={formatVnd(monthPaid)}
          hint="Doanh thu xác nhận"
          icon={<Banknote className="size-4" />}
        />
      </section>

      {delivering.length > 0 ? (
        <section className="mb-8">
          <SectionHead title="Đơn đang giao" to="/orders" />
          <div className="grid gap-3 md:grid-cols-2">
            {delivering.slice(0, 4).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHead title="Đơn gần đây" to="/orders" />
        {recent.length === 0 ? (
          <EmptyState
            title="Chưa có đơn hàng"
            description="Tạo đơn đầu tiên: nhập tên, số điện thoại, địa chỉ và giá tiền. Khách sẽ được lưu để đặt lại cho nhanh."
            action={{ label: "Tạo đơn hàng", onClick: () => openCreate() }}
            icon={<Package className="size-8" />}
          />
        ) : (
          <div className="grid gap-3">
            {recent.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-muted">
        <p className="text-xs font-medium tracking-wide uppercase">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-3 font-display text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-faint">{hint}</p>
    </Card>
  );
}

function SectionHead({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <Button variant="ghost" size="sm" asChild>
        <Link to={to}>
          Xem tất cả
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-20 rounded-lg bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
