import { type ReactNode, useState } from "react";
import { Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type DailyDriverEarnings } from "@/lib/driver-earnings";
import {
  type ActivityEvent,
  type DriverRating,
  type DriverStatus,
  type Trip,
} from "@/lib/driver-mock-data";

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function DetailsDrawer({ isOpen, onClose, title, children }: DetailsDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />
      <motion.aside
        dir="rtl"
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 220 }}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-surface shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-5 py-4 backdrop-blur-xl">
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-border bg-secondary/50 p-2 text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </motion.aside>
    </>
  );
}

export function TripsDetails({ trips }: { trips: Trip[] }) {
  const completedCount = trips.filter((trip) => trip.status === "completed").length;
  const cancelledCount = trips.filter((trip) => trip.status === "cancelled").length;
  const activeCount = trips.filter((trip) => trip.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <Metric label="مكتملة" value={completedCount} tone="cyan" />
        <Metric label="ملغاة" value={cancelledCount} tone="red" />
        <Metric label="نشطة" value={activeCount} tone="primary" />
      </div>

      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold">آخر الرحلات</h3>
        {trips.map((trip) => (
          <div key={trip.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="font-bold text-cyan">{trip.pickupLocation}</p>
                <p className="text-sm text-muted-foreground">إلى {trip.deliveryLocation}</p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{trip.distance} كم</span>
                  <span>{trip.duration} دقيقة</span>
                  <span>{trip.amount} شيكل</span>
                </div>
              </div>
              <StatusPill status={trip.status} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export function EarningsDetails({ earnings }: { earnings: DailyDriverEarnings }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">تفاصيل أرباح اليوم</h2>
        <p className="mt-1 text-sm text-muted-foreground">محسوبة من الرحلات والطلبات المكتملة اليوم لهذا السائق.</p>
      </div>

      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-cyan/10 p-5">
        <p className="text-sm text-muted-foreground">إجمالي أرباح اليوم</p>
        <p className="mt-2 font-display text-4xl font-bold text-primary">{earnings.totalEarnings.toFixed(0)} شيكل</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="عدد الطلبات المكتملة" value={earnings.completedCount} tone="cyan" />
        <Metric label="إجمالي أرباح اليوم" value={`${earnings.totalEarnings.toFixed(0)} شيكل`} tone="primary" />
      </div>

      {earnings.items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-secondary/20 p-5 text-sm text-muted-foreground">لا توجد أرباح اليوم.</div>
      ) : (
        <div className="space-y-3">
          {earnings.items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="rounded-2xl border border-border bg-secondary/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-cyan">{item.id}</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {item.type === "ride" ? "رحلة" : "توصيل"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{item.pickup}</p>
                  <p className="text-sm text-muted-foreground">إلى {item.destination}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.completedAt).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="font-display text-xl font-bold text-primary">{item.fare.toFixed(0)} شيكل</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RatingDetails({ ratings, averageRating }: { ratings: DriverRating[]; averageRating: number }) {
  const [filter, setFilter] = useState<"all" | "5" | "4" | "below">("all");
  const filtered = ratings.filter((item) => {
    if (filter === "5") return item.rating === 5;
    if (filter === "4") return item.rating === 4;
    if (filter === "below") return item.rating < 4;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber/30 bg-gradient-to-br from-amber/20 to-primary/10 p-5 text-center">
        <p className="text-sm text-muted-foreground">متوسط التقييم</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="font-display text-4xl font-bold text-amber">{averageRating.toFixed(1)}</span>
          <Star className="h-8 w-8 fill-amber text-amber" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{ratings.length} تقييم من العملاء</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          ["5", "5 نجوم"],
          ["4", "4 نجوم"],
          ["below", "أقل من 4"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value as "5" | "4" | "below")}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-bold transition",
              filter === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary/30 hover:border-primary/50",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.customerName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleDateString("ar", { dateStyle: "medium" })}
                </p>
              </div>
              <span className="whitespace-nowrap font-bold text-amber">{item.rating} نجوم</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkingHoursDetails({
  startTime,
  endTime,
  breakTime,
  status,
  activity,
}: {
  startTime: Date;
  endTime?: Date;
  breakTime: number;
  status: DriverStatus;
  activity: ActivityEvent[];
}) {
  const now = endTime ?? new Date();
  const workingMinutes = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / 60000) - breakTime);
  const totalHours = `${Math.floor(workingMinutes / 60)}س ${workingMinutes % 60}د`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/20 to-primary/10 p-5">
        <p className="text-sm text-muted-foreground">حالة السائق الحالية</p>
        <div className="mt-3 flex items-center gap-3">
          <span
            className={cn(
              "h-3 w-3 animate-pulse rounded-full",
              status === "online" ? "bg-cyan" : status === "busy" ? "bg-amber" : "bg-muted-foreground",
            )}
          />
          <span className="font-display text-xl font-bold">
            {status === "online" ? "متصل" : status === "busy" ? "مشغول" : "غير متصل"}
          </span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="بداية المناوبة" value={formatTime(startTime)} tone="cyan" />
        <Metric label="نهاية المناوبة" value={endTime ? formatTime(endTime) : "مستمرة"} tone="primary" />
        <Metric label="إجمالي ساعات العمل" value={totalHours} tone="amber" />
        <Metric label="وقت الاستراحة" value={`${breakTime} دقيقة`} tone="primary" />
      </div>
      <section className="space-y-3">
        <h3 className="font-display text-lg font-bold">نشاط اليوم</h3>
        {activity.map((event, index) => (
          <div key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("mt-1 h-3 w-3 rounded-full", toneClass(event.tone))} />
              {index < activity.length - 1 && <span className="h-12 w-px bg-border" />}
            </div>
            <div>
              <p className="font-bold">{event.label}</p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone: "primary" | "cyan" | "amber" | "red" }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/25 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-2xl font-bold",
          tone === "primary" && "text-primary",
          tone === "cyan" && "text-cyan",
          tone === "amber" && "text-amber",
          tone === "red" && "text-red-400",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status: Trip["status"] }) {
  return (
    <span
      className={cn(
        "w-fit rounded-lg px-3 py-1 text-xs font-bold",
        status === "completed" && "bg-cyan/15 text-cyan",
        status === "cancelled" && "bg-red-500/15 text-red-400",
        status === "active" && "bg-primary/15 text-primary",
      )}
    >
      {status === "completed" ? "مكتملة" : status === "cancelled" ? "ملغاة" : "نشطة"}
    </span>
  );
}

function toneClass(tone: ActivityEvent["tone"]) {
  if (tone === "cyan") return "bg-cyan";
  if (tone === "amber") return "bg-amber";
  return "bg-primary";
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
}
