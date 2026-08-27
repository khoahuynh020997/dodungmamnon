import { create } from "zustand";
import { normalizePhone } from "@/lib/format";
import { supabase, toMs, type DbCustomer, type DbOrder } from "@/lib/supabase";
import type { Customer, Order, OrderStatus } from "@/lib/types";

function mapCustomer(row: DbCustomer): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    address: row.address,
    createdAt: toMs(row.created_at) ?? Date.now(),
    lastOrderAt: toMs(row.last_order_at) ?? Date.now(),
  };
}

function mapOrder(row: DbOrder): Order {
  return {
    id: row.id,
    number: row.number,
    customerId: row.customer_id ?? "",
    name: row.name,
    phone: row.phone,
    address: row.address,
    amount: Number(row.amount),
    status: row.status,
    createdAt: toMs(row.created_at) ?? Date.now(),
    updatedAt: toMs(row.updated_at) ?? Date.now(),
    deliveredAt: toMs(row.delivered_at),
    paidAt: toMs(row.paid_at),
  };
}

export interface ShopState {
  customers: Customer[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  dialogOpen: boolean;
  dialogCustomerId: string | null;
  loadAll: () => Promise<void>;
  addOrder: (input: {
    name: string;
    phone: string;
    address: string;
    amount: number;
    customerId?: string | null;
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateCustomer: (
    id: string,
    patch: Pick<Customer, "name" | "phone" | "address">,
  ) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  openCreateOrder: (customerId?: string | null) => void;
  closeCreateOrder: () => void;
}

async function resolveCustomer(input: {
  name: string;
  phone: string;
  address: string;
  customerId?: string | null;
}): Promise<Customer> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();
  const nowIso = new Date().toISOString();

  if (input.customerId) {
    const { data, error } = await supabase
      .from("customers")
      .update({ name, phone, address, last_order_at: nowIso })
      .eq("id", input.customerId)
      .select("*")
      .single();
    if (error) throw error;
    return mapCustomer(data as DbCustomer);
  }

  const phoneKey = normalizePhone(phone);
  const { data: existingList, error: findError } = await supabase
    .from("customers")
    .select("*")
    .order("last_order_at", { ascending: false });
  if (findError) throw findError;

  const existing = (existingList as DbCustomer[] | null)?.find(
    (c) => normalizePhone(c.phone) === phoneKey,
  );

  if (existing) {
    const { data, error } = await supabase
      .from("customers")
      .update({ name, phone, address, last_order_at: nowIso })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapCustomer(data as DbCustomer);
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({ name, phone, address, created_at: nowIso, last_order_at: nowIso })
    .select("*")
    .single();
  if (error) throw error;
  return mapCustomer(data as DbCustomer);
}

export const useShopStore = create<ShopState>((set, get) => ({
  customers: [],
  orders: [],
  loading: false,
  error: null,
  dialogOpen: false,
  dialogCustomerId: null,

  loadAll: async () => {
    set({ loading: true, error: null });
    try {
      const [customersRes, ordersRes] = await Promise.all([
        supabase.from("customers").select("*").order("last_order_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
      ]);
      if (customersRes.error) throw customersRes.error;
      if (ordersRes.error) throw ordersRes.error;
      set({
        customers: ((customersRes.data as DbCustomer[]) ?? []).map(mapCustomer),
        orders: ((ordersRes.data as DbOrder[]) ?? []).map(mapOrder),
        loading: false,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Không tải được dữ liệu từ Supabase";
      set({ loading: false, error: message });
      throw e;
    }
  },

  addOrder: async (input) => {
    const customer = await resolveCustomer(input);
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        amount: input.amount,
        status: "delivering",
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select("*")
      .single();
    if (error) throw error;
    const order = mapOrder(data as DbOrder);
    set({
      customers: [customer, ...get().customers.filter((c) => c.id !== customer.id)],
      orders: [order, ...get().orders],
    });
    return order;
  },

  updateOrderStatus: async (id, status) => {
    const nowIso = new Date().toISOString();
    const current = get().orders.find((o) => o.id === id);
    const patch: Record<string, unknown> = {
      status,
      updated_at: nowIso,
    };
    if (status === "delivered" && !current?.deliveredAt) {
      patch.delivered_at = nowIso;
    }
    if (status === "paid") {
      if (!current?.deliveredAt) patch.delivered_at = nowIso;
      patch.paid_at = nowIso;
    }
    const { data, error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    const order = mapOrder(data as DbOrder);
    set({
      orders: get().orders.map((o) => (o.id === id ? order : o)),
    });
  },

  deleteOrder: async (id) => {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) throw error;
    set({ orders: get().orders.filter((o) => o.id !== id) });
  },

  updateCustomer: async (id, patch) => {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: patch.name.trim(),
        phone: patch.phone.trim(),
        address: patch.address.trim(),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    const customer = mapCustomer(data as DbCustomer);
    set({
      customers: get().customers.map((c) => (c.id === id ? customer : c)),
    });
  },

  deleteCustomer: async (id) => {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
    set({ customers: get().customers.filter((c) => c.id !== id) });
  },

  openCreateOrder: (customerId = null) => {
    set({ dialogOpen: true, dialogCustomerId: customerId ?? null });
  },

  closeCreateOrder: () => {
    set({ dialogOpen: false, dialogCustomerId: null });
  },
}));
