import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, UserCheck, Building2, BarChart3, FileBarChart } from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة — وطن جو" },
      { name: "description", content: "لوحة إدارة وطن جو: إدارة المستخدمين، اعتماد السائقين، إدارة التجار، مراقبة الطلبات والتحليلات." },
      { property: "og:title", content: "لوحة الإدارة — وطن جو" },
      { property: "og:description", content: "مركز التحكم التشغيلي لمنصة وطن جو." },
    ],
  }),
  component: AdminPage,
});

const features = [
  { icon: <Users className="h-6 w-6" />, title: "إدارة المستخدمين", description: "ابحث وعاين وأدر حسابات المستخدمين. إيقاف، استعادة، ومراجعة سجل النشاط.", badge: "المستخدمون" },
  { icon: <UserCheck className="h-6 w-6" />, title: "اعتماد السائقين", description: "راجع الوثائق المرفوعة، تحقق من الهوية، واعتمد أو ارفض طلبات السائقين.", badge: "اعتماد" },
  { icon: <Building2 className="h-6 w-6" />, title: "إدارة التجار", description: "ضمّ المطاعم والمتاجر، راقب أداءها، وأدر العمولات.", badge: "التجار" },
  { icon: <BarChart3 className="h-6 w-6" />, title: "مراقبة الطلبات", description: "بث مباشر لكل رحلة وتوصيل وطلب نشط عبر المنصة.", badge: "مباشر" },
  { icon: <FileBarChart className="h-6 w-6" />, title: "التقارير والتحليلات", description: "الإيرادات وأحجام الرحلات وساعات الذروة والخرائط الحرارية ومسارات التحويل.", badge: "إحصاءات" },
];

function AdminPage() {
  return (
    <>
      <PageHero
        eyebrow="لوحة الإدارة"
        icon={<ShieldCheck className="h-5 w-5" />}
        title={<><span className="text-gradient">مركز التحكم</span> في المنصة.</>}
        description="لوحة خلفية واحدة تتيح لفريق التشغيل إدارة المستخدمين والسائقين والتجار والطلبات وكامل تدفق البيانات."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="أدوات الإدارة" title="خمس وحدات تحكم" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface p-10">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-cyan">لقطة لحظية</span>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {[
              { v: "12,438", l: "مستخدم نشط" },
              { v: "1,204", l: "سائق متصل" },
              { v: "318", l: "تاجر" },
              { v: "4,891", l: "طلب اليوم" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-background/50 p-5">
                <div className="font-display text-3xl font-bold text-gradient">{s.v}</div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
