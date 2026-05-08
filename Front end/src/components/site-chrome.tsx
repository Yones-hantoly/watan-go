import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Car, UtensilsCrossed, Store } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAuth, getDashboardNavLinks, type AuthUser } from "@/lib/auth";

export function Header() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getAuth());
  }, []);

  const publicLinks = [
    { to: "/", label: "الرئيسية" },
    { to: "/architecture", label: "النظام" },
    { to: "/contact", label: "تواصل" },
    { to: "/login", label: "دخول" },
    { to: "/register", label: "تسجيل" },
  ] as const;

  const authenticatedLinks = user
    ? [
        { to: "/", label: "الرئيسية" },
        { to: user.role === "admin" ? "/dashboard/admin" : `/dashboard/${user.role === "customer" ? "customer" : user.role}`, label: "لوحتي" },
        ...getDashboardNavLinks(user.role),
      ]
    : publicLinks;

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
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 md:flex">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-cyan" />
            <span className="font-mono text-xs text-muted-foreground">{user ? "وضع مستخدم" : "عرض حي"}</span>
          </div>
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
