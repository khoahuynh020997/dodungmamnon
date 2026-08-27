import { useEffect, useState } from "react";
import { useShopStore } from "@/lib/store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const finish = () => {
      useShopStore.getState().seedIfEmpty();
      setHydrated(true);
    };
    if (useShopStore.persist.hasHydrated()) {
      finish();
      return;
    }
    const unsub = useShopStore.persist.onFinishHydration(finish);
    return unsub;
  }, []);

  return hydrated;
}
