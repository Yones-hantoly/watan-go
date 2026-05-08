import { createFileRoute, Link } from "@tanstack/react-router";
import { UtensilsCrossed, Search, ShoppingBag, Clock, ChefHat, Truck, Star, Receipt } from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/food")({
  head: () => ({
    meta: [
      { title: "توصيل الطعام — وطن جو" },
      { name: "description", content: "اطلب من مطاعمك المفضلة في وطن جو مع تتبع لحظي للطلب وتوصيل سريع." },
      { property: "og:title", content: "توصيل الطعام — وطن جو" },
      { property: "og:description", content: "آلاف الأطباق من مطاعم محلية، تصل إلى بابك ساخنة." },
    ],
  }),
  component: FoodPage,
});

const features = [
  { icon: <Search className="h-6 w-6" />, title: "تصفح ذكي", description: "ابحث حسب المطبخ أو السعر أو التقييم، مع توصيات شخصية حسب طلباتك السابقة.", badge: "01" },
  { icon: <ShoppingBag className="h-6 w-6" />, title: "سلة مرنة", description: "خصّص طلبك بإضافات وملاحظات، واحفظ المفضلات لطلب أسرع لاحقاً.", badge: "02" },
  { icon: <Clock className="h-6 w-6" />, title: "تتبع المراحل", description: "شاهد طلبك من قبول المطعم إلى التحضير ثم خروج السائق ووصوله إليك.", badge: "03" },
  { icon: <ChefHat className="h-6 w-6" />, title: "قوائم مُحدّثة", description: "المطاعم تدير قوائمها وأسعارها وأوقات عملها بنفسها لحظياً.", badge: "04" },
  { icon: <Receipt className="h-6 w-6" />, title: "دفع متعدد", description: "ادفع نقداً عند الاستلام، أو ببطاقتك، أو من محفظة وطن جو.", badge: "05" },
  { icon: <Star className="h-6 w-6" />, title: "تقييم الطعام والتوصيل", description: "قيّم كلاً من المطعم والسائق لتحسين تجربة الجميع.", badge: "06" },
];

const steps = [
  { n: "01", t: "اختر مطعماً", d: "تصفح المطاعم القريبة منك حسب التقييم أو نوع المطبخ." },
  { n: "02", t: "أضف إلى السلة", d: "اختر أطباقك مع الإضافات والملاحظات." },
  { n: "03", t: "تابع التحضير", d: "إشعارات لحظية في كل مرحلة من مراحل الطلب." },
  { n: "04", t: "استلم واستمتع", d: "السائق يصل إلى بابك بالطعام ساخناً وطازجاً." },
];

function FoodPage() {
  return (
    <>
      <PageHero
        eyebrow="توصيل الطعام"
        icon={<UtensilsCrossed className="h-5 w-5" />}
        title={<>طعامك المفضل،<span className="text-gradient"> يصل إليك ساخناً.</span></>}
        description="آلاف الأطباق من أفضل المطاعم المحلية، مع تتبع لحظي لطلبك من المطبخ إلى بابك."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="الميزات" title="تجربة طلب طعام متكاملة" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="كيف تعمل" title="من الاختيار إلى الاستمتاع" />
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
            { v: "30 د", l: "متوسط التوصيل" },
            { v: "500+", l: "مطعم شريك" },
            { v: "لحظي", l: "تتبع الطلب" },
            { v: "★ 4.7", l: "متوسط التقييم" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-3xl font-bold text-gradient">{s.v}</div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-3.5 text-sm font-semibold text-primary-foreground glow">
            <ShoppingBag className="h-4 w-4" /> لوحة المستخدم
          </Link>
          <Link to="/shops" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            <ChefHat className="h-4 w-4" /> التسوق من المتاجر
          </Link>
          <Link to="/ride-request" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            <Truck className="h-4 w-4" /> احجز رحلة
          </Link>
        </div>
      </section>
    </>
  );
}
