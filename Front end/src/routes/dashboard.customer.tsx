import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Car, UtensilsCrossed, Store, MapPin, Clock, Navigation } from "lucide-react";
import { getOrders, type Order } from "@/lib/commerce";
import { getRideOrders, subscribeToRideOrders, type RideOrder, RIDE_STATUS_LABELS, RIDE_STATUS_COLORS } from "@/lib/ride-orders";

export const Route = createFileRoute("/dashboard/customer")({
  component: () => (
    <DashboardShell expectedRole="customer">
      {(user) => <CustomerDashboard user={user} />}
    </DashboardShell>
  ),
});

function CustomerDashboard({ user }: { user: { name: string; phone: string } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [rideOrders, setRideOrders] = useState<RideOrder[]>([]);

  useEffect(() => {
    const load = () => {
      setOrders(getOrders().filter((o) => o.user.phone === user.phone));
      setRideOrders(getRideOrders().filter((o) => o.user.phone === user.phone));
    };
    load();
    return subscribeToRideOrders(load);
  }, [user.phone]);

  return (
        <div className="space-y-8">
          <section>
            <h1 className="font-display text-3xl font-bold">أهلاً، {user.name} 👋</h1>
            <p className="mt-2 text-muted-foreground">ماذا تريد أن تطلب اليوم؟</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <ServiceCard to="/restaurants" icon={<UtensilsCrossed />} title="اطلب طعاماً" desc="من مطاعم مدينتك" color="text-amber" />
            <ServiceCard to="/shops" icon={<Store />} title="تسوّق" desc="من المحلات والصيدليات" color="text-cyan" />
            <ServiceCard to="/ride-request" icon={<Car />} title="احجز رحلة" desc="سيارة في دقائق" color="text-primary" />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <StatCard label="طلبات هذا الشهر" value="١٢" hint="↑ ٣ عن الشهر الماضي" accent="primary" />
            <StatCard label="نقاط المكافآت" value="٤٨٠" hint="رصيد قابل للاستبدال" accent="amber" />
          </section>

          <section className="card-elevated p-6">
            <h2 className="font-display text-xl font-bold">طلباتي</h2>
            <div className="mt-4 divide-y divide-border/40">
              {orders.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">لا توجد طلبات بعد.</div>
              ) : orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{o.vendorName}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {o.id} · {o.total} شيكل
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{o.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Ride orders */}
          <section className="card-elevated p-6">
            <h2 className="font-display text-xl font-bold">رحلاتي</h2>
            <div className="mt-4 divide-y divide-border/40">
              {rideOrders.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">لا توجد رحلات بعد.</div>
              ) : rideOrders.map((r) => (
                <div key={r.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <Navigation className="h-3.5 w-3.5 shrink-0 text-cyan" />
                        <span className="truncate">{r.pickup}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{r.destination}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{r.id}</span>
                        {r.distanceKm != null && <span>{r.distanceKm.toFixed(1)} كم</span>}
                        {r.price != null && <span className="font-semibold text-primary">{r.price} شيكل</span>}
                        {r.driverName && <span>السائق: {r.driverName}</span>}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${RIDE_STATUS_COLORS[r.status]}`}>
                      {RIDE_STATUS_LABELS[r.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-cyan"><MapPin className="h-4 w-4" /><span className="text-sm font-semibold">عنوان التوصيل الرئيسي</span></div>
              <p className="mt-2 text-sm text-muted-foreground">شارع الجامعة، الطابق الثالث</p>
            </div>
          </section>
        </div>
  );
}

function ServiceCard({ to, icon, title, desc, color }: { to: string; icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <Link to={to} className="card-elevated group flex cursor-pointer items-center gap-4 p-5 text-right transition-transform duration-200 hover:-translate-y-0.5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${color}`}>{icon}</div>
      <div>
        <div className="font-display font-bold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}
