import { createFileRoute } from "@tanstack/react-router";
import { AdminManagementRoute, AdminRestaurantsPage } from "@/components/admin/admin-workspace";

export const Route = createFileRoute("/admin/restaurants")({
  component: () => (
    <AdminManagementRoute section="restaurants">
      <AdminRestaurantsPage />
    </AdminManagementRoute>
  ),
});
