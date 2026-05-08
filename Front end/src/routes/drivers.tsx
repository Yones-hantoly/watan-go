import { createFileRoute } from "@tanstack/react-router";
import { Truck, FileCheck, Bell, Navigation, Wallet } from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/drivers")({
  head: () => ({
    meta: [
      { title: "واجهة السائق — وطن جو" },
      { name: "description", content: "كيف يسجّل سائقو وطن جو ويستلمون الرحلات ويتنقّلون ويتابعون أرباحهم." },
      { property: "og:title", content: "واجهة السائق — وطن جو" },
      { property: "og:description", content: "جولة في تطبيق السائق داخل وطن جو." },
    ],
  }),
  component: DriversPage,
});

const features = [
  { icon: <FileCheck className="h-6 w-6" />, title: "التسجيل بالوثائق", description: "يرفع السائق رخصة القيادة ووثائق المركبة والتأمين لاعتمادها من الإدارة قبل بدء العمل.", badge: "01" },
  { icon: <Bell className="h-6 w-6" />, title: "استقبال الطلبات", description: "إشعارات لحظية بتفاصيل الرحلة والأجرة المتوقعة مع قبول أو رفض بضغطة واحدة.", badge: "02" },
  { icon: <Navigation className="h-6 w-6" />, title: "الملاحة والتتبع", description: "ملاحة خطوة بخطوة مع بث الموقع لحظياً للعميل لرؤية وقت الوصول بشفافية.", badge: "03" },
  { icon: <Wallet className="h-6 w-6" />, title: "لوحة الأرباح", description: "أرباح يومية وأسبوعية وشهرية مع سجل الرحلات والبقشيش وجدول الصرف.", badge: "04" },
];

function DriversPage() {
  return (
    <>
      <PageHero
        eyebrow="واجهة السائق"
        icon={<Truck className="h-5 w-5" />}
        title={<>أدوات تُبقي <span className="text-gradient">السائقين يكسبون.</span></>}
        description="لوحة تحكم مركّزة لقبول الرحلات والتنقل بثقة ومتابعة الدخل لحظياً."
      />
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="تطبيق السائق" title="القدرات الأساسية" />
        <div className="grid gap-5 md:grid-cols-2">
          {features.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-surface p-10 grid gap-8 md:grid-cols-3">
          {[
            { v: "<3 ث", l: "زمن الاستجابة" },
            { v: "GPS", l: "تحديثات موقع لحظية" },
            { v: "يومي", l: "تسوية الأرباح" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-display text-4xl font-bold text-gradient">{s.v}</div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
