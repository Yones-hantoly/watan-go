import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  redirectToOwnDashboard,
  useAuth,
  type AuthUser,
  type Role,
} from "@/lib/auth";
import { toast } from "sonner";

interface Props {
  expectedRole: Role;
  children: (user: AuthUser) => ReactNode;
}

export function DashboardShell({ expectedRole, children }: Props) {
  const navigate = useNavigate();
  const user = useAuth();

  useEffect(() => {
    const currentUser = user;

    if (!currentUser) {
      toast.error("يجب تسجيل الدخول أولًا");
      navigate({ to: "/login" });
      return;
    }

    if (currentUser.role !== expectedRole) {
      toast.error("لا تملك صلاحية الوصول لهذه اللوحة");
      navigate({ to: redirectToOwnDashboard(currentUser) });
      return;
    }

  }, [expectedRole, navigate, user]);

  if (!user || user.role !== expectedRole) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="font-mono text-sm">جارٍ التحقق من الجلسة...</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-7xl px-6 py-8">{children(user)}</main>
    </div>
  );
}

export function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: "primary" | "cyan" | "amber" }) {
  const color = accent === "cyan" ? "text-cyan" : accent === "amber" ? "text-amber" : "text-primary";
  return (
    <div className="card-elevated p-5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${color}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
