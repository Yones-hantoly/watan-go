import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, Package, ShoppingCart, Truck, Tag, Boxes, CreditCard, Search } from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/shops")({
  head: () => ({
    meta: [
      { title: "طلبات المتاجر — وطن جو" },
      { name: "description", content: "تسوّق من المتاجر المحلية في وطن جو واستلم مشترياتك في نفس اليوم." },
      { property: "og:title", content: "طلبات المتاجر — وطن جو" },
      { property: "og:description", content: "بقالة، صيدليات، إلكترونيات وأكثر — كلها في تطبيق واحد." },
    ],
  }),
  component: ShopsPage,
});

const features = [
  { icon: <Search className="h-6 w-6" />, title: "بحث متقدم", description: "ابحث في المنتجات بالاسم أو الفئة أو المتجر، مع تصفية حسب السعر والتوفر.", badge: "01" },
  { icon: <Boxes className="h-6 w-6" />, title: "إدارة المخزون", description: "المتاجر تحدّث مخزونها لحظياً لمنع طلب منتجات غير متوفرة.", badge: "02" },
  { icon: <ShoppingCart className="h-6 w-6" />, title: "سلة متعددة المتاجر", description: "اطلب من أكثر من متجر في طلب واحد مع توصيل موحد.", badge: "03" },
  { icon: <Tag className="h-6 w-6" />, title: "عروض وخصومات", description: "كوبونات حصرية وعروض يومية من المتاجر الشريكة.", badge: "04" },
  { icon: <CreditCard className="h-6 w-6" />, title: "دفع آمن", description: "ادفع عند الاستلام، أو ببطاقتك، أو من محفظتك بأمان كامل.", badge: "05" },
  { icon: <Truck className="h-6 w-6" />, title: "توصيل سريع", description: "في نفس اليوم لأغلب الطلبات، مع تتبع لحظي لموقع السائق.", badge: "06" },
];

const categories = [
  { icon: <Package className="h-5 w-5" />, name: "بقالة", count: "120+ متجر" },
  { icon: <Package className="h-5 w-5" />, name: "صيدليات", count: "45+ متجر" },
  { icon: <Package className="h-5 w-5" />, name: "إلكترونيات", count: "30+ متجر" },
  { icon: <Package className="h-5 w-5" />, name: "ملابس", count: "60+ متجر" },
  { icon: <Package className="h-5 w-5" />, name: "أدوات منزل", count: "25+ متجر" },
  { icon: <Package className="h-5 w-5" />, name: "هدايا", count: "18+ متجر" },
];

function ShopsPage() {
  return (
    <>
      <PageHero
        eyebrow="طلبات المتاجر"
        icon={<Store className="h-5 w-5" />}
        title={<>متاجر مدينتك<span className="text-gradient"> في جيبك.</span></>}
        description="تسوّق من المتاجر المحلية — بقالة، صيدليات، إلكترونيات والمزيد — مع توصيل سريع وتتبع لحظي."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="الميزات" title="تجربة تسوق ذكية ومرنة" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="الفئات" title="كل ما تحتاجه في مكان واحد" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.name} className="card-elevated p-5 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                {c.icon}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold">{c.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{c.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-surface p-10 grid gap-8 md:grid-cols-4">
          {[
            { v: "نفس اليوم", l: "وقت التوصيل" },
            { v: "300+", l: "متجر شريك" },
            { v: "10K+", l: "منتج متاح" },
            { v: "★ 4.6", l: "متوسط التقييم" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-2xl md:text-3xl font-bold text-gradient">{s.v}</div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-6 py-3.5 text-sm font-semibold text-primary-foreground glow">
            <ShoppingCart className="h-4 w-4" /> لوحة المستخدم
          </Link>
          <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            <Store className="h-4 w-4" /> طلب طعام
          </Link>
        </div>
      </section>
    </>
  );
}
