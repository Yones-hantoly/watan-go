import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Car,
  UtensilsCrossed,
  Store,
  MapPin,
  Zap,
  Shield,
  Truck,
  ChefHat,
  ShieldCheck,
  ArrowLeft,
  Activity,
  Layers,
  Smartphone,
} from "lucide-react";
import { FeatureCard } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "وطن جو — منصة واحدة للتنقل والتوصيل والتسوق" },
      {
        name: "description",
        content:
          "وطن جو يجمع خدمات النقل وتوصيل الطعام وطلبات المتاجر مع تتبع لحظي ومطابقة عبر GPS ولوحات تحكم متعددة الأدوار.",
      },
      { property: "og:title", content: "وطن جو — منصة موحدة للتنقل والتجارة" },
      {
        property: "og:description",
        content: "رحلات وتوصيل وتسوق في نظام واحد لحظي. خمسة أدوار، منصة واحدة.",
      },
    ],
  }),
  component: Home,
});

const services = [
  {
    icon: <Car className="h-6 w-6" />,
    title: "الرحلات",
    description: "نقل ركاب بمطابقة عبر GPS وتتبع لحظي وتسعير شفاف.",
    badge: "01",
    to: "/rides" as const,
  },
  {
    icon: <UtensilsCrossed className="h-6 w-6" />,
    title: "توصيل الطعام",
    description: "اطلب من المطاعم المحلية مع إدارة قوائم الطعام ومتابعة الطلب لحظياً.",
    badge: "02",
    to: "/food" as const,
  },
  {
    icon: <Store className="h-6 w-6" />,
    title: "طلبات المتاجر",
    description: "تصفح المتاجر، أدر سلة المشتريات، وادفع عند الاستلام.",
    badge: "03",
    to: "/shops" as const,
  },
];

const roles = [
  { icon: <Smartphone className="h-5 w-5" />, name: "المستخدم", desc: "يحجز الرحلات والطلبات", to: "/users" as const },
  { icon: <Truck className="h-5 w-5" />, name: "السائق", desc: "يقبل الرحلات والتوصيل", to: "/drivers" as const },
  { icon: <ChefHat className="h-5 w-5" />, name: "المطعم", desc: "يدير القائمة والطلبات", to: "/merchants" as const },
  { icon: <Store className="h-5 w-5" />, name: "المتجر", desc: "يعرض المنتجات والمخزون", to: "/merchants" as const },
  { icon: <ShieldCheck className="h-5 w-5" />, name: "الإدارة", desc: "تشرف على المنصة", to: "/admin" as const },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-grid" aria-hidden />

        <div className="mx-auto max-w-7xl px-6 pt-20 pb-28 md:pt-28 md:pb-36 relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 backdrop-blur">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-cyan animate-pulse" />
                  <span className="font-mono text-xs text-muted-foreground">
                    متعدد الخدمات · لحظي · قابل للتوسع
                  </span>
                </div>

                <h1 className="mt-6 font-display text-5xl font-bold leading-[1.15] tracking-tight md:text-7xl">
                  وطن جو
                  <span className="block mt-2 text-3xl md:text-5xl text-gradient tracking-wide" dir="ltr">Watan Go</span>
                </h1>
                <p className="mt-6 font-display text-2xl md:text-4xl font-semibold leading-tight text-muted-foreground">
                  منصة واحدة لـلتنقل والتوصيل والتسوق.
                </p>

                <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
                  وطن جو يجمع التنقل وتوصيل الطعام والتسوق في منظومة لحظية واحدة — خمسة أدوار،
                  ونظام سلس متكامل.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    to="/architecture"
                    className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-3.5 text-sm font-semibold text-primary-foreground glow transition-transform hover:scale-[1.02]"
                  >
                    استكشف النظام
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </Link>
                  <Link
                    to="/users"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-secondary"
                  >
                    عرض الميزات
                  </Link>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                  {[
                    { v: "5", l: "أدوار" },
                    { v: "3", l: "خدمات" },
                    { v: "24/7", l: "لحظي" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="font-display text-3xl font-bold text-gradient">{s.v}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Visual map mock */}
            <div className="lg:col-span-5">
              <div className="relative aspect-square rounded-3xl border border-border bg-surface p-6 glow">
                <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full opacity-30">
                  <defs>
                    <radialGradient id="rg" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="oklch(0.78 0.17 60)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="oklch(0.78 0.17 60)" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {[60, 120, 180].map((r) => (
                    <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="url(#rg)" strokeWidth="1" />
                  ))}
                  <line x1="0" y1="200" x2="400" y2="200" stroke="oklch(0.78 0.17 60 / 0.2)" />
                  <line x1="200" y1="0" x2="200" y2="400" stroke="oklch(0.78 0.17 60 / 0.2)" />
                </svg>

                <div className="relative h-full">
                  {[
                    { top: "20%", left: "30%", icon: <Car className="h-4 w-4" />, color: "primary" },
                    { top: "55%", left: "70%", icon: <UtensilsCrossed className="h-4 w-4" />, color: "cyan" },
                    { top: "70%", left: "25%", icon: <Store className="h-4 w-4" />, color: "primary" },
                    { top: "35%", left: "65%", icon: <MapPin className="h-4 w-4" />, color: "cyan" },
                  ].map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.15, type: "spring" }}
                      style={{ top: p.top, left: p.left }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full ${
                        p.color === "primary"
                          ? "bg-primary text-primary-foreground"
                          : "bg-cyan text-accent-foreground"
                      } glow`}
                    >
                      {p.icon}
                      <span
                        className={`absolute inset-0 rounded-full animate-ping ${
                          p.color === "primary" ? "bg-primary/40" : "bg-cyan/40"
                        }`}
                      />
                    </motion.div>
                  ))}

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan glow">
                    <span className="font-display text-xl font-bold text-primary-foreground">و</span>
                  </div>
                </div>

                <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-border bg-background/70 p-3 backdrop-blur">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-cyan" />
                      <span className="font-mono text-xs">4 طلبات نشطة</span>
                    </div>
                    <span className="font-mono text-xs text-cyan">الوصول 4 د</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div className="max-w-xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              المنصة
            </span>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl leading-tight">
              ثلاث خدمات. <span className="text-gradient">منظومة واحدة.</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            مصممة كنظام خلفي موحد يدعم تجارب أمامية مستقلة لكل دور في الشبكة.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {services.map((s) => (
            <Link key={s.title} to={s.to} className="block transition-transform hover:scale-[1.01]">
              <FeatureCard icon={s.icon} title={s.title} description={s.description} badge={s.badge} />
            </Link>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            5 أدوار
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl leading-tight">
            مصممة للجميع.
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            كل دور يحصل على واجهة ولوحة تحكم خاصة به، والكل مدعوم بنفس النظام الخلفي الموحد.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {roles.map((r) => (
            <Link key={r.name} to={r.to} className="card-elevated p-5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                {r.icon}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{r.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.desc}</p>
              <ArrowLeft className="mt-4 h-4 w-4 text-muted-foreground transition-all group-hover:text-primary group-hover:-translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-3xl border border-border bg-surface p-10 md:p-14 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan/20 blur-3xl" />

          <div className="relative">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
              لماذا وطن جو
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl max-w-2xl leading-tight">
              مهندس ليتوسع من مدينة واحدة إلى وطن كامل.
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[
                { icon: <MapPin className="h-5 w-5" />, t: "تتبع لحظي", d: "تشغيل GPS لحظي" },
                { icon: <Layers className="h-5 w-5" />, t: "متعدد الخدمات", d: "نقل · طعام · متاجر" },
                { icon: <Zap className="h-5 w-5" />, t: "قابل للتوسع", d: "مبني للأحمال العالية" },
                { icon: <Shield className="h-5 w-5" />, t: "آمن", d: "تشفير ومصادقة" },
              ].map((h) => (
                <div key={h.t}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary border border-border">
                    {h.icon}
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold">{h.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
