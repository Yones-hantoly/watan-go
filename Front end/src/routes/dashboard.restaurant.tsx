import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { RestaurantDashboardPage } from "@/components/restaurant-dashboard";

export const Route = createFileRoute("/dashboard/restaurant")({
  component: RestaurantDashboardRoute,
});

function RestaurantDashboardRoute() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const view = pathname === "/dashboard/restaurant/menu" ? "menu" : "orders";

  return (
    <DashboardShell expectedRole="restaurant">
      {(user) => <RestaurantDashboardPage user={user} view={view} />}
    </DashboardShell>
  );
}
