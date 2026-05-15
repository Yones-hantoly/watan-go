import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Package, AlertTriangle, ShoppingBag } from "lucide-react";
import { getOrders, subscribeToOrders, updateOrderStatus, type Order } from "@/lib/commerce";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/shop")({
  component: () => (
    <DashboardShell expectedRole="shop">
      {(user) => <ShopDashboard user={user} />}
    </DashboardShell>
  ),
});

function ShopDashboard({ user }: { user: { name: string } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const refresh = () => setOrders(getOrders().filter((order) => order.type === "grocery"));
  const setStatus = (id: string, status: Order["status"]) => {
    updateOrderStatus(id, status);
    refresh();
  };

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, []);

  const newOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter((order) => order.status === "accepted" || order.status === "preparing");
  const readyOrders = orders.filter((order) => order.status === "ready_for_pickup");
  const rejectedOrders = orders.filter((order) => order.status === "cancelled");
  const completedOrders = orders.filter((order) => order.status === "completed" || order.status === "delivered");

  return (
        <div className="space-y-8">
          <section>
            <h1 className="font-display text-3xl font-bold">لوحة المتجر 🏪</h1>
            <p className="mt-2 text-muted-foreground">{user.name} · أدر منتجاتك وطلبات التوصيل</p>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="منتجات نشطة" value="١٤٢" accent="primary" />
            <StatCard label="طلبات اليوم" value={String(orders.length)} accent="amber" />
            <StatCard label="مبيعات اليوم" value="١٬٢٤٠ ₪" accent="cyan" />
            <StatCard label="نفد المخزون" value="٤" accent="amber" />
          </section>

          <section className="card-elevated p-6">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber" /><h2 className="font-display text-xl font-bold">تنبيه: مخزون منخفض</h2></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { name: "حليب طازج ١ ل", left: "٣ قطع" },
                { name: "خبز عربي", left: "٥ أكياس" },
                { name: "شامبو", left: "٢ قطعة" },
                { name: "سكر ١ كغ", left: "٤ قطع" },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-xl border border-amber/30 bg-amber/5 p-3">
                  <div className="flex items-center gap-2"><Package className="h-4 w-4 text-amber" /><span className="text-sm font-medium">{p.name}</span></div>
                  <span className="rounded-full bg-amber/20 px-2 py-0.5 text-xs font-bold text-amber">{p.left}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card-elevated p-6">
            <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-cyan" /><h2 className="font-display text-xl font-bold">إدارة طلبات المتجر</h2></div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <ShopOrderSection title="طلبات جديدة" orders={newOrders} emptyText="لا توجد طلبات جديدة.">
                {(order) => (
                  <>
                    <button onClick={() => setStatus(order.id, "accepted")} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">قبول</button>
                    <button onClick={() => setStatus(order.id, "cancelled")} className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">رفض</button>
                  </>
                )}
              </ShopOrderSection>
              <ShopOrderSection title="طلبات قيد التجهيز" orders={preparingOrders} emptyText="لا توجد طلبات قيد التجهيز.">
                {(order) => (
                  <>
                    {order.status === "accepted" && (
                      <button onClick={() => setStatus(order.id, "preparing")} className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold">بدء التجهيز</button>
                    )}
                    <button onClick={() => setStatus(order.id, "ready_for_pickup")} className="rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 text-xs font-bold text-cyan">جاهز للاستلام</button>
                  </>
                )}
              </ShopOrderSection>
              <ShopOrderSection title="طلبات جاهزة للاستلام" orders={readyOrders} emptyText="لا توجد طلبات جاهزة.">
                {() => <span className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs font-bold text-cyan">بانتظار السائق</span>}
              </ShopOrderSection>
              <ShopOrderSection title="الطلبات المرفوضة" orders={rejectedOrders} emptyText="لا توجد طلبات مرفوضة.">
                {() => null}
              </ShopOrderSection>
              <ShopOrderSection title="الطلبات المكتملة" orders={completedOrders} emptyText="لا توجد طلبات مكتملة بعد.">
                {() => null}
              </ShopOrderSection>
            </div>
          </section>
        </div>
  );
}

function ShopOrderSection({
  title,
  orders,
  emptyText,
  children,
}: {
  title: string;
  orders: Order[];
  emptyText: string;
  children: (order: Order) => ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">{orders.length}</span>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">{emptyText}</div>
        ) : orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-border bg-secondary/25 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan">{order.id}</span>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", shopStatusClass(order.status))}>
                    {shopStatusLabel(order.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold">{order.user.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}</p>
              </div>
              <span className="font-display font-bold text-primary">{order.total} شيكل</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{children(order)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function shopStatusLabel(status: Order["status"]) {
  if (status === "pending") return "طلب جديد";
  if (status === "accepted") return "تم قبول الطلب";
  if (status === "preparing") return "قيد التجهيز";
  if (status === "ready_for_pickup") return "جاهز للاستلام";
  if (status === "picked_up") return "تم الاستلام";
  if (status === "on_the_way") return "في الطريق";
  if (status === "completed" || status === "delivered") return "مكتمل";
  return "مرفوض";
}

function shopStatusClass(status: Order["status"]) {
  if (status === "pending") return "bg-yellow-500/15 text-yellow-600";
  if (status === "preparing") return "bg-orange-500/15 text-orange-500";
  if (status === "ready_for_pickup" || status === "accepted") return "bg-cyan/15 text-cyan";
  if (status === "picked_up" || status === "on_the_way") return "bg-purple-500/15 text-purple-500";
  if (status === "completed" || status === "delivered") return "bg-emerald-500/15 text-emerald-500";
  return "bg-destructive/15 text-destructive";
}
