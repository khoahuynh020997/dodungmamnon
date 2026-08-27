import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type OrderStatus } from "@/lib/types";

const variant: Record<OrderStatus, "delivering" | "delivered" | "paid"> = {
  delivering: "delivering",
  delivered: "delivered",
  paid: "paid",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={variant[status]}>{STATUS_LABEL[status]}</Badge>;
}
