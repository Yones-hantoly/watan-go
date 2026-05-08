import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { ChefHat, Clock, TrendingUp } from "lucide-react";
import { getOrders, updateOrderStatus, type Order } from "@/lib/commerce";

export const Route = createFileRoute("/dashboard/restaurant")({
  component: () => (
    <DashboardShell expectedRole="restaurant">
      {(user) => <RestaurantDashboard user={user} />}
    </DashboardShell>
  ),
});

function RestaurantDashboard({ user }: { user: { name: string } }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const refresh = () => setOrders(getOrders().filter((order) => order.type === "food"));
  const setStatus = (id: string, status: Order["status"]) => {
    updateOrderStatus(id, status);
    refresh();
  };

  useEffect(refresh, []);

  return (
        <div className="space-y-8">
          <section>
            <h1 className="font-display text-3xl font-bold">لوحة المطعم 🍔</h1>
            <p className="mt-2 text-muted-foreground">{user.name} · أدر طلباتك وقائمتك</p>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="طلبات نشطة" value="٥" accent="primary" />
            <StatCard label="مبيعات اليوم" value="٨٤٠ ₪" accent="amber" />
            <StatCard label="متوسط التحضير" value="١٨ د" accent="cyan" />
            <StatCard label="تقييم المطعم" value="٤.٧ ⭐" accent="amber" />
          </section>

          <section className="card-elevated p-6">
            <h2 className="font-display text-xl font-bold">طلبات الطعام الواردة</h2>
            <div className="mt-4 space-y-3">
              {orders.length === 0 ? (
                <div className="text-sm text-muted-foreground">لا توجد طلبات طعام حالية.</div>
              ) : orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan">{o.id}</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">{o.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{o.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setStatus(o.id, "accepted")} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">قبول</button>
                    <button onClick={() => setStatus(o.id, "preparing")} className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold">تحضير</button>
                    <button onClick={() => setStatus(o.id, "cancelled")} className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2"><ChefHat className="h-4 w-4 text-amber" /><h2 className="font-display text-lg font-bold">قائمتي</h2></div>
              <p className="mt-2 text-sm text-muted-foreground">٢٤ صنف نشط · ٣ غير متوفر</p>
              <button className="mt-3 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-semibold">إدارة القائمة</button>
            </div>
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /><h2 className="font-display text-lg font-bold">الأكثر طلباً</h2></div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <li>١. شاورما دجاج — ٤٢ طلب</li>
                <li>٢. بيتزا مارجريتا — ٣٠ طلب</li>
                <li>٣. مشاوي مشكلة — ٢٤ طلب</li>
              </ul>
            </div>
          </section>
        </div>
  );
}
