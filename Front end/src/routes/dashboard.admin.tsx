import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Users, Car, Store, UtensilsCrossed, ShieldCheck, Activity } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  component: () => (
    <DashboardShell expectedRole="admin">
      {(user) => (
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
            <StatCard label="إجمالي المستخدمين" value="١٢٬٤٨٠" accent="primary" />
            <StatCard label="السائقون النشطون" value="٣٤٢" accent="cyan" />
            <StatCard label="التجار" value="٥٨٧" accent="amber" />
            <StatCard label="إيرادات اليوم" value="٤٢٬١٠٠ ₪" accent="primary" />
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
      )}
    </DashboardShell>
  ),
});
