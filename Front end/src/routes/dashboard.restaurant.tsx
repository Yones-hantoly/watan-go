import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { ChefHat, Clock, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/restaurant")({
  component: () => (
    <DashboardShell expectedRole="restaurant">
      {(user) => (
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
            <h2 className="font-display text-xl font-bold">طلبات قيد التحضير</h2>
            <div className="mt-4 space-y-3">
              {[
                { id: "#٢٣٤١", items: "شاورما × ٢، عصير", time: "٥ د", status: "جديد" },
                { id: "#٢٣٤٢", items: "مشاوي مشكلة، حمص", time: "١٢ د", status: "قيد التحضير" },
                { id: "#٢٣٤٣", items: "بيتزا خضار", time: "١ د", status: "جديد" },
              ].map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan">{o.id}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${o.status === "جديد" ? "bg-amber/20 text-amber" : "bg-primary/20 text-primary"}`}>{o.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{o.items}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{o.time}</div>
                    <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">جاهز</button>
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
      )}
    </DashboardShell>
  ),
});
