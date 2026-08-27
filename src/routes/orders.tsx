import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { OrderCard } from "@/components/order-card";
import { SampleBanner } from "@/components/sample-banner";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatOrderNumber, normalizePhone } from "@/lib/format";
import { useShopStore } from "@/lib/store";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({ component: OrdersPage });

const FILTERS: Array<{ key: "all" | OrderStatus; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "delivering", label: STATUS_LABEL.delivering },
  { key: "delivered", label: STATUS_LABEL.delivered },
  { key: "paid", label: STATUS_LABEL.paid },
];

function OrdersPage() {
  const hydrated = useHydrated();
  const orders = useShopStore((s) => s.orders);
  const openCreate = useShopStore((s) => s.openCreateOrder);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const phoneQ = normalizePhone(q);
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!query) return true;
      return (
        o.name.toLowerCase().includes(query) ||
        o.address.toLowerCase().includes(query) ||
        formatOrderNumber(o.number).toLowerCase().includes(query) ||
        (phoneQ.length > 0 && normalizePhone(o.phone).includes(phoneQ))
      );
    });
  }, [orders, filter, q]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface" />;
  }

  return (
    <div>
      <SampleBanner />
      <header className="mb-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Lịch sử đơn hàng</h1>
        <p className="mt-1 text-sm text-muted">{orders.length} đơn đã lưu trên máy này</p>
      </header>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
        <Input
          className="pl-10"
          placeholder="Tìm tên, số điện thoại, mã đơn…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
              filter === item.key
                ? "bg-primary text-primary-fg"
                : "bg-surface text-muted shadow-[var(--shadow-card)] hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={orders.length === 0 ? "Chưa có đơn nào" : "Không tìm thấy đơn"}
          description={
            orders.length === 0
              ? "Nhấn Tạo đơn hàng để nhập tên, số điện thoại, địa chỉ và giá tiền."
              : "Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
          }
          action={
            orders.length === 0
              ? { label: "Tạo đơn hàng", onClick: () => openCreate() }
              : undefined
          }
          icon={<ClipboardList className="size-8" />}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
