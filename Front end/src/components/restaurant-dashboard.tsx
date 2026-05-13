import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, ChefHat, ClipboardList, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";
import { getOrders, subscribeToOrders, updateOrderStatus, type Order } from "@/lib/commerce";
import {
  advanceOrderDeliveryStage,
  DELIVERY_STAGES,
  getOrderDeliveryStage,
  isFinalDeliveryStage,
  setOrderDeliveryStage,
} from "@/lib/delivery-flow";
import type { AuthUser } from "@/lib/auth";

type RestaurantView = "orders" | "menu";

const restaurantTabs: Array<{ view: RestaurantView; to: "/dashboard/restaurant/orders" | "/dashboard/restaurant/menu"; label: string; icon: ReactNode }> = [
  { view: "orders", to: "/dashboard/restaurant/orders", label: "إدارة الطلبات", icon: <ClipboardList className="h-4 w-4" /> },
  { view: "menu", to: "/dashboard/restaurant/menu", label: "القائمة", icon: <ChefHat className="h-4 w-4" /> },
];

export function RestaurantDashboardPage({ user, view = "orders" }: { user: AuthUser; view?: RestaurantView }) {
  return (
    <RestaurantDashboardLayout user={user}>
      {view === "menu" ? <RestaurantMenuPanel /> : <RestaurantOrdersPanel user={user} />}
    </RestaurantDashboardLayout>
  );
}

function RestaurantDashboardLayout({ user, children }: { user: AuthUser; children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isActiveTab = (view: RestaurantView) =>
    view === "orders"
      ? pathname === "/dashboard/restaurant" || pathname === "/dashboard/restaurant/orders"
      : pathname === "/dashboard/restaurant/menu";

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">لوحة المطعم</h1>
          <p className="mt-2 text-muted-foreground">{user.name} · أدر طلباتك وقائمتك من مكان واحد</p>
        </div>

        <nav className="flex w-full flex-wrap gap-2 rounded-xl border border-border bg-secondary/30 p-1.5 sm:w-fit">
          {restaurantTabs.map((tab) => (
            <Link
              key={tab.view}
              to={tab.to}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground",
                isActiveTab(tab.view) && "bg-background text-foreground shadow-sm",
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </nav>
      </section>

      {children}
    </div>
  );
}

function RestaurantOrdersPanel({ user }: { user: AuthUser }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const refresh = () => setOrders(getOrders().filter((order) => order.type === "food"));
  const setStatus = (id: string, status: Order["status"]) => {
    updateOrderStatus(id, status);
    if (status === "accepted") setOrderDeliveryStage(id, "accepted");
    refresh();
  };
  const advanceStatus = (id: string) => {
    const updatedOrder = advanceOrderDeliveryStage(id);
    if (!updatedOrder) return;
    if (isFinalDeliveryStage(getOrderDeliveryStage(updatedOrder))) {
      toast.success("تم تسليم الطلب للعميل");
      refresh();
      return;
    }
    toast.success("تم تحديث مرحلة الطلب");
    refresh();
  };

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, []);

  const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const completedOrders = orders.filter((order) => order.status === "delivered");

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="طلبات نشطة" value={String(activeOrders.length)} accent="primary" />
        <StatCard label="مبيعات اليوم" value="٨٤٠ ₪" accent="amber" />
        <StatCard label="متوسط التحضير" value="١٨ د" accent="cyan" />
        <StatCard label="تقييم المطعم" value="٤.٧ ⭐" accent="amber" />
      </section>

      <section className="card-elevated p-6">
        <h2 className="font-display text-xl font-bold">طلبات الطعام الواردة</h2>
        <div className="mt-4 space-y-3">
          {activeOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات طعام حالية.</div>
          ) : (
            activeOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan">{order.id}</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">{order.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}
                    </div>
                    <OrderProgress order={order} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setStatus(order.id, "accepted")} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">قبول</button>
                    <button onClick={() => setStatus(order.id, "preparing")} className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold">تحضير</button>
                    <button onClick={() => advanceStatus(order.id)} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-500">التالي</button>
                    <button onClick={() => setStatus(order.id, "cancelled")} className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">رفض</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card-elevated p-6">
        <h2 className="font-display text-xl font-bold">الطلبات المكتملة</h2>
        <div className="mt-4 space-y-3">
          {completedOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات مكتملة بعد.</div>
          ) : (
            completedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div>
                  <span className="font-mono text-sm font-bold text-emerald-500">{order.id}</span>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">مكتمل</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-amber" />
            <h2 className="font-display text-lg font-bold">قائمتي</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">٢٤ صنف نشط · ٣ غير متوفر</p>
          <Link to="/dashboard/restaurant/menu" className="mt-3 inline-flex rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-semibold">
            إدارة القائمة
          </Link>
        </div>
        <TopItemsCard />
      </section>
    </div>
  );
}

function RestaurantMenuPanel() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="أصناف نشطة" value="٢٤" accent="primary" />
        <StatCard label="غير متوفر" value="٣" accent="amber" />
        <StatCard label="تصنيفات" value="٦" accent="cyan" />
        <StatCard label="الأكثر طلباً" value="شاورما" accent="amber" />
      </section>

      <section className="card-elevated p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">القائمة</h2>
            <p className="mt-1 text-sm text-muted-foreground">تابع الأصناف والأسعار وحالة التوفر بسرعة.</p>
          </div>
          <button className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">إضافة صنف</button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { name: "شاورما دجاج", category: "ساندويش", price: "٢٤ ₪", status: "متوفر" },
            { name: "بيتزا مارجريتا", category: "بيتزا", price: "٣٨ ₪", status: "متوفر" },
            { name: "مشاوي مشكلة", category: "مشاوي", price: "٦٥ ₪", status: "غير متوفر" },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold",
                    item.status === "متوفر" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber/15 text-amber",
                  )}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-cyan">{item.price}</span>
                <button className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-semibold">تعديل</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TopItemsCard />
    </div>
  );
}

function TopItemsCard() {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-bold">الأكثر طلباً</h2>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <li>١. شاورما دجاج — ٤٢ طلب</li>
        <li>٢. بيتزا مارجريتا — ٣٠ طلب</li>
        <li>٣. مشاوي مشكلة — ٢٤ طلب</li>
      </ul>
    </div>
  );
}

function OrderProgress({ order }: { order: Order }) {
  const activeStage = getOrderDeliveryStage(order);
  const activeIndex = DELIVERY_STAGES.findIndex((step) => step.id === activeStage);
  const final = isFinalDeliveryStage(activeStage);

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {DELIVERY_STAGES.map((step, index) => {
        const done = activeIndex > index || final;
        const current = activeIndex === index && !final;
        return (
          <span
            key={step.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold",
              done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
              current && "border-primary bg-primary text-primary-foreground",
              !done && !current && "border-border bg-secondary/30 text-muted-foreground",
            )}
          >
            {done && <CheckCircle2 className="h-3 w-3" />}
            {step.label}
          </span>
        );
      })}
    </div>
  );
}
