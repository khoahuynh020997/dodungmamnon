import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/lib/store";

export function SampleBanner() {
  const hasSample = useShopStore(
    (s) => s.orders.some((o) => o.isSample) || s.customers.some((c) => c.isSample),
  );
  const clear = useShopStore((s) => s.clearSampleData);

  if (!hasSample) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary sm:flex-row sm:items-center sm:justify-between">
      <p>Đang xem dữ liệu mẫu để bạn làm quen. Xóa khi bắt đầu dùng thật.</p>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-primary/20"
        onClick={() => {
          clear();
          toast.success("Đã xóa dữ liệu mẫu");
        }}
      >
        Xóa dữ liệu mẫu
      </Button>
    </div>
  );
}
