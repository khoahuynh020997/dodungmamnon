import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatOrderNumber, formatVndCompact, normalizePhone, parseAmount } from "@/lib/format";
import { useShopStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface FormState {
  name: string;
  phone: string;
  address: string;
  amount: string;
}

const empty: FormState = { name: "", phone: "", address: "", amount: "" };

export function OrderDialog() {
  const open = useShopStore((s) => s.dialogOpen);
  const customerId = useShopStore((s) => s.dialogCustomerId);
  const customers = useShopStore((s) => s.customers);
  const close = useShopStore((s) => s.closeCreateOrder);
  const addOrder = useShopStore((s) => s.addOrder);

  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [pickedId, setPickedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const customer = customerId
      ? customers.find((c) => c.id === customerId)
      : undefined;
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        amount: "",
      });
      setPickedId(customer.id);
    } else {
      setForm(empty);
      setPickedId(null);
    }
    setErrors({});
  }, [open, customerId, customers]);

  const suggestions = useMemo(() => {
    const q = form.name.trim().toLowerCase();
    const p = normalizePhone(form.phone);
    if (q.length < 1 && p.length < 3) return [];
    return customers
      .filter((c) => {
        if (pickedId === c.id) return false;
        const nameHit = q.length > 0 && c.name.toLowerCase().includes(q);
        const phoneHit = p.length >= 3 && normalizePhone(c.phone).includes(p);
        return nameHit || phoneHit;
      })
      .slice(0, 5);
  }, [customers, form.name, form.phone, pickedId]);

  function pickCustomer(id: string) {
    const customer = customers.find((c) => c.id === id);
    if (!customer) return;
    setForm((f) => ({
      ...f,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    }));
    setPickedId(customer.id);
  }

  function validate(): boolean {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = "Nhập tên khách hàng";
    if (normalizePhone(form.phone).length < 9) next.phone = "Số điện thoại chưa hợp lệ";
    if (!form.address.trim()) next.address = "Nhập địa chỉ giao hàng";
    const amount = parseAmount(form.amount);
    if (amount <= 0) next.amount = "Nhập giá tiền lớn hơn 0";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const order = addOrder({
      name: form.name,
      phone: form.phone,
      address: form.address,
      amount: parseAmount(form.amount),
      customerId: pickedId,
    });
    toast.success(`Đã tạo ${formatOrderNumber(order.number)} — đang giao`);
    close();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? close() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo đơn hàng</DialogTitle>
          <DialogDescription>
            Nhập thông tin khách. Khách cũ sẽ được gợi ý để điền nhanh.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <Field
            label="Tên khách hàng"
            error={errors.name}
            htmlFor="order-name"
          >
            <Input
              id="order-name"
              autoComplete="name"
              placeholder="Nguyễn Thị Lan"
              value={form.name}
              onChange={(e) => {
                setPickedId(null);
                setForm((f) => ({ ...f, name: e.target.value }));
              }}
            />
          </Field>
          <Field label="Số điện thoại" error={errors.phone} htmlFor="order-phone">
            <Input
              id="order-phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0903 123 456"
              value={form.phone}
              onChange={(e) => {
                setPickedId(null);
                setForm((f) => ({ ...f, phone: e.target.value }));
              }}
            />
          </Field>
          {suggestions.length > 0 ? (
            <ul className="overflow-hidden rounded-md bg-surface-2">
              {suggestions.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pickCustomer(c.id)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left hover:bg-primary-soft"
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-xs text-muted">
                      {c.phone} · {c.address}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <Field label="Địa chỉ" error={errors.address} htmlFor="order-address">
            <Textarea
              id="order-address"
              placeholder="Số nhà, đường, quận, tỉnh"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </Field>
          <Field label="Giá tiền (VNĐ)" error={errors.amount} htmlFor="order-amount">
            <Input
              id="order-amount"
              inputMode="numeric"
              placeholder="350.000"
              value={form.amount}
              onChange={(e) => {
                const n = parseAmount(e.target.value);
                setForm((f) => ({
                  ...f,
                  amount: n ? formatVndCompact(n) : e.target.value.replace(/[^\d]/g, ""),
                }));
              }}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Hủy
            </Button>
            <Button type="submit">Lưu đơn hàng</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className={cn("text-xs text-primary")} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
