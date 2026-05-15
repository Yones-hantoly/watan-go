import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Clock3, ListChecks, PackageCheck, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { type AuthUser } from "@/lib/auth";
import { getOrders, subscribeToOrders, updateDriverStatus, updateOrderStatus, type Order as CommerceOrder } from "@/lib/commerce";
import { advanceOrderDeliveryStage, getOrderDeliveryStage, isFinalDeliveryStage, setOrderDeliveryStage } from "@/lib/delivery-flow";
import { getDailyDriverEarnings, type DailyDriverEarnings } from "@/lib/driver-earnings";
import { getDriverNotifications, type DriverNotification } from "@/lib/driver-notifications";
import { getDriverStatus, subscribeToDriverStatus, updateDriverAvailabilityStatus } from "@/lib/driver-status";
import { deriveDriverStats, type DriverStats, type DriverWorkSession } from "@/lib/driver-stats";
import {
  acceptRideOrder, getRideOrders, subscribeToRideOrders, updateRideStatus,
  type RideOrder, RIDE_STATUS_LABELS, RIDE_STATUS_COLORS,
} from "@/lib/ride-orders";
import {
  mockActivity,
  mockOrders,
  mockRatings,
  mockTrips,
  type DriverStatus,
  type Order,
} from "@/lib/driver-mock-data";
import { DeliverySection } from "@/components/driver/delivery-section";
import { type TrackingOrder } from "@/components/driver/LiveTrackingMap";
import {
  DetailsDrawer,
  EarningsDetails,
  RatingDetails,
  TripsDetails,
  WorkingHoursDetails,
} from "@/components/driver/details-drawer";
import { DriverHeader } from "@/components/driver/driver-header";
import { OrderDetails, OrdersSection } from "@/components/driver/orders-section";
import { SidebarNavigation, type DriverView } from "@/components/driver/sidebar-navigation";
import { StatsCard } from "@/components/driver/stats-card";

interface DriverDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

type DrawerKind = "trips" | "earnings" | "rating" | "hours" | "order" | null;

const isCompletedCommerceOrder = (order: CommerceOrder) => order.status === "completed" || order.status === "delivered";
const isReadyForDriverPickup = (order: CommerceOrder) => order.status === "ready_for_pickup" && order.driverStatus === "pending";

export function DriverDashboard({ user, onLogout }: DriverDashboardProps) {
  const [activeView, setActiveView] = useState<DriverView>("dashboard");
  const [driverStatus, setDriverStatus] = useState<DriverStatus>(() => getDriverStatus(user.phone));
  const [orders, setOrders] = useState(mockOrders);
  const [deliveryOrders, setDeliveryOrders] = useState<CommerceOrder[]>(() =>
    getOrders().filter(isReadyForDriverPickup),
  );
  const [allDeliveryOrders, setAllDeliveryOrders] = useState<CommerceOrder[]>(() => getOrders());
  const [rideOrders, setRideOrders] = useState<RideOrder[]>([]);
  const [allRideOrders, setAllRideOrders] = useState<RideOrder[]>([]);
  const [notifications, setNotifications] = useState<DriverNotification[]>([]);
  const [isDriverDataLoading, setIsDriverDataLoading] = useState(true);
  const [workSession] = useState<DriverWorkSession>(() => createTodayWorkSession());
  const [statsClock, setStatsClock] = useState(() => new Date());
  const [activeTracking, setActiveTracking] = useState<TrackingOrder | null>(null);
  const [lastDriverCoords, setLastDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return !document.documentElement.classList.contains("light");
  });

  useEffect(() => {
    const load = () => {
      const nextRideOrders = getRideOrders();
      setAllRideOrders(nextRideOrders);
      setRideOrders(
        nextRideOrders.filter(
          (o) => o.status === "pending" || o.status === "accepted" || o.status === "driver_assigned" || o.status === "on_the_way",
        ),
      );
      setIsDriverDataLoading(false);
    };
    load();
    return subscribeToRideOrders(load);
  }, []);

  useEffect(() => {
    const load = () => {
      const nextOrders = getOrders();
      setAllDeliveryOrders(nextOrders);
      setDeliveryOrders(nextOrders.filter(isReadyForDriverPickup));
    };
    load();
    return subscribeToOrders(load);
  }, []);

  useEffect(() => {
    const load = () => setDriverStatus(getDriverStatus(user.phone));
    load();
    return subscribeToDriverStatus(load);
  }, [user.phone]);

  useEffect(() => {
    let isCurrent = true;

    async function loadNotifications() {
      const data = await getDriverNotifications({ phone: user.phone }, {
        rides: allRideOrders,
        orders: allDeliveryOrders,
      });
      if (isCurrent) setNotifications(data);
    }

    void loadNotifications();

    return () => {
      isCurrent = false;
    };
  }, [allDeliveryOrders, allRideOrders, user.phone]);

  useEffect(() => {
    const timer = window.setInterval(() => setStatsClock(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const driverStats = useMemo(
    () =>
      deriveDriverStats({
        rides: allRideOrders,
        commerceOrders: allDeliveryOrders,
        driverOrders: orders,
        ratings: mockRatings,
        workSession,
        now: statsClock,
      }),
    [allDeliveryOrders, allRideOrders, orders, workSession, statsClock],
  );
  const dailyEarnings = useMemo(
    () =>
      getDailyDriverEarnings({
        driverPhone: user.phone,
        rides: allRideOrders,
        orders: allDeliveryOrders,
        now: statsClock,
      }),
    [allDeliveryOrders, allRideOrders, statsClock, user.phone],
  );
  const activeOrder    = useMemo(() => orders.find((o) => o.status === "active"), [orders]);
  const activeCommerceOrder = useMemo(
    () => allDeliveryOrders.find((order) => order.id === activeTracking?.id) ?? null,
    [activeTracking?.id, allDeliveryOrders],
  );
  const activeDeliveryStage = activeCommerceOrder ? getOrderDeliveryStage(activeCommerceOrder) : null;

  const openOrder = (order: Order) => { setSelectedOrder(order); setDrawer("order"); };

  const updateOrder = (orderId: string, status: Order["status"], message: string) => {
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status } : o)));
    toast.success(message);
  };

  const updateDeliveryOrder = (orderId: string, ds: CommerceOrder["driverStatus"], message: string) => {
    updateDriverStatus(orderId, ds, user);
    if (ds === "picked_up") updateOrderStatus(orderId, "picked_up");
    if (ds === "on_the_way") updateOrderStatus(orderId, "on_the_way");
    if (ds === "completed" || ds === "delivered") updateOrderStatus(orderId, "completed");
    toast.success(message);
  };

  const handleDriverStatusChange = (status: DriverStatus) => {
    setDriverStatus(status);
    updateDriverAvailabilityStatus(user.phone, status);
  };

  // ── Accept handlers — each sets activeTracking and navigates to delivery ──

  const handleAcceptRide = (id: string) => {
    if (driverStatus === "busy") {
      toast.error("أنت مشغول حالياً ولا تستطيع قبول الرحلة.");
      return;
    }

    if (driverStatus === "offline") {
      toast.error("أنت غير متصل ولا تستطيع قبول الرحلة.");
      return;
    }

    const result = acceptRideOrder({
      rideId: id,
      driver: user,
      driverStatus,
    });

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success("تم قبول الرحلة بنجاح.");
    setActiveTracking({
      id: result.ride.id,
      kind: "ride",
      customerName: result.ride.user.name,
      pickup: result.ride.pickup,
      pickupCoords: result.ride.pickupCoords,
      destination: result.ride.destination,
      destinationCoords: result.ride.destinationCoords,
      price: result.ride.price,
    });
    setActiveView("delivery");
  };

  const handleAcceptDelivery = (orderId: string) => {
    if (driverStatus === "busy") {
      toast.error("أنت مشغول حالياً ولا تستطيع قبول الرحلة.");
      return;
    }

    if (driverStatus === "offline") {
      toast.error("أنت غير متصل ولا تستطيع قبول الرحلة.");
      return;
    }

    updateDeliveryOrder(orderId, "picked_up", "تم استلام الطلب بواسطة السائق");
    setOrderDeliveryStage(orderId, "picked_up");
    const o = getOrders().find((x) => x.id === orderId);
    if (o) {
      setActiveTracking({
        id: o.id,
        kind: o.type === "food" ? "food" : "shop",
        customerName: o.user.name,
        pickup: o.vendorName,
        pickupCoords: null,
        destination: o.deliveryAddress,
        destinationCoords: null,
        price: o.total,
      });
      setActiveView("delivery");
    }
  };

  const handleAcceptMockOrder = (orderId: string) => {
    updateOrder(orderId, "active", "تم قبول الطلب");
    const o = orders.find((x) => x.id === orderId);
    if (o) {
      setActiveTracking({
        id: o.id,
        kind: "food",
        customerName: o.customerName,
        pickup: o.pickupLocation,
        pickupCoords: null,
        destination: o.deliveryLocation,
        destinationCoords: null,
        price: o.price,
      });
      setActiveView("delivery");
    }
  };

  const handleRejectRide   = (id: string) => { updateRideStatus(id, "cancelled"); toast.success("تم رفض الرحلة"); };
  const handleCompleteRide = (id: string) => {
    updateRideStatus(id, "completed");
    toast.success("تمت الرحلة بنجاح");
    if (activeTracking?.id === id) setActiveTracking(null);
  };

  const handleCompleteTracking = () => {
    if (activeTracking) {
      const isRide = getRideOrders().some((o) => o.id === activeTracking.id);
      if (isRide) updateRideStatus(activeTracking.id, "completed");
      else setOrderDeliveryStage(activeTracking.id, "completed");
    }
    if (driverStatus !== "online") setActiveTracking(null);
    toast.success("تم إنهاء التوصيل بنجاح");
  };

  const handleAdvanceDeliveryStage = () => {
    if (!activeCommerceOrder) return;
    const updatedOrder = advanceOrderDeliveryStage(activeCommerceOrder.id);
    if (!updatedOrder) return;

    const nextStage = getOrderDeliveryStage(updatedOrder);
    if (isFinalDeliveryStage(nextStage)) {
      if (driverStatus !== "online") setActiveTracking(null);
      toast.success("تم إنهاء التوصيل بنجاح");
      return;
    }

    toast.success("تم تحديث مرحلة التوصيل");
  };

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light");
    document.documentElement.classList.toggle("dark", !document.documentElement.classList.contains("light"));
    setIsDark(!document.documentElement.classList.contains("light"));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarNavigation
          activeView={activeView}
          onChange={(view) => { setActiveView(view); }}
        />
        <div className="min-w-0 flex-1">
          <DriverHeader user={user} status={driverStatus} isDark={isDark} onLogout={onLogout} onToggleTheme={toggleTheme} />
          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
              >
                {activeView === "dashboard" && (
                  <DashboardHome
                    stats={driverStats}
                    dailyEarnings={dailyEarnings}
                    isLoading={isDriverDataLoading}
                    driverStatus={driverStatus}
                    onStatusChange={handleDriverStatusChange}
                    onOpenDrawer={setDrawer}
                    onGoOrders={() => setActiveView("orders")}
                    onGoEarnings={() => setActiveView("earnings")}
                    notifications={notifications}
                    deliveryOrders={deliveryOrders}
                    onAcceptDelivery={handleAcceptDelivery}
                    completedDeliveryOrders={allDeliveryOrders.filter(isCompletedCommerceOrder)}
                    rideOrders={rideOrders}
                    onAcceptRide={handleAcceptRide}
                    onRejectRide={handleRejectRide}
                    onCompleteRide={handleCompleteRide}
                  />
                )}
                {activeView === "orders" && (
                  <OrdersSection
                    orders={orders}
                    onAccept={handleAcceptMockOrder}
                    onReject={(id) => updateOrder(id, "cancelled", "تم رفض الطلب")}
                    onStart={(id) => updateOrder(id, "active", "بدأت رحلة التوصيل")}
                    onComplete={(id) => updateOrder(id, "completed", "تم إكمال الطلب بنجاح")}
                    onViewDetails={openOrder}
                  />
                )}
                {activeView === "delivery" && (
                  <DeliverySection
                    currentOrder={activeOrder}
                    driverStatus={driverStatus}
                    onStatusChange={handleDriverStatusChange}
                    activeTracking={activeTracking}
                    activeDeliveryStage={activeDeliveryStage}
                    lastDriverCoords={lastDriverCoords}
                    onAdvanceDeliveryStage={handleAdvanceDeliveryStage}
                    onCompleteTracking={handleCompleteTracking}
                    onDriverLocationChange={setLastDriverCoords}
                  />
                )}
                {activeView === "earnings" && <EarningsDetails earnings={dailyEarnings} />}
                {activeView === "ratings"  && <RatingDetails ratings={mockRatings} averageRating={driverStats.averageRecentRating} />}
                {activeView === "settings" && <SettingsPanel />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <DetailsDrawer isOpen={drawer !== null} onClose={() => setDrawer(null)} title={drawerTitle(drawer)}>
        {drawer === "trips"    && <TripsDetails trips={mockTrips} />}
        {drawer === "earnings" && <EarningsDetails earnings={dailyEarnings} />}
        {drawer === "rating"   && <RatingDetails ratings={mockRatings} averageRating={driverStats.averageRecentRating} />}
        {drawer === "hours"    && <WorkingHoursDetails startTime={new Date(workSession.startedAt)} breakTime={driverStats.breakMinutes} status={driverStatus} activity={mockActivity} />}
        {drawer === "order"    && selectedOrder && <OrderDetails order={selectedOrder} />}
      </DetailsDrawer>
    </div>
  );
}

function createTodayWorkSession(): DriverWorkSession {
  const start = new Date();
  start.setHours(8, 0, 0, 0);

  const breakStart = new Date(start);
  breakStart.setHours(10, 0, 0, 0);

  return {
    startedAt: start.toISOString(),
    breaks: [
      {
        id: "morning-break",
        startedAt: breakStart.toISOString(),
        minutes: 25,
      },
    ],
  };
}

// ── DashboardHome ─────────────────────────────────────────────────────────────

function DashboardHome({
  stats, dailyEarnings, isLoading, driverStatus, onStatusChange,
  onOpenDrawer, onGoOrders, onGoEarnings,
  notifications,
  deliveryOrders, completedDeliveryOrders, onAcceptDelivery,
  rideOrders, onAcceptRide, onRejectRide, onCompleteRide,
}: {
  stats: DriverStats;
  dailyEarnings: DailyDriverEarnings;
  isLoading: boolean;
  driverStatus: DriverStatus;
  onStatusChange: (status: DriverStatus) => void;
  onOpenDrawer: (d: DrawerKind) => void;
  onGoOrders: () => void;
  onGoEarnings: () => void;
  notifications: DriverNotification[];
  deliveryOrders: CommerceOrder[];
  completedDeliveryOrders: CommerceOrder[];
  onAcceptDelivery: (id: string) => void;
  rideOrders: RideOrder[];
  onAcceptRide: (id: string) => void;
  onRejectRide: (id: string) => void;
  onCompleteRide: (id: string) => void;
}) {
  const hasIncomingOrders = rideOrders.length > 0 || deliveryOrders.length > 0;
  const tripsHint = stats.hasActiveRide ? "مع رحلة نشطة الآن" : hasIncomingOrders ? "لا توجد رحلة نشطة الآن" : "لا توجد طلبات متاحة الآن";
  const earningsHint = dailyEarnings.completedCount > 0 ? "من الطلبات والرحلات المكتملة" : "لا توجد أرباح اليوم";
  const ratingValue = stats.recentRatingsCount > 0 ? stats.averageRecentRating.toFixed(1) : "لا يوجد";
  const ratingHint = stats.recentRatingsCount > 0 ? `${stats.recentRatingsCount} تقييم حديث` : "لا توجد تقييمات حديثة";
  const hoursHint = stats.breakMinutes > 0 ? `تشمل ${stats.breakMinutes} دقيقة استراحة` : "لا توجد استراحات مسجلة";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.16),transparent_34%),linear-gradient(135deg,rgba(19,36,59,0.96),rgba(10,20,34,0.96))] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-cyan">لوحة السائق المباشرة</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">جاهز لاستلام طلبات اليوم؟</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">تابع الرحلات والأرباح والتقييمات داخل تجربة عربية RTL مصممة لسائق يعمل بسرعة ووضوح.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={onGoOrders} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">عرض الطلبات</button>
              <button onClick={() => onOpenDrawer("hours")} className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm font-bold text-cyan transition hover:border-cyan/60">حالة المناوبة</button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/45 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">حالة العمل</span>
              <span className="rounded-full bg-cyan/15 px-3 py-1 text-xs font-bold text-cyan">
                {driverStatus === "online" ? "متصل" : driverStatus === "busy" ? "مشغول" : "غير متصل"}
              </span>
            </div>
            <DriverStatusSelector status={driverStatus} onChange={onStatusChange} />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniDashboardMetric label="طلبات رحلات" value={String(rideOrders.length)} />
              <MiniDashboardMetric label="توصيل نشط"   value={String(deliveryOrders.length)} />
              <MiniDashboardMetric label="تنبيهات"      value={notifications.length.toString()} />
              <MiniDashboardMetric label="قبول الطلبات" value="92%" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="رحلات اليوم" value={`${stats.todayTripsCount}`} hint={tripsHint} icon={ListChecks} tone="cyan" onClick={() => onOpenDrawer("trips")} isLoading={isLoading} />
        <StatsCard title="أرباح اليوم" value={`${dailyEarnings.totalEarnings.toFixed(0)} شيكل`} hint={earningsHint} icon={Banknote} tone="amber" onClick={onGoEarnings} isLoading={isLoading} />
        <StatsCard title="التقييم" value={ratingValue} hint={ratingHint} icon={Star} tone="cyan" onClick={() => onOpenDrawer("rating")} isLoading={isLoading} />
        <StatsCard title="ساعات العمل" value={stats.activeWorkingHours.toFixed(1)} hint={hoursHint} icon={Clock3} tone="primary" onClick={() => onOpenDrawer("hours")} isLoading={isLoading} />
      </section>

      {/* ── Ride requests ── */}
      <section className="rounded-2xl border border-white/10 bg-surface/85 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">طلبات رحلات جديدة</h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{rideOrders.length}</span>
        </div>
        <div className="space-y-3">
          {rideOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات رحلات حالياً.</div>
          ) : rideOrders.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-secondary/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="text-xs text-muted-foreground">{r.user.name} · {r.id}</div>
                  <div className="text-sm font-semibold">{r.pickup} ← {r.destination}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {r.distanceKm != null && <span>{r.distanceKm.toFixed(1)} كم</span>}
                    {r.durationLabel && <span>{r.durationLabel}</span>}
                    {r.price != null && <span className="font-bold text-primary">{r.price} شيكل</span>}
                  </div>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${RIDE_STATUS_COLORS[r.status]}`}>
                  {RIDE_STATUS_LABELS[r.status]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status === "pending" && (
                  <>
                    <button onClick={() => onAcceptRide(r.id)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">قبول والتوجه</button>
                    <button onClick={() => onRejectRide(r.id)} className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive">رفض</button>
                  </>
                )}
                {(r.status === "accepted" || r.status === "driver_assigned" || r.status === "on_the_way") && (
                  <button onClick={() => onCompleteRide(r.id)} className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500">إتمام الرحلة</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-white/10 bg-surface/85 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold">تنبيهات اليوم</h3>
          </div>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="rounded-xl border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">{notification.message}</div>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">لا توجد تنبيهات اليوم.</div>
            )}
          </div>
        </div>
      </section>

      {/* ── Delivery tasks ── */}
      <section className="rounded-2xl border border-white/10 bg-surface/85 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">طلبات جاهزة للاستلام</h3>
          <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-bold text-cyan">{deliveryOrders.length}</span>
        </div>
        <div className="space-y-3">
          {deliveryOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد مهام توصيل حالية.</div>
          ) : deliveryOrders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{order.vendorName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{order.deliveryAddress} · {order.total} شيكل · {order.id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAcceptDelivery(order.id)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">استلام الطلب</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface/85 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">الطلبات المكتملة</h3>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">{completedDeliveryOrders.length}</span>
        </div>
        <div className="space-y-3">
          {completedDeliveryOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات مكتملة بعد.</div>
          ) : completedDeliveryOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-500">{order.id}</span>
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-500">مكتمل</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{order.user.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}</p>
                </div>
                <div className="text-sm sm:text-left">
                  <p className="font-display font-bold text-primary">{order.total} شيكل</p>
                  <p className="mt-1 text-xs text-muted-foreground">وقت التوصيل: {formatDriverOrderDuration(order)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDriverOrderTime(order.completedAt ?? order.updatedAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatDriverOrderDuration(order: CommerceOrder) {
  const end = new Date(order.completedAt ?? order.updatedAt).getTime();
  const start = new Date(order.createdAt).getTime();
  if (Number.isNaN(end) || Number.isNaN(start) || end <= start) return "غير متاح";
  return `${Math.max(1, Math.round((end - start) / 60000))} دقيقة`;
}

function formatDriverOrderTime(value: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function DriverStatusSelector({ status, onChange }: { status: DriverStatus; onChange: (status: DriverStatus) => void }) {
  const options: { value: DriverStatus; label: string }[] = [
    { value: "online", label: "متصل" },
    { value: "busy", label: "مشغول" },
    { value: "offline", label: "غير متصل" },
  ];

  return (
    <div className="mt-4 rounded-xl border border-border bg-secondary/20 p-3">
      <p className="text-xs font-bold text-muted-foreground">حالة السائق</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
              status === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/30 text-muted-foreground hover:border-cyan/40 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-secondary/15 p-10 text-center">
      <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
      <h2 className="mt-4 font-display text-2xl font-bold">إعدادات السائق</h2>
      <p className="mt-2 text-sm text-muted-foreground">واجهة إعدادات تجريبية جاهزة لإضافة بيانات المركبة، مناطق العمل، والتنبيهات.</p>
    </div>
  );
}

function MiniDashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/25 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function drawerTitle(drawer: DrawerKind) {
  if (drawer === "trips")    return "تفاصيل رحلات اليوم";
  if (drawer === "earnings") return "تفاصيل أرباح اليوم";
  if (drawer === "rating")   return "تفاصيل التقييمات";
  if (drawer === "hours")    return "تفاصيل ساعات العمل";
  if (drawer === "order")    return "تفاصيل الطلب";
  return "";
}
