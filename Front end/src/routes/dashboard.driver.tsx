import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { DriverDashboard } from "@/components/driver/driver-dashboard";
import { clearAuth, redirectToOwnDashboard, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/driver")({
  component: DriverDashboardRoute,
});

function DriverDashboardRoute() {
  const navigate = useNavigate();
  const router = useRouter();
  const user = useAuth();

  useEffect(() => {
    const currentUser = user;

    if (!currentUser) {
      toast.error("يجب تسجيل الدخول أولا");
      navigate({ to: "/login" });
      return;
    }

    if (currentUser.role !== "driver") {
      toast.error("لا تملك صلاحية الوصول إلى لوحة السائق");
      navigate({ to: redirectToOwnDashboard(currentUser) });
      return;
    }

  }, [navigate, user]);

  const handleLogout = async () => {
    clearAuth();
    toast.success("تم تسجيل الخروج");
    await router.invalidate();
    navigate({ to: "/login", replace: true });
  };

  if (!user || user.role !== "driver") {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-primary/60" />
          <p className="font-mono text-sm">جار التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return <DriverDashboard user={user} onLogout={handleLogout} />;
}
