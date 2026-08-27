export type OrderStatus = "delivering" | "delivered" | "paid";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: number;
  lastOrderAt: number;
  isSample?: boolean;
}

export interface Order {
  id: string;
  number: number;
  customerId: string;
  name: string;
  phone: string;
  address: string;
  amount: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  deliveredAt?: number;
  paidAt?: number;
  isSample?: boolean;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  delivering: "Đang giao",
  delivered: "Đã giao thành công",
  paid: "Đã nhận tiền",
};

export const STATUS_ORDER: OrderStatus[] = ["delivering", "delivered", "paid"];
