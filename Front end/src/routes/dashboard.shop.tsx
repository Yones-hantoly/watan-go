import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Package, AlertTriangle, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/dashboard/shop")({
  component: () => (
    <DashboardShell expectedRole="shop">
      {(user) => (
        <div className="space-y-8">
          <section>
            <h1 className="font-display text-3xl font-bold">لوحة المتجر 🏪</h1>
            <p className="mt-2 text-muted-foreground">{user.name} · أدر منتجاتك وطلبات التوصيل</p>
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="منتجات نشطة" value="١٤٢" accent="primary" />
            <StatCard label="طلبات اليوم" value="١٧" accent="amber" />
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
            <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-cyan" /><h2 className="font-display text-xl font-bold">آخر الطلبات</h2></div>
            <div className="mt-4 divide-y divide-border/40">
              {[
                { id: "#٤٥٦", items: "٥ منتجات", total: "٨٢ ₪" },
                { id: "#٤٥٧", items: "٣ منتجات", total: "٤٥ ₪" },
                { id: "#٤٥٨", items: "٧ منتجات", total: "١١٠ ₪" },
              ].map((o) => (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-cyan">{o.id}</span>
                    <span className="text-sm text-muted-foreground">{o.items}</span>
                  </div>
                  <span className="font-display font-bold text-primary">{o.total}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  ),
});
