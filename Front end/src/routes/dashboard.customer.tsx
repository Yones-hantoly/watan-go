import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { Car, UtensilsCrossed, Store, MapPin, Clock, Heart } from "lucide-react";

export const Route = createFileRoute("/dashboard/customer")({
  component: () => (
    <DashboardShell expectedRole="customer">
      {(user) => (
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

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard label="طلبات هذا الشهر" value="١٢" hint="↑ ٣ عن الشهر الماضي" accent="primary" />
            <StatCard label="نقاط المكافآت" value="٤٨٠" hint="رصيد قابل للاستبدال" accent="amber" />
            <StatCard label="مفضلاتي" value="٧" hint="مطاعم ومحلات" accent="cyan" />
          </section>

          <section className="card-elevated p-6">
            <h2 className="font-display text-xl font-bold">آخر الطلبات</h2>
            <div className="mt-4 divide-y divide-border/40">
              {[
                { name: "مطعم البيت الدمشقي", status: "تم التوصيل", time: "أمس" },
                { name: "صيدلية النور", status: "تم التوصيل", time: "قبل ٣ أيام" },
                { name: "رحلة إلى الجامعة", status: "مكتملة", time: "قبل أسبوع" },
              ].map((o) => (
                <div key={o.name} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{o.name}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {o.time}
                    </div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{o.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-cyan"><MapPin className="h-4 w-4" /><span className="text-sm font-semibold">عنوان التوصيل الرئيسي</span></div>
              <p className="mt-2 text-sm text-muted-foreground">شارع الجامعة، الطابق الثالث</p>
            </div>
            <div className="card-elevated p-5">
              <div className="flex items-center gap-2 text-amber"><Heart className="h-4 w-4" /><span className="text-sm font-semibold">مطعمك المفضل</span></div>
              <p className="mt-2 text-sm text-muted-foreground">مطعم البيت الدمشقي · ٤.٨ ⭐</p>
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  ),
});

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
