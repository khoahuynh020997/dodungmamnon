import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizePhone } from "@/lib/format";
import { makeSeed } from "@/lib/seed";
import type { Customer, Order, OrderStatus } from "@/lib/types";

function uid() {
  return crypto.randomUUID();
}

export interface ShopState {
  customers: Customer[];
  orders: Order[];
  nextOrderNumber: number;
  dialogOpen: boolean;
  dialogCustomerId: string | null;
  seeded: boolean;
  addOrder: (input: {
    name: string;
    phone: string;
    address: string;
    amount: number;
    customerId?: string | null;
  }) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  updateCustomer: (
    id: string,
    patch: Pick<Customer, "name" | "phone" | "address">,
  ) => void;
  deleteCustomer: (id: string) => void;
  openCreateOrder: (customerId?: string | null) => void;
  closeCreateOrder: () => void;
  seedIfEmpty: () => void;
  clearSampleData: () => void;
}

function upsertCustomer(
  customers: Customer[],
  input: { name: string; phone: string; address: string; customerId?: string | null },
  at: number,
): { customers: Customer[]; customer: Customer } {
  if (input.customerId) {
    const existing = customers.find((c) => c.id === input.customerId);
    if (existing) {
      const customer: Customer = {
        ...existing,
        name: input.name.trim(),
        phone: input.phone.trim(),
        address: input.address.trim(),
        lastOrderAt: at,
      };
      return {
        customers: customers.map((c) => (c.id === customer.id ? customer : c)),
        customer,
      };
    }
  }

  const phoneKey = normalizePhone(input.phone);
  const existing = customers.find((c) => normalizePhone(c.phone) === phoneKey);
  if (existing) {
    const customer: Customer = {
      ...existing,
      name: input.name.trim(),
      phone: input.phone.trim(),
      address: input.address.trim(),
      lastOrderAt: at,
    };
    return {
      customers: customers.map((c) => (c.id === customer.id ? customer : c)),
      customer,
    };
  }

  const customer: Customer = {
    id: uid(),
    name: input.name.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    createdAt: at,
    lastOrderAt: at,
  };
  return { customers: [customer, ...customers], customer };
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      customers: [],
      orders: [],
      nextOrderNumber: 1,
      dialogOpen: false,
      dialogCustomerId: null,
      seeded: false,

      addOrder: (input) => {
        const at = Date.now();
        const { customers, customer } = upsertCustomer(get().customers, input, at);
        const number = get().nextOrderNumber;
        const order: Order = {
          id: uid(),
          number,
          customerId: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          amount: input.amount,
          status: "delivering",
          createdAt: at,
          updatedAt: at,
        };
        set({
          customers,
          orders: [order, ...get().orders],
          nextOrderNumber: number + 1,
        });
        return order;
      },

      updateOrderStatus: (id, status) => {
        const at = Date.now();
        set({
          orders: get().orders.map((order) => {
            if (order.id !== id) return order;
            const next: Order = { ...order, status, updatedAt: at };
            if (status === "delivered" && !next.deliveredAt) next.deliveredAt = at;
            if (status === "paid") {
              if (!next.deliveredAt) next.deliveredAt = at;
              next.paidAt = at;
            }
            return next;
          }),
        });
      },

      deleteOrder: (id) => {
        set({ orders: get().orders.filter((o) => o.id !== id) });
      },

      updateCustomer: (id, patch) => {
        set({
          customers: get().customers.map((c) =>
            c.id === id
              ? {
                  ...c,
                  name: patch.name.trim(),
                  phone: patch.phone.trim(),
                  address: patch.address.trim(),
                }
              : c,
          ),
        });
      },

      deleteCustomer: (id) => {
        set({ customers: get().customers.filter((c) => c.id !== id) });
      },

      openCreateOrder: (customerId = null) => {
        set({ dialogOpen: true, dialogCustomerId: customerId ?? null });
      },

      closeCreateOrder: () => {
        set({ dialogOpen: false, dialogCustomerId: null });
      },

      seedIfEmpty: () => {
        const state = get();
        if (state.seeded || state.orders.length > 0 || state.customers.length > 0) {
          if (!state.seeded) set({ seeded: true });
          return;
        }
        const seed = makeSeed(Date.now());
        set({
          customers: seed.customers,
          orders: seed.orders,
          nextOrderNumber: seed.nextOrderNumber,
          seeded: true,
        });
      },

      clearSampleData: () => {
        set({
          customers: get().customers.filter((c) => !c.isSample),
          orders: get().orders.filter((o) => !o.isSample),
        });
      },
    }),
    {
      name: "ddmn-shop-v1",
      partialize: (state) => ({
        customers: state.customers,
        orders: state.orders,
        nextOrderNumber: state.nextOrderNumber,
        seeded: state.seeded,
      }),
    },
  ),
);
