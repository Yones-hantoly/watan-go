import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: "primary" | "cyan" | "amber";
  onClick: () => void;
}

export function StatsCard({ title, value, hint, icon: Icon, tone, onClick }: StatsCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/85 p-5 text-right shadow-[0_18px_60px_-35px_rgba(0,0,0,0.9)] backdrop-blur transition hover:border-primary/40"
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          tone === "primary" && "bg-primary",
          tone === "cyan" && "bg-cyan",
          tone === "amber" && "bg-amber",
        )}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              "mt-2 font-display text-3xl font-bold",
              tone === "primary" && "text-primary",
              tone === "cyan" && "text-cyan",
              tone === "amber" && "text-amber",
            )}
          >
            {value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border",
            tone === "primary" && "border-primary/30 bg-primary/15 text-primary",
            tone === "cyan" && "border-cyan/30 bg-cyan/15 text-cyan",
            tone === "amber" && "border-amber/30 bg-amber/15 text-amber",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.button>
  );
}
