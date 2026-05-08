import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Clock3, Headphones, ListChecks, PackageCheck, Star, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { type AuthUser } from "@/lib/auth";
import { getOrders, updateDriverStatus, updateOrderStatus, type Order as CommerceOrder } from "@/lib/commerce";
import {
  mockActivity,
  mockChatMessages,
  mockEarnings,
  mockNotifications,
  mockOrders,
  mockRatings,
  mockTrips,
  type DriverStatus,
  type Order,
} from "@/lib/driver-mock-data";
import { ChatWidget } from "@/components/driver/chat-widget";
import { DeliverySection } from "@/components/driver/delivery-section";
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

export function DriverDashboard({ user, onLogout }: DriverDashboardProps) {
  const [activeView, setActiveView] = useState<DriverView>("dashboard");
  const [driverStatus, setDriverStatus] = useState<DriverStatus>("online");
  const [orders, setOrders] = useState(mockOrders);
  const [deliveryOrders, setDeliveryOrders] = useState<CommerceOrder[]>(() => getOrders().filter((order) => order.status !== "delivered" && order.status !== "cancelled"));
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return !document.documentElement.classList.contains("light");
  });

  const completedTrips = mockTrips.filter((trip) => trip.status === "completed").length;
  const totalEarnings = mockEarnings.reduce((sum, item) => sum + item.netProfit, 0);
  const averageRating = mockRatings.reduce((sum, item) => sum + item.rating, 0) / mockRatings.length;
  const activeOrder = useMemo(() => orders.find((order) => order.status === "active"), [orders]);

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setDrawer("order");
  };

  const updateOrder = (orderId: string, status: Order["status"], message: string) => {
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    toast.success(message);
  };

  const updateDeliveryOrder = (orderId: string, driverStatus: CommerceOrder["driverStatus"], message: string) => {
    updateDriverStatus(orderId, driverStatus);
    if (driverStatus === "accepted") updateOrderStatus(orderId, "on_the_way");
    if (driverStatus === "delivered") updateOrderStatus(orderId, "delivered");
    setDeliveryOrders(getOrders().filter((order) => order.status !== "delivered" && order.status !== "cancelled"));
    toast.success(message);
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
          onChange={(view) => {
            setActiveView(view);
            if (view === "support") setChatOpen(true);
          }}
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
                    completedTrips={completedTrips}
                    totalEarnings={totalEarnings}
                    averageRating={averageRating}
                    driverStatus={driverStatus}
                    onOpenDrawer={setDrawer}
                    onGoOrders={() => setActiveView("orders")}
                    deliveryOrders={deliveryOrders}
                    onAcceptDelivery={(id) => updateDeliveryOrder(id, "accepted", "تم قبول مهمة التوصيل")}
                    onCompleteDelivery={(id) => updateDeliveryOrder(id, "delivered", "تم تسليم الطلب")}
                  />
                )}
                {activeView === "orders" && (
                  <OrdersSection
                    orders={orders}
                    onAccept={(id) => updateOrder(id, "active", "تم قبول الطلب")}
                    onReject={(id) => updateOrder(id, "cancelled", "تم رفض الطلب")}
                    onStart={(id) => updateOrder(id, "active", "بدأت رحلة التوصيل")}
                    onComplete={(id) => updateOrder(id, "completed", "تم إكمال الطلب بنجاح")}
                    onViewDetails={openOrder}
                  />
                )}
                {activeView === "delivery" && <DeliverySection currentOrder={activeOrder} driverStatus={driverStatus} onStatusChange={setDriverStatus} />}
                {activeView === "earnings" && <EarningsDetails earnings={mockEarnings} />}
                {activeView === "ratings" && <RatingDetails ratings={mockRatings} averageRating={averageRating} />}
                {activeView === "support" && <SupportPanel onOpenChat={() => setChatOpen(true)} />}
                {activeView === "settings" && <SettingsPanel />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <DetailsDrawer isOpen={drawer !== null} onClose={() => setDrawer(null)} title={drawerTitle(drawer)}>
        {drawer === "trips" && <TripsDetails trips={mockTrips} />}
        {drawer === "earnings" && <EarningsDetails earnings={mockEarnings} />}
        {drawer === "rating" && <RatingDetails ratings={mockRatings} averageRating={averageRating} />}
        {drawer === "hours" && <WorkingHoursDetails startTime={new Date("2026-04-29T08:00:00")} breakTime={25} status={driverStatus} activity={mockActivity} />}
        {drawer === "order" && selectedOrder && <OrderDetails order={selectedOrder} />}
      </DetailsDrawer>
      <ChatWidget initialMessages={mockChatMessages} forceOpen={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

function DashboardHome({
  completedTrips,
  totalEarnings,
  averageRating,
  driverStatus,
  onOpenDrawer,
  onGoOrders,
  deliveryOrders,
  onAcceptDelivery,
  onCompleteDelivery,
}: {
  completedTrips: number;
  totalEarnings: number;
  averageRating: number;
  driverStatus: DriverStatus;
  onOpenDrawer: (drawer: DrawerKind) => void;
  onGoOrders: () => void;
  deliveryOrders: CommerceOrder[];
  onAcceptDelivery: (id: string) => void;
  onCompleteDelivery: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.16),transparent_34%),linear-gradient(135deg,rgba(19,36,59,0.96),rgba(10,20,34,0.96))] p-5 shadow-2xl shadow-black/20 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold text-cyan">لوحة السائق المباشرة</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">جاهز لاستلام طلبات اليوم؟</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">تابع الرحلات والأرباح والتقييمات والدعم المباشر داخل تجربة عربية RTL مصممة لسائق يعمل بسرعة ووضوح.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button onClick={onGoOrders} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
                عرض الطلبات
              </button>
              <button onClick={() => onOpenDrawer("hours")} className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-sm font-bold text-cyan transition hover:border-cyan/60">
                حالة المناوبة
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-background/45 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">حالة العمل</span>
              <span className="rounded-full bg-cyan/15 px-3 py-1 text-xs font-bold text-cyan">{driverStatus === "online" ? "متصل" : driverStatus === "busy" ? "مشغول" : "غير متصل"}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniDashboardMetric label="طلبات جديدة" value="1" />
              <MiniDashboardMetric label="طلب نشط" value="1" />
              <MiniDashboardMetric label="تنبيهات" value={mockNotifications.length.toString()} />
              <MiniDashboardMetric label="قبول الطلبات" value="92%" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="رحلات اليوم" value={`${completedTrips}`} hint="مع رحلة نشطة الآن" icon={ListChecks} tone="cyan" onClick={() => onOpenDrawer("trips")} />
        <StatsCard title="أرباح اليوم" value={`${totalEarnings.toFixed(0)} شيكل`} hint="بعد خصم عمولة المنصة" icon={Banknote} tone="amber" onClick={() => onOpenDrawer("earnings")} />
        <StatsCard title="التقييم" value={averageRating.toFixed(1)} hint={`${mockRatings.length} تقييم حديث`} icon={Star} tone="cyan" onClick={() => onOpenDrawer("rating")} />
        <StatsCard title="ساعات العمل" value="6.2" hint="تشمل 25 دقيقة استراحة" icon={Clock3} tone="primary" onClick={() => onOpenDrawer("hours")} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-surface/85 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold">طلبات قريبة</h3>
            <button onClick={onGoOrders} className="text-sm font-bold text-cyan hover:text-primary">إدارة الطلبات</button>
          </div>
          <div className="space-y-3">
            {mockOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold">{order.pickupLocation}</p>
                  <p className="mt-1 text-sm text-muted-foreground">إلى {order.deliveryLocation}</p>
                </div>
                <span className="font-display text-xl font-bold text-primary">{order.price} شيكل</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/85 p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-bold">تنبيهات اليوم</h3>
          </div>
          <div className="space-y-3">
            {mockNotifications.map((notification) => (
              <div key={notification} className="rounded-xl border border-border bg-secondary/20 p-3 text-sm text-muted-foreground">
                {notification}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface/85 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">مهام توصيل من الطلبات الجديدة</h3>
          <span className="rounded-full bg-cyan/10 px-3 py-1 text-xs font-bold text-cyan">{deliveryOrders.length}</span>
        </div>
        <div className="space-y-3">
          {deliveryOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد مهام توصيل حالية.</div>
          ) : deliveryOrders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{order.vendorName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{order.deliveryAddress} · {order.total} شيكل</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAcceptDelivery(order.id)} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">قبول</button>
                <button onClick={() => onCompleteDelivery(order.id)} className="rounded-xl border border-border bg-secondary/50 px-4 py-2 text-xs font-bold">تم التسليم</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SupportPanel({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-surface/85 p-8 text-center">
      <Headphones className="mx-auto h-14 w-14 text-cyan" />
      <h2 className="mt-4 font-display text-2xl font-bold">الدعم المباشر</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">تواصل مع فريق Watan Go لمشاكل العناوين، الدفع، الطلبات النشطة أو أي حالة طارئة أثناء التوصيل.</p>
      <button onClick={onOpenChat} className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
        فتح المحادثة
      </button>
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
  if (drawer === "trips") return "تفاصيل رحلات اليوم";
  if (drawer === "earnings") return "تفاصيل أرباح اليوم";
  if (drawer === "rating") return "تفاصيل التقييمات";
  if (drawer === "hours") return "تفاصيل ساعات العمل";
  if (drawer === "order") return "تفاصيل الطلب";
  return "";
}
