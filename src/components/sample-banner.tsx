import { useShopStore } from "@/lib/store";

export function SampleBanner() {
  const error = useShopStore((s) => s.error);
  if (!error) return null;

  return (
    <div className="mb-5 rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary">
      <p className="font-medium">Không kết nối được Supabase</p>
      <p className="mt-1 text-primary/90">{error}</p>
      <p className="mt-2 text-xs text-primary/80">
        Hãy chạy file <code className="font-mono">supabase/schema.sql</code> trong SQL Editor của
        project, rồi tải lại trang.
      </p>
    </div>
  );
}
