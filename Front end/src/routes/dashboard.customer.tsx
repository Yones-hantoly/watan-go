import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Car, CheckCircle2, UtensilsCrossed, Store, MapPin, Clock, Navigation } from "lucide-react";
import { getOrders, subscribeToOrders, type Order } from "@/lib/commerce";
import { DELIVERY_STAGES, getOrderDeliveryStage, isFinalDeliveryStage } from "@/lib/delivery-flow";
import {
  getRideOrders,
  subscribeToRideOrders,
  type RideOrder,
  RIDE_STATUS_LABELS,
  RIDE_STATUS_COLORS,
} from "@/lib/ride-orders";
import { cn } from "@/lib/utils";

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
    const unsubscribeOrders = subscribeToOrders(load);
    const unsubscribeRides = subscribeToRideOrders(load);
    return () => {
      unsubscribeOrders();
      unsubscribeRides();
    };
  }, [user.phone]);

  const deliveredOrders = orders.filter(
    (order) => order.status === "completed" || order.status === "delivered",
  );

  return (
    <div className="space-y-8">
      <section>
        <h1 className="font-display text-3xl font-bold">أهلاً، {user.name} 👋</h1>
        <p className="mt-2 text-muted-foreground">ماذا تريد أن تطلب اليوم؟</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <ServiceCard
          to="/restaurants"
          icon={<UtensilsCrossed />}
          title="اطلب طعاماً"
          desc="من مطاعم مدينتك"
          color="text-amber"
        />
        <ServiceCard
          to="/shops"
          icon={<Store />}
          title="تسوّق"
          desc="من المحلات والصيدليات"
          color="text-cyan"
        />
        <ServiceCard
          to="/ride-request"
          icon={<Car />}
          title="احجز رحلة"
          desc="سيارة في دقائق"
          color="text-primary"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <StatCard label="طلبات هذا الشهر" value="١٢" hint="↑ ٣ عن الشهر الماضي" accent="primary" />
        <StatCard label="نقاط المكافآت" value="٤٨٠" hint="رصيد قابل للاستبدال" accent="amber" />
      </section>

      <section className="card-elevated p-6">
        <h2 className="font-display text-xl font-bold">طلباتي</h2>
        {deliveredOrders.length > 0 && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-500">
            تم تسليم طلبك بنجاح 🎉
          </div>
        )}
        <div className="mt-4 divide-y divide-border/40">
          {orders.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">لا توجد طلبات بعد.</div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{o.vendorName}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {o.id} · {o.total} شيكل
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      customerStatusClass(o.status),
                    )}
                  >
                    {customerStatusLabel(o.status)}
                  </span>
                </div>
                <CustomerOrderTracking order={o} />
                {o.status !== "cancelled" && (
                  <div className="mt-3">
                    <Link
                      to="/orders/$id/tracking"
                      params={{ id: o.id }}
                      className="inline-flex rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90"
                    >
                      تتبع الطلب
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Ride orders */}
      <section className="card-elevated p-6">
        <h2 className="font-display text-xl font-bold">رحلاتي</h2>
        <div className="mt-4 divide-y divide-border/40">
          {rideOrders.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">لا توجد رحلات بعد.</div>
          ) : (
            rideOrders.map((r) => (
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
                      {r.price != null && (
                        <span className="font-semibold text-primary">{r.price} شيكل</span>
                      )}
                      {r.driverName && <span>السائق: {r.driverName}</span>}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${RIDE_STATUS_COLORS[r.status]}`}
                  >
                    {RIDE_STATUS_LABELS[r.status]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-2 text-cyan">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-semibold">عنوان التوصيل الرئيسي</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">شارع الجامعة، الطابق الثالث</p>
        </div>
      </section>
    </div>
  );
}

function CustomerOrderTracking({ order }: { order: Order }) {
  if (["cancelled"].includes(order.status)) {
    return (
      <div className="mt-3 rounded-xl border border-border bg-secondary/20 p-3 text-xs font-semibold text-muted-foreground">
        {order.status === "pending" ? "طلب جديد بانتظار المراجعة" : "تم إلغاء الطلب"}
      </div>
    );
  }

  const activeStage = getOrderDeliveryStage(order);
  const activeIndex = DELIVERY_STAGES.findIndex((step) => step.id === activeStage);
  const final = isFinalDeliveryStage(activeStage);

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
      {DELIVERY_STAGES.map((step, index) => {
        const done = activeIndex > index || final;
        const current = activeIndex === index && !final;
        return (
          <div
            key={step.id}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs font-bold transition",
              done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
              current && "border-primary bg-primary text-primary-foreground shadow-sm",
              !done && !current && "border-border bg-secondary/20 text-muted-foreground",
            )}
          >
            <div className="flex items-center gap-1.5">
              {done && <CheckCircle2 className="h-3.5 w-3.5" />}
              <span>{step.label}</span>
            </div>
            {current && <div className="mt-1 text-[11px] font-bold text-cyan">جاري الآن</div>}
          </div>
        );
      })}
    </div>
  );
}

function customerStatusLabel(status: Order["status"]) {
  if (status === "pending") return "بانتظار المراجعة";
  if (status === "accepted") return "تم قبول الطلب";
  if (status === "preparing") return "قيد التجهيز";
  if (status === "ready_for_pickup") return "جاهز للاستلام";
  if (status === "picked_up") return "تم الاستلام";
  if (status === "on_the_way") return "في الطريق";
  if (status === "completed" || status === "delivered") return "تم التسليم";
  return "ملغي";
}

function customerStatusClass(status: Order["status"]) {
  if (status === "pending") return "bg-yellow-500/15 text-yellow-600";
  if (status === "preparing") return "bg-orange-500/15 text-orange-500";
  if (status === "ready_for_pickup" || status === "accepted") return "bg-cyan/15 text-cyan";
  if (status === "picked_up" || status === "on_the_way") return "bg-purple-500/15 text-purple-500";
  if (status === "completed" || status === "delivered") return "bg-emerald-500/15 text-emerald-500";
  return "bg-destructive/15 text-destructive";
}

function ServiceCard({
  to,
  icon,
  title,
  desc,
  color,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link
      to={to}
      className="card-elevated group flex cursor-pointer items-center gap-4 p-5 text-right transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-secondary ${color}`}
      >
        {icon}
      </div>
      <div>
        <div className="font-display font-bold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}
