import { LogOut, Moon, Sun } from "lucide-react";
import { type AuthUser } from "@/lib/auth";
import { type DriverStatus } from "@/lib/driver-mock-data";
import { cn } from "@/lib/utils";

interface DriverHeaderProps {
  user: AuthUser;
  status: DriverStatus;
  isDark: boolean;
  onLogout: () => void;
  onToggleTheme: () => void;
}

export function DriverHeader({ user, status, isDark, onLogout, onToggleTheme }: DriverHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan font-display text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20">
            {user.name.charAt(0)}
            <span className={cn("absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-background", statusColor(status))} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">أهلا بك في Watan Go</p>
            <h1 className="font-display text-xl font-bold sm:text-2xl">مرحبا، {user.name}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-cyan/25 bg-cyan/10 px-3 py-2 text-sm font-bold text-cyan">
            {status === "online" ? "متصل وجاهز" : status === "busy" ? "مشغول الآن" : "غير متصل"}
          </span>
          <button
            onClick={onToggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary/50 text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            aria-label="تبديل الوضع الداكن"
          >
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-2 text-sm font-bold text-muted-foreground transition hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}

function statusColor(status: DriverStatus) {
  if (status === "online") return "bg-cyan";
  if (status === "busy") return "bg-amber";
  return "bg-muted-foreground";
}
