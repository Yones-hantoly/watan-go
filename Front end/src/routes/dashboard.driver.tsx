import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DriverDashboard } from "@/components/driver/driver-dashboard";
import { clearAuth, getAuth, redirectToOwnDashboard, type AuthUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/driver")({
  component: DriverDashboardRoute,
});

function DriverDashboardRoute() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentUser = getAuth();

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

    setUser(currentUser);
    setReady(true);
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/login" });
  };

  if (!ready || !user) {
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
