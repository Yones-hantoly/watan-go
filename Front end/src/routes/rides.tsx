import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, MapPin, CreditCard, Star, Clock, Shield, Navigation, Users } from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/rides")({
  head: () => ({
    meta: [
      { title: "خدمة الرحلات — وطن جو" },
      { name: "description", content: "خدمة نقل الركاب في وطن جو: مطابقة عبر GPS، تتبع لحظي، تسعير شفاف، ودفع آمن." },
      { property: "og:title", content: "خدمة الرحلات — وطن جو" },
      { property: "og:description", content: "احجز رحلتك خلال ثوانٍ مع تتبع لحظي وسعر معروف مسبقاً." },
    ],
  }),
  component: RidesPage,
});

const features = [
  { icon: <MapPin className="h-6 w-6" />, title: "مطابقة عبر GPS", description: "خوارزمية ذكية تربط الراكب بأقرب سائق متاح خلال ثوانٍ.", badge: "01" },
  { icon: <Navigation className="h-6 w-6" />, title: "تتبع لحظي", description: "تابع موقع السائق على الخريطة في كل ثانية حتى وصولك.", badge: "02" },
  { icon: <CreditCard className="h-6 w-6" />, title: "تسعير شفاف", description: "السعر معروف قبل تأكيد الرحلة — لا مفاجآت ولا رسوم خفية.", badge: "03" },
  { icon: <Shield className="h-6 w-6" />, title: "أمان متكامل", description: "تحقق من هوية السائق، زر طوارئ، ومشاركة الرحلة مع العائلة.", badge: "04" },
  { icon: <Star className="h-6 w-6" />, title: "تقييم متبادل", description: "نظام تقييم بعد كل رحلة لضمان جودة الخدمة باستمرار.", badge: "05" },
  { icon: <Clock className="h-6 w-6" />, title: "حجز فوري ومجدول", description: "احجز الآن أو حدد موعداً مسبقاً لرحلاتك المهمة.", badge: "06" },
];

const steps = [
  { n: "01", t: "حدد الوجهة", d: "ابحث عن وجهتك أو حددها على الخريطة." },
  { n: "02", t: "اختر نوع الرحلة", d: "عادية، عائلية، أو فاخرة — السعر يظهر فوراً." },
  { n: "03", t: "تابع السائق", d: "شاهد السائق قادماً إليك على الخريطة لحظياً." },
  { n: "04", t: "ادفع وقيّم", d: "ادفع نقداً أو بالبطاقة، ثم قيّم تجربتك." },
];

function RidesPage() {
  return (
    <>
      <PageHero
        eyebrow="خدمة الرحلات"
        icon={<Car className="h-5 w-5" />}
        title={<>تنقّل في مدينتك بـ<span className="text-gradient"> ضغطة زر.</span></>}
        description="نقل ركاب موثوق مع مطابقة فورية للسائقين، تتبع لحظي، وتسعير شفاف يعرف قبل بدء الرحلة."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="الميزات" title="كل ما تحتاجه في رحلة واحدة" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="كيف تعمل" title="من الحجز إلى الوصول في 4 خطوات" />
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card-elevated p-6">
              <div className="font-mono text-xs text-primary">{s.n}</div>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-surface p-10 grid gap-8 md:grid-cols-4">
          {[
            { v: "<60 ث", l: "زمن المطابقة" },
            { v: "GPS", l: "تتبع لحظي" },
            { v: "24/7", l: "خدمة متواصلة" },
            { v: "★ 4.8", l: "متوسط التقييم" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl font-bold text-gradient">{s.v}</div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-3.5 text-sm font-semibold text-primary-foreground glow">
            <Users className="h-4 w-4" /> لوحة المستخدم
          </Link>
          <Link to="/ride-request" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            <Car className="h-4 w-4" /> اطلب رحلة
          </Link>
        </div>
      </section>
    </>
  );
}
