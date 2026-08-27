import { MoreHorizontal, Truck } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/dates";
import { formatOrderNumber, formatPhone, formatVnd } from "@/lib/format";
import { useShopStore } from "@/lib/store";
import { STATUS_LABEL, STATUS_ORDER, type Order, type OrderStatus } from "@/lib/types";

export function OrderCard({ order }: { order: Order }) {
  const updateStatus = useShopStore((s) => s.updateOrderStatus);
  const deleteOrder = useShopStore((s) => s.deleteOrder);

  function setStatus(status: OrderStatus) {
    updateStatus(order.id, status);
    toast.success(`${formatOrderNumber(order.number)} · ${STATUS_LABEL[status]}`);
  }

  const next =
    order.status === "delivering"
      ? "delivered"
      : order.status === "delivered"
        ? "paid"
        : null;

  return (
    <article className="rounded-xl bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-muted uppercase">
            {formatOrderNumber(order.number)}
          </p>
          <h3 className="truncate font-semibold">{order.name}</h3>
          <p className="text-sm text-muted">{formatPhone(order.phone)}</p>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={order.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" aria-label="Thêm">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
              {STATUS_ORDER.map((status) => (
                <DropdownMenuItem
                  key={status}
                  disabled={status === order.status}
                  onSelect={() => setStatus(status)}
                >
                  {STATUS_LABEL[status]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-primary"
                onSelect={() => {
                  deleteOrder(order.id);
                  toast("Đã xóa đơn hàng");
                }}
              >
                Xóa đơn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">{order.address}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-faint">{formatDateTime(order.createdAt)}</p>
          <p className="font-display text-xl font-semibold tracking-tight tabular-nums">
            {formatVnd(order.amount)}
          </p>
        </div>
        {next ? (
          <Button size="sm" variant={next === "paid" ? "default" : "secondary"} onClick={() => setStatus(next)}>
            <Truck />
            {next === "delivered" ? "Đã giao thành công" : "Đã nhận tiền"}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
