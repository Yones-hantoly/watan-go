import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Star, Truck, UtensilsCrossed } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui-bits";
import { getRestaurantBySlug } from "@/lib/mock-restaurants";

export const Route = createFileRoute("/restaurants/$id")({
  head: ({ params }) => {
    const restaurant = getRestaurantBySlug(params.id);
    return {
      meta: [
        { title: `${restaurant?.name ?? "المطعم"} - حسن جو` },
        { name: "description", content: restaurant?.description ?? "تفاصيل مطعم وقائمته ببيانات mock." },
      ],
    };
  },
  component: RestaurantDetailsPage,
});

function RestaurantDetailsPage() {
  const { id } = Route.useParams();
  const restaurant = getRestaurantBySlug(id);

  if (!restaurant) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="card-elevated flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold">المطعم غير موجود</h1>
          <p className="mt-2 text-sm text-muted-foreground">تأكد من الرابط أو عد إلى صفحة المطاعم لتصفح الخيارات المتاحة.</p>
          <Link to="/restaurants" className="mt-6 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-3 text-sm font-semibold text-primary-foreground glow">
            العودة إلى المطاعم
          </Link>
        </div>
      </section>
    );
  }

  const menuCategories = Array.from(new Set(restaurant.menuItems.map((item) => item.category)));

  return (
    <>
      <PageHero
        eyebrow={restaurant.category}
        icon={<span className="text-xl">{restaurant.image}</span>}
        title={<>{restaurant.name} <span className="text-gradient">وقائمته الكاملة.</span></>}
        description={restaurant.description}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="space-y-6">
            <div className="card-elevated p-6">
              <SectionHeading eyebrow="المطعم" title="تفاصيل التوصيل" />
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                  <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> التقييم</span>
                  <span className="font-semibold text-foreground">{restaurant.rating}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                  <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-cyan" /> وقت التوصيل</span>
                  <span className="font-semibold text-foreground">{restaurant.deliveryTime}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                  <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> رسوم التوصيل</span>
                  <span className="font-semibold text-foreground">{restaurant.deliveryFee}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-secondary/30 px-4 py-3">
                  <span>الحالة</span>
                  <span className={`font-semibold ${restaurant.isOpen ? "text-emerald-600" : "text-slate-500"}`}>
                    {restaurant.isOpen ? "مفتوح الآن" : "مغلق حاليًا"}
                  </span>
                </div>
              </div>
            </div>

            <div className="card-elevated p-6">
              <SectionHeading eyebrow="القائمة" title="تصنيفات الوجبات" />
              <div className="mt-4 flex flex-wrap gap-2">
                {menuCategories.map((category) => (
                  <span key={category} className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            {menuCategories.map((category) => (
              <section key={category} className="card-elevated p-6">
                <SectionHeading eyebrow="الأصناف" title={category} />
                <div className="grid gap-4 md:grid-cols-2">
                  {restaurant.menuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <article key={item.id} className="rounded-2xl border border-border bg-secondary/20 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">{item.price}</div>
                        </div>
                        <button type="button" className="mt-5 cursor-pointer rounded-xl bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground glow transition-transform duration-200 hover:-translate-y-0.5">
                          إضافة للسلة
                        </button>
                      </article>
                    ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            <ArrowRight className="h-4 w-4" /> العودة إلى المطاعم
          </Link>
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            العودة إلى لوحة المستخدم
          </Link>
        </div>
      </section>
    </>
  );
}
