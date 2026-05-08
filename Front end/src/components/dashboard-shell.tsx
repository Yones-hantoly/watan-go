import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import {
  clearAuth,
  emojiForRole,
  getAuth,
  getDashboardNavLinks,
  labelForRole,
  redirectToOwnDashboard,
  type AuthUser,
  type Role,
} from "@/lib/auth";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  expectedRole: Role;
  children: (user: AuthUser) => ReactNode;
}

export function DashboardShell({ expectedRole, children }: Props) {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentUser = getAuth();

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

    setUser(currentUser);
    setReady(true);
  }, [expectedRole, navigate]);

  if (!ready || !user) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="font-mono text-sm">جارٍ التحقق من الجلسة...</div>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/login" });
  };

  const roleLinks = getDashboardNavLinks(user.role);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan glow">
              <span className="font-display text-base font-bold text-primary-foreground">و</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold tracking-tight">
                وطن جو <span className="font-mono text-sm text-muted-foreground">/ Watan Go</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {emojiForRole(user.role)} لوحة {labelForRole(user.role)}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {roleLinks.map((link, index) => (
              <Link
                key={`${link.label}-${index}`}
                to={link.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-lg px-3 py-2 text-sm font-medium text-foreground bg-secondary" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan text-xs font-bold text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

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
