import { createRootRoute, createRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Home } from "@/routes/home";
import { OrdersPage } from "@/routes/orders-page";
import { CustomersPage } from "@/routes/customers-page";
import { ReportsPage } from "@/routes/reports-page";

function RootLayout() {
  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster position="top-center" toastOptions={{ className: "font-sans" }} />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrdersPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  component: CustomersPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  ordersRoute,
  customersRoute,
  reportsRoute,
]);
