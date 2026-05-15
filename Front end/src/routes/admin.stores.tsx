import { createFileRoute } from "@tanstack/react-router";
import { AdminManagementRoute, AdminStoresPage } from "@/components/admin/admin-workspace";

export const Route = createFileRoute("/admin/stores")({
  component: () => (
    <AdminManagementRoute section="stores">
      <AdminStoresPage />
    </AdminManagementRoute>
  ),
});
