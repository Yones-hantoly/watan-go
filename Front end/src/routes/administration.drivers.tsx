import { createFileRoute } from "@tanstack/react-router";
import { AdminManagementRoute } from "@/components/admin/admin-workspace";

export const Route = createFileRoute("/administration/drivers")({
  component: () => <AdminManagementRoute section="drivers" />,
});
