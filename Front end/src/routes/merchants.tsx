import { createFileRoute } from "@tanstack/react-router";
import { ChefHat, Store, Menu, ClipboardList, Activity, ShoppingCart, Package, CreditCard } from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/merchants")({
  head: () => ({
    meta: [
      { title: "المطاعم والمتاجر — وطن جو" },
      { name: "description", content: "إدارة قوائم الطعام، تدفق الطلبات، تصفّح المنتجات، السلة والدفع للمطاعم والمتاجر على وطن جو." },
      { property: "og:title", content: "المطاعم والمتاجر — وطن جو" },
      { property: "og:description", content: "أدوات التجار وتجربة التسوق للعملاء على وطن جو." },
    ],
  }),
  component: MerchantsPage,
});

const restaurant = [
  { icon: <Menu className="h-6 w-6" />, title: "إدارة قائمة الطعام", description: "إضافة وتعديل وحذف الأصناف مع الصور والفئات والأسعار وحالة التوفر.", badge: "القائمة" },
  { icon: <ClipboardList className="h-6 w-6" />, title: "إدارة الطلبات", description: "قائمة لحظية بالطلبات الواردة مع زمن التحضير المتوقع وملاحظات العميل.", badge: "الطلبات" },
  { icon: <Activity className="h-6 w-6" />, title: "تحديث الحالة", description: "حدّد الطلب: مستلَم، قيد التحضير، جاهز، خارج للتوصيل — متزامن مع تطبيق المستخدم.", badge: "الحالة" },
];

const shop = [
  { icon: <Store className="h-6 w-6" />, title: "عرض المتجر", description: "ملف متجر قابل للاكتشاف مع ساعات العمل والموقع والتقييمات والفئات.", badge: "اكتشاف" },
  { icon: <Package className="h-6 w-6" />, title: "تصفّح المنتجات", description: "فهرس منتجات قابل للبحث مع فئات وصور وحالة المخزون والأسعار.", badge: "كتالوج" },
  { icon: <ShoppingCart className="h-6 w-6" />, title: "نظام السلة", description: "سلة متعددة الأصناف مع التحكم بالكميات والإجمالي ومعاينة رسوم التوصيل.", badge: "السلة" },
  { icon: <CreditCard className="h-6 w-6" />, title: "إتمام الشراء", description: "تأكيد العنوان ومراجعة الطلب وتأكيد الدفع نقداً عند الاستلام.", badge: "الدفع" },
];

function MerchantsPage() {
  return (
    <>
      <PageHero
        eyebrow="المطاعم والمتاجر"
        icon={<ChefHat className="h-5 w-5" />}
        title={<>حيث <span className="text-gradient">يلتقي التجار</span> بالمنصة.</>}
        description="تجربتان متميزتان للتجار — المطاعم تدير المطبخ، والمتاجر تدير المخزون — كلاهما يعمل على نفس نظام وطن جو الخلفي."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="المطاعم"
          title="أدر المطبخ، ودع التقنية لنا."
          description="لوحة تحكم نظيفة لقوائم الطعام والطلبات الواردة وتحديثات الحالة اللحظية."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {restaurant.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="المتاجر"
          title="من الرفّ إلى باب البيت."
          description="المتاجر تعرض منتجاتها، والعملاء يتصفحون ويشترون — كل ذلك داخل تطبيق وطن جو."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {shop.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>
    </>
  );
}
