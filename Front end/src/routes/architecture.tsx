import { createFileRoute } from "@tanstack/react-router";
import { Layers, Database, ShieldCheck, MapPin, GitMerge, Calculator, Lock, Server } from "lucide-react";
import { PageHero, SectionHeading, FeatureCard } from "@/components/ui-bits";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "بنية النظام — وطن جو" },
      { name: "description", content: "كيف يدير نظام وطن جو الخلفي التحقق من البيانات والتتبع اللحظي ومطابقة GPS ومنطق التسعير والأمن." },
      { property: "og:title", content: "بنية النظام — وطن جو" },
      { property: "og:description", content: "النظام الخلفي الذي يشغّل وطن جو." },
    ],
  }),
  component: ArchPage,
});

const responsibilities = [
  { icon: <ShieldCheck className="h-6 w-6" />, title: "التحقق من البيانات", description: "كل طلب يمر بفحص مخطّطي قبل الوصول إلى منطق العمل لمنع البيانات المشوّهة.", badge: "طبقة 1" },
  { icon: <Database className="h-6 w-6" />, title: "تخزين قواعد البيانات", description: "PostgreSQL للبيانات المعاملاتية، وRedis للجلسات ومواقع السائقين اللحظية.", badge: "طبقة 2" },
  { icon: <MapPin className="h-6 w-6" />, title: "تتبع GPS لحظي", description: "قنوات WebSocket تبث مواقع السائقين كل 3 ثوانٍ مع فهرسة جغرافية.", badge: "طبقة 3" },
  { icon: <GitMerge className="h-6 w-6" />, title: "مطابقة السائقين", description: "خوارزمية أقرب سائق توازن بين المسافة والتقييم ومعدل القبول.", badge: "طبقة 4" },
  { icon: <Calculator className="h-6 w-6" />, title: "منطق التسعير", description: "المسافة × السعر + الوقت + رسوم الخدمة، مع معامل الذروة وقت الطلب العالي.", badge: "طبقة 5" },
  { icon: <Lock className="h-6 w-6" />, title: "الأمن", description: "مصادقة JWT، تشفير bcrypt لكلمات المرور، TLS أثناء النقل، AES في التخزين.", badge: "طبقة 6" },
];

function ArchPage() {
  return (
    <>
      <PageHero
        eyebrow="بنية النظام"
        icon={<Layers className="h-5 w-5" />}
        title={<>المحرك <span className="text-gradient">خلف وطن جو.</span></>}
        description="ست طبقات خلفية تعمل بانسجام — من التحقق من الطلبات إلى GPS اللحظي والتسعير والأمن الشامل."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-surface p-10">
          <div className="flex items-center gap-3 mb-8">
            <Server className="h-5 w-5 text-cyan" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">نظرة عامة على البنية</span>
          </div>
          <div className="space-y-3">
            {[
              { layer: "تطبيقات العملاء", items: "المستخدم · السائق · المطعم · المتجر · الإدارة", color: "primary" },
              { layer: "بوابة API", items: "REST + WebSocket · مصادقة · تحديد المعدل", color: "cyan" },
              { layer: "الخدمات", items: "الرحلات · الطلبات · المدفوعات · المطابقة · الإشعارات", color: "primary" },
              { layer: "البيانات", items: "PostgreSQL · Redis · تخزين الكائنات", color: "cyan" },
            ].map((row) => (
              <div
                key={row.layer}
                className="grid grid-cols-12 items-center gap-4 rounded-xl border border-border bg-background/50 p-5"
              >
                <div className="col-span-12 md:col-span-3">
                  <div className={`font-display text-base font-semibold ${row.color === "primary" ? "text-primary" : "text-cyan"}`}>
                    {row.layer}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-9 font-mono text-sm text-muted-foreground" dir="ltr">
                  {row.items}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading eyebrow="المسؤوليات" title="ما يفعله النظام الخلفي" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {responsibilities.map((r) => <FeatureCard key={r.title} {...r} />)}
          </div>
        </div>
      </section>
    </>
  );
}
