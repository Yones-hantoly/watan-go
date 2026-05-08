import { createFileRoute, Link } from "@tanstack/react-router";
import { Car, Clock3, MapPin, Navigation, Wallet } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui-bits";

export const Route = createFileRoute("/ride-request")({
  head: () => ({
    meta: [
      { title: "طلب رحلة - حسن جو" },
      { name: "description", content: "واجهة frontend لطلب رحلة مع بيانات mock وجاهزة للربط لاحقًا." },
    ],
  }),
  component: RideRequestPage,
});

const rideTypes = [
  { name: "رحلة عادية", eta: "3 دقائق", price: "12 شيكل", accent: "text-primary" },
  { name: "رحلة عائلية", eta: "6 دقائق", price: "18 شيكل", accent: "text-cyan" },
  { name: "رحلة مريحة", eta: "8 دقائق", price: "24 شيكل", accent: "text-amber" },
];

const recentPlaces = ["الجامعة", "وسط البلد", "المستشفى", "المنزل"];

function RideRequestPage() {
  return (
    <>
      <PageHero
        eyebrow="طلب رحلة"
        icon={<Car className="h-5 w-5" />}
        title={<>احجز رحلتك <span className="text-gradient">بخطوات واضحة.</span></>}
        description="واجهة طلب رحلة frontend فقط، تعرض نقاط الانطلاق والوصول والتقدير السعري بشكل مرتب مع بيانات mock قابلة للتطوير."
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-elevated p-6">
            <SectionHeading eyebrow="الطلب" title="إلى أين تريد الذهاب؟" description="واجهة جاهزة للربط لاحقًا مع الخرائط والتسعير الفعلي." />

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-cyan">
                  <Navigation className="h-4 w-4" />
                  نقطة الانطلاق
                </div>
                <div className="mt-2 text-sm text-muted-foreground">شارع الجامعة، البوابة الغربية</div>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <MapPin className="h-4 w-4" />
                  الوجهة
                </div>
                <div className="mt-2 text-sm text-muted-foreground">مستشفى المدينة، المدخل الرئيسي</div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-xs text-muted-foreground">المسافة التقديرية</div>
                <div className="mt-1 font-display text-xl font-bold">6.4 كم</div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-xs text-muted-foreground">المدة المتوقعة</div>
                <div className="mt-1 font-display text-xl font-bold">14 دقيقة</div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-xs text-muted-foreground">طريقة الدفع</div>
                <div className="mt-1 inline-flex items-center gap-2 font-display text-xl font-bold">
                  <Wallet className="h-4 w-4 text-primary" />
                  نقدًا
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-elevated p-6">
              <SectionHeading eyebrow="الخيارات" title="أنواع الرحلات المتاحة" />
              <div className="mt-5 space-y-3">
                {rideTypes.map((ride, index) => (
                  <button
                    key={ride.name}
                    type="button"
                    className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 text-right transition-all ${
                      index === 0 ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div>
                      <div className="font-display font-bold">{ride.name}</div>
                      <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" /> {ride.eta}
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${ride.accent}`}>{ride.price}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card-elevated p-6">
              <SectionHeading eyebrow="أماكن سريعة" title="وجهات متكررة" />
              <div className="mt-5 flex flex-wrap gap-2">
                {recentPlaces.map((place) => (
                  <button key={place} type="button" className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary">
                    {place}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="w-full rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-4 text-sm font-bold text-primary-foreground glow">
              تأكيد طلب الرحلة
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            العودة إلى لوحة المستخدم
          </Link>
          <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            طلب طعام
          </Link>
          <Link to="/shops" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            التسوق
          </Link>
        </div>
      </section>
    </>
  );
}
