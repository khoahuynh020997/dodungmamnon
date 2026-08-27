import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://odbxozdgskoyrohqojow.supabase.co";
const supabaseKey = "sb_publishable_BHnGsZ6fjUvATynlL_pNtA_suJJeaQ8";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type DbCustomer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  last_order_at: string;
};

export type DbOrder = {
  id: string;
  number: number;
  customer_id: string | null;
  name: string;
  phone: string;
  address: string;
  amount: number;
  status: "delivering" | "delivered" | "paid";
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
  paid_at: string | null;
};

export function toMs(iso: string | null | undefined): number | undefined {
  if (!iso) return undefined;
  return new Date(iso).getTime();
}

export function toIso(ms: number): string {
  return new Date(ms).toISOString();
}
