import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dashboard-shell";
import { RestaurantDashboardPage } from "@/components/restaurant-dashboard";

export const Route = createFileRoute("/dashboard/restaurant/menu")({
  component: () => (
    <DashboardShell expectedRole="restaurant">
      {(user) => <RestaurantDashboardPage user={user} view="menu" />}
    </DashboardShell>
  ),
});
