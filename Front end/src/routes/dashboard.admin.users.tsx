import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/components/admin/admin-users-page";
import { AdminWorkspace } from "@/components/admin/admin-workspace";
import { DashboardShell } from "@/components/dashboard-shell";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: () => (
    <DashboardShell expectedRole="admin">
      {(user) => (
        <AdminWorkspace user={user} activeSection="users">
          <AdminUsersPage />
        </AdminWorkspace>
      )}
    </DashboardShell>
  ),
});
