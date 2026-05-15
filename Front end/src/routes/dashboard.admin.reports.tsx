import { createFileRoute } from "@tanstack/react-router";
import { AdminManagementRoute } from "@/components/admin/admin-workspace";

export const Route = createFileRoute("/dashboard/admin/reports")({
  component: () => <AdminManagementRoute section="reports" />,
});
