import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Users, Car, Store, UtensilsCrossed, ShieldCheck, Activity, MapPin, Navigation, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import {
  getRideOrders, subscribeToRideOrders, updateRideStatus, assignDriver,
  type RideOrder, RIDE_STATUS_LABELS, RIDE_STATUS_COLORS, type RideStatus,
} from "@/lib/ride-orders";

export const Route = createFileRoute("/dashboard/admin")({
  component: () => (
    <DashboardShell expectedRole="admin">
      {(user) => <AdminDashboard user={user} />}
    </DashboardShell>
  ),
});

const MOCK_DRIVERS = [
  { name: "أحمد سالم",   phone: "0591111111" },
  { name: "محمد خالد",  phone: "0592222222" },
  { name: "يوسف علي",    phone: "0593333333" },
];

const ALL_STATUSES: RideStatus[] = ["pending","accepted","driver_assigned","on_the_way","completed","cancelled"];

function AdminDashboard({ user }: { user: { name: string } }) {
  const [rideOrders, setRideOrders] = useState<RideOrder[]>([]);
  const [assignTarget, setAssignTarget] = useState<string | null>(null);

  useEffect(() => {
    const load = () => setRideOrders(getRideOrders());
    load();
    return subscribeToRideOrders(load);
  }, []);

  const handleStatus = (id: string, status: RideStatus) => {
    updateRideStatus(id, status);
    toast.success(`تم تحديث حالة الرحلة إلى ${RIDE_STATUS_LABELS[status]}`);
  };

  const handleAssign = (orderId: string, driverName: string, driverPhone: string) => {
    assignDriver(orderId, driverName, driverPhone);
    setAssignTarget(null);
    toast.success(`تم تعيين السائق ${driverName}`);
  };

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">لوحة الإدارة 🛡️</h1>
          <p className="mt-2 text-muted-foreground">{user.name} · إشراف كامل على منظومة وطن جو</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 sm:flex">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs font-semibold text-primary">جميع الأنظمة تعمل</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="إجمالي المستخدمين" value="١٢،٤٨٠" accent="primary" />
        <StatCard label="السائقون النشطون" value="٣٤٢" accent="cyan" />
        <StatCard label="التجار" value="٥٨٧" accent="amber" />
        <StatCard label="رحلات اليوم" value={String(rideOrders.filter(r => r.createdAt.startsWith(new Date().toISOString().slice(0,10))).length)} accent="primary" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Users className="h-5 w-5" />, label: "إدارة المستخدمين", color: "text-primary" },
          { icon: <Car className="h-5 w-5" />, label: "إدارة السائقين", color: "text-cyan" },
          { icon: <UtensilsCrossed className="h-5 w-5" />, label: "إدارة المطاعم", color: "text-amber" },
          { icon: <Store className="h-5 w-5" />, label: "إدارة المتاجر", color: "text-cyan" },
        ].map((m) => (
          <button key={m.label} className="card-elevated flex items-center gap-3 p-5 text-right">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-secondary ${m.color}`}>{m.icon}</div>
            <span className="font-display font-bold">{m.label}</span>
          </button>
        ))}
      </section>

      {/* ── Ride Orders ── */}
      <section className="card-elevated p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-bold">طلبات الرحلات</h2>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {rideOrders.filter(r => r.status === "pending").length} قيد الانتظار
          </span>
        </div>

        {rideOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد طلبات رحلات حتى الآن.</p>
        ) : (
          <div className="space-y-4">
            {rideOrders.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-secondary/20 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono font-semibold">{r.id}</span>
                      <span>·</span>
                      <span>{r.user.name} ({r.user.phone})</span>
                      <span>·</span>
                      <span>{new Date(r.createdAt).toLocaleString("ar-SA")}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Navigation className="h-3.5 w-3.5 shrink-0 text-cyan" />
                      <span className="font-medium">{r.pickup}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="font-medium">{r.destination}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {r.distanceKm != null && <span>{r.distanceKm.toFixed(1)} كم</span>}
                      {r.durationLabel && <span>{r.durationLabel}</span>}
                      {r.price != null && <span className="font-semibold text-primary">{r.price} شيكل</span>}
                      {r.driverName && <span className="text-cyan">سائق: {r.driverName}</span>}
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${RIDE_STATUS_COLORS[r.status]}`}>
                    {RIDE_STATUS_LABELS[r.status]}
                  </span>
                </div>

                {/* Controls */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* Status transitions */}
                  {ALL_STATUSES.filter(s => s !== r.status && s !== "pending").map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatus(r.id, s)}
                      className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
                    >
                      {RIDE_STATUS_LABELS[s]}
                    </button>
                  ))}

                  {/* Assign driver */}
                  {r.status !== "completed" && r.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => setAssignTarget(assignTarget === r.id ? null : r.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs font-semibold text-cyan transition-colors hover:bg-cyan/20"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> تعيين سائق
                    </button>
                  )}

                  {/* Cancel */}
                  {r.status !== "completed" && r.status !== "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleStatus(r.id, "cancelled")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20"
                    >
                      <X className="h-3.5 w-3.5" /> إلغاء
                    </button>
                  )}
                </div>

                {/* Driver assignment dropdown */}
                {assignTarget === r.id && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MOCK_DRIVERS.map(d => (
                      <button
                        key={d.phone}
                        type="button"
                        onClick={() => handleAssign(r.id, d.name, d.phone)}
                        className="rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
                      >
                        {d.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-cyan" /><h2 className="font-display text-lg font-bold">نشاط مباشر</h2></div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• ٤٢ رحلة قيد التنفيذ</li>
            <li>• ٨٧ طلب طعام نشط</li>
            <li>• ١٢٤ طلب توصيل من المتاجر</li>
            <li>• ٣ تذاكر دعم مفتوحة</li>
          </ul>
        </div>
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-bold">تنبيهات الأمان</h2></div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between"><span>محاولات دخول مشبوهة</span><span className="font-mono text-xs font-bold text-amber">٢</span></li>
            <li className="flex items-center justify-between"><span>حسابات بانتظار التوثيق</span><span className="font-mono text-xs font-bold text-cyan">٥</span></li>
            <li className="flex items-center justify-between"><span>بلاغات نشطة</span><span className="font-mono text-xs font-bold text-primary">١</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
