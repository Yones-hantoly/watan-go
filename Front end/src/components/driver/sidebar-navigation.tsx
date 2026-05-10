import {
  BarChart3,
  Home,
  Map,
  PackageCheck,
  Settings,
  Star,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DriverView = "dashboard" | "orders" | "delivery" | "earnings" | "ratings" | "settings";

const navItems: { id: DriverView; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "الرئيسية", icon: Home },
  { id: "orders",    label: "الطلبات",  icon: PackageCheck },
  { id: "delivery",  label: "التوصيل",  icon: Map },
  { id: "earnings",  label: "الأرباح",   icon: WalletCards },
  { id: "ratings",   label: "التقييمات", icon: Star },
  { id: "settings",  label: "الإعدادات", icon: Settings },
];

interface SidebarNavigationProps {
  activeView: DriverView;
  onChange: (view: DriverView) => void;
}

export function SidebarNavigation({ activeView, onChange }: SidebarNavigationProps) {
  return (
    <aside className="border-b border-white/10 bg-background/60 px-3 py-3 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-l lg:px-4 lg:py-5">
      <div className="mb-5 hidden items-center gap-3 lg:flex">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan font-display font-bold text-primary-foreground">
          و
        </div>
        <div>
          <p className="font-display text-lg font-bold">وطن جو</p>
          <p className="text-xs text-muted-foreground">لوحة السائق</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex min-w-fit items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition lg:w-full",
                active
                  ? "border-primary/40 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "border-transparent bg-secondary/25 text-muted-foreground hover:border-cyan/30 hover:bg-secondary/50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 hidden rounded-2xl border border-cyan/20 bg-cyan/10 p-4 lg:block">
        <div className="flex items-center gap-2 text-cyan">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm font-bold">أداء اليوم</span>
        </div>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">نسبة قبول الطلبات 92%، ومتوسط الوصول أقل من 22 دقيقة.</p>
      </div>
    </aside>
  );
}
