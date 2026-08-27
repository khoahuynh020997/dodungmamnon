import { useEffect, useState, type FormEvent } from "react";
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
import { normalizePhone } from "@/lib/format";
import { useShopStore } from "@/lib/store";
import type { Customer } from "@/lib/types";

export function CustomerDialog({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateCustomer = useShopStore((s) => s.updateCustomer);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone);
    setAddress(customer.address);
    setError("");
  }, [customer, open]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!customer || saving) return;
    if (!name.trim() || normalizePhone(phone).length < 9 || !address.trim()) {
      setError("Điền đủ tên, số điện thoại và địa chỉ.");
      return;
    }
    setSaving(true);
    try {
      await updateCustomer(customer.id, { name, phone, address });
      toast.success("Đã cập nhật khách hàng");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không cập nhật được khách");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa khách hàng</DialogTitle>
          <DialogDescription>Thông tin này dùng để điền nhanh khi đặt lại.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="cust-name">Tên</Label>
            <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cust-phone">Số điện thoại</Label>
            <Input
              id="cust-phone"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cust-address">Địa chỉ</Label>
            <Textarea
              id="cust-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {error ? <p className="text-xs text-primary">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
