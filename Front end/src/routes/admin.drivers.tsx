import { createFileRoute } from "@tanstack/react-router";
import { AdminDriversPage, AdminManagementRoute } from "@/components/admin/admin-workspace";

export const Route = createFileRoute("/admin/drivers")({
  component: () => (
    <AdminManagementRoute section="drivers">
      <AdminDriversPage />
    </AdminManagementRoute>
  ),
});
