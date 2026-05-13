import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Car, LogOut, ShoppingCart, Store, UtensilsCrossed } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { clearAuth, getDashboardNavLinks, useAuth } from "@/lib/auth";
import { getCartCount, subscribeToCart } from "@/lib/commerce";
import { toast } from "sonner";

export function Header() {
  const navigate = useNavigate();
  const user = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeToCart(() => setCartCount(getCartCount()));
  }, []);

  const publicLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/architecture", label: "النظام" },
    { to: "/contact", label: "تواصل" },
    { to: "/login", label: "دخول" },
    { to: "/register", label: "تسجيل" },
  ] as const;

  const dashboardLink = user && user.role !== "restaurant"
    ? {
        to:
          user.role === "admin"
            ? "/dashboard/admin"
            : `/dashboard/${user.role === "customer" ? "customer" : user.role}`,
        label: "التسجيل",
      }
    : null;

  const roleLinks =
    user?.role === "restaurant"
      ? [{ to: "/dashboard/restaurant", label: "لوحة المطعم" }]
      : getDashboardNavLinks(user?.role ?? "customer");
  const authenticatedLinks = user
    ? [{ to: "/", label: "الرئيسية" }, ...roleLinks]
    : publicLinks;

  const handleLogout = () => {
    clearAuth();
    toast.success("تم تسجيل الخروج");
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan glow">
            <span className="font-display text-base font-bold text-primary-foreground">و</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">
              وطن جو <span className="font-mono text-sm text-muted-foreground">/ Watan Go</span>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">v1.0 · منصة</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {authenticatedLinks.map((link, index) => (
            <Link
              key={`${link.label}-${index}`}
              to={link.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/cart"
              className="relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground" }}
              aria-label="السلة"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          {dashboardLink ? (
            <Link
              to={dashboardLink.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground" }}
            >
              {dashboardLink.label}
            </Link>
          ) : null}
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-cyan text-xs font-bold text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <span className="max-w-32 truncate text-sm font-medium">{user.name}</span>
            </div>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-cyan" />
              <span className="font-mono text-xs text-muted-foreground">عرض حي</span>
            </div>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan">
                <span className="font-display text-base font-bold text-primary-foreground">و</span>
              </div>
              <span className="font-display text-lg font-bold">
                وطن جو <span className="font-mono text-sm text-muted-foreground">/ Watan Go</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              منصة واحدة للتنقل والتوصيل والتسوق. منظومة رقمية موحدة مصممة للمدن الحديثة.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold">الخدمات</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Car className="h-3.5 w-3.5" /> رحلات</li>
              <li className="flex items-center gap-2"><UtensilsCrossed className="h-3.5 w-3.5" /> توصيل طعام</li>
              <li className="flex items-center gap-2"><Store className="h-3.5 w-3.5" /> متاجر</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
