import { createFileRoute } from "@tanstack/react-router";
import { Mail, GraduationCap, Code2 } from "lucide-react";
import { PageHero } from "@/components/ui-bits";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "حول وطن جو — وطن جو" },
      { name: "description", content: "حول منصة وطن جو والفريق وكيفية التواصل." },
      { property: "og:title", content: "حول وطن جو — وطن جو" },
      { property: "og:description", content: "وطن جو — منصة موحدة متعددة الخدمات للتنقل والتوصيل والتسوق." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="حول وطن جو"
        icon={<Mail className="h-5 w-5" />}
        title={<>حول <span className="text-gradient">وطن جو.</span></>}
        description="منصة موحدة متعددة الخدمات تجمع بين النقل وتوصيل الطعام وطلبات المتاجر."
      />

      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="card-elevated p-10">
          <h2 className="font-display text-2xl font-bold">وصف المنصة</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            وطن جو منصة متعددة الخدمات تجمع بين النقل وتوصيل الطعام وطلبات المتاجر في نظام موحد
            واحد. مصممة لتوفير تجربة سلسة وآمنة للمستخدمين عبر خمسة أدوار مختلفة، مع تتبع لحظي
            ومطابقة ذكية ومنطق تسعير شفاف.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <div className="flex items-center gap-2 text-primary">
                <Code2 className="h-4 w-4" />
                <span className="font-mono text-xs uppercase tracking-wider">المطور</span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold">فريق وطن جو</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-5">
              <div className="flex items-center gap-2 text-cyan">
                <Mail className="h-4 w-4" />
                <span className="font-mono text-xs uppercase tracking-wider">التواصل</span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold">hello@watango.app</p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-cyan/30 bg-cyan/5 p-6">
            <h3 className="font-display text-base font-semibold text-cyan">تواصل معنا</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              للاستفسارات، الشراكات، أو التعاون في منصة وطن جو، تواصل عبر البريد الإلكتروني.
            </p>
            <a
              href="mailto:hello@watango.app"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-3 text-sm font-semibold text-primary-foreground glow"
              dir="ltr"
            >
              <Mail className="h-4 w-4" />
              hello@watango.app
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
