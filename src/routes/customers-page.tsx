import { Pencil, RotateCcw, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomerDialog } from "@/components/customer-dialog";
import { EmptyState } from "@/components/empty-state";
import { SampleBanner } from "@/components/sample-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { formatDate } from "@/lib/dates";
import { formatPhone, formatVnd, normalizePhone } from "@/lib/format";
import { useShopStore } from "@/lib/store";
import type { Customer } from "@/lib/types";

export function CustomersPage() {
  const hydrated = useHydrated();
  const customers = useShopStore((s) => s.customers);
  const orders = useShopStore((s) => s.orders);
  const openCreate = useShopStore((s) => s.openCreateOrder);
  const deleteCustomer = useShopStore((s) => s.deleteCustomer);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const phoneQ = normalizePhone(q);
    const list = customers.filter((c) => {
      if (!query) return true;
      return (
        c.name.toLowerCase().includes(query) ||
        c.address.toLowerCase().includes(query) ||
        (phoneQ.length > 0 && normalizePhone(c.phone).includes(phoneQ))
      );
    });
    return [...list].sort((a, b) => b.lastOrderAt - a.lastOrderAt);
  }, [customers, q]);

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded-xl bg-surface" />;
  }

  return (
    <div>
      <SampleBanner />
      <header className="mb-5">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Khách hàng</h1>
        <p className="mt-1 text-sm text-muted">
          Lưu lại sau mỗi đơn. Lần sau chỉ cần chọn để điền nhanh.
        </p>
      </header>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" />
        <Input
          className="pl-10"
          placeholder="Tìm tên hoặc số điện thoại…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Chưa có khách nào"
          description="Khách được lưu tự động khi bạn tạo đơn hàng."
          action={{ label: "Tạo đơn hàng", onClick: () => openCreate() }}
          icon={<Users className="size-8" />}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((customer) => {
            const theirs = orders.filter((o) => o.customerId === customer.id);
            const spent = theirs
              .filter((o) => o.status === "paid")
              .reduce((s, o) => s + o.amount, 0);
            return (
              <Card key={customer.id} className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted">{formatPhone(customer.phone)}</p>
                    <p className="mt-1 text-sm text-muted">{customer.address}</p>
                    <p className="mt-2 text-xs text-faint">
                      {theirs.length} đơn · Đã thu {formatVnd(spent)} · Gần nhất{" "}
                      {formatDate(customer.lastOrderAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openCreate(customer.id)}>
                      <RotateCcw />
                      Đặt lại
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(customer)}>
                      <Pencil />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Xóa khách"
                      onClick={() => {
                        deleteCustomer(customer.id);
                        toast("Đã xóa khách hàng");
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CustomerDialog
        customer={editing}
        open={Boolean(editing)}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
        }}
      />
    </div>
  );
}
