import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, ClipboardList, Home, Plus, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { OrderDialog } from "@/components/order-dialog";
import { Button } from "@/components/ui/button";
import { useShopStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/orders", label: "Đơn hàng", icon: ClipboardList },
  { to: "/customers", label: "Khách hàng", icon: Users },
  { to: "/reports", label: "Báo cáo", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const openCreate = useShopStore((s) => s.openCreateOrder);

  return (
    <div className="min-h-dvh bg-bg">
      <div className="h-1 bg-primary" />
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <BrandMark />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold leading-tight tracking-tight">
                Đồ Dùng Mầm Non
              </span>
              <span className="hidden text-xs text-muted sm:block">Quản lý đơn hàng</span>
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto">
            <Button onClick={() => openCreate()} className="hidden sm:inline-flex">
              <Plus />
              Tạo đơn hàng
            </Button>
            <Button
              onClick={() => openCreate()}
              size="icon"
              className="sm:hidden"
              aria-label="Tạo đơn hàng"
            >
              <Plus />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 md:pb-12">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <OrderDialog />
    </div>
  );
}
