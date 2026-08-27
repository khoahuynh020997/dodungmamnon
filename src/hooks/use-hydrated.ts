import { useEffect, useState } from "react";
import { useShopStore } from "@/lib/store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const loadAll = useShopStore((s) => s.loadAll);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadAll();
      } catch {
        // error stored in store; still mark hydrated so UI can show empty/error
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  return hydrated;
}
