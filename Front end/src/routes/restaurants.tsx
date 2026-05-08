import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clock3, Search, Star, Store, Truck, UtensilsCrossed } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui-bits";
import { mockRestaurants, restaurantCategories, type RestaurantCategory } from "@/lib/mock-restaurants";
import { requireAuthForProtectedRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/restaurants")({
  beforeLoad: requireAuthForProtectedRoute,
  head: () => ({
    meta: [
      { title: "المطاعم - حسن جو" },
      { name: "description", content: "تصفّح المطاعم وخيارات توصيل الطعام بواجهة عربية جاهزة للتطوير." },
    ],
  }),
  component: RestaurantsPage,
});

function RestaurantsPage() {
  const [activeCategory, setActiveCategory] = useState<RestaurantCategory>("الكل");
  const filteredRestaurants =
    activeCategory === "الكل"
      ? mockRestaurants
      : mockRestaurants.filter((restaurant) => restaurant.category === activeCategory);

  return (
    <>
      <PageHero
        eyebrow="المطاعم"
        icon={<UtensilsCrossed className="h-5 w-5" />}
        title={<>اختر مطعمك <span className="text-gradient">واطلب فورًا.</span></>}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="card-elevated p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <SectionHeading eyebrow="التصفح" title="مطاعم حسب التصنيف" description="اختر التصنيف لتصفية المطاعم وعرض النتائج المناسبة فورًا." />
            </div>
            <div className="flex flex-wrap gap-2">
              {restaurantCategories.map((category) => {
                const active = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "border-primary bg-gradient-to-br from-primary/15 to-amber-500/10 text-primary shadow-sm"
                        : "border-border bg-secondary/40 hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="card-elevated mt-8 flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">لا توجد مطاعم ضمن هذا التصنيف حاليًا</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">جرّب تصنيفًا آخر أو ارجع إلى عرض جميع المطاعم.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
                <article key={restaurant.id} className="card-elevated p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl font-bold">{restaurant.name}</h2>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            restaurant.isOpen ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-500/15 text-slate-500"
                          }`}
                        >
                          {restaurant.isOpen ? "مفتوح" : "مغلق"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{restaurant.description}</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-2xl">
                      <span aria-hidden>{restaurant.image}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1">
                      <Search className="h-3.5 w-3.5" /> {restaurant.category}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1">
                      <Star className="h-3.5 w-3.5" /> {restaurant.rating}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1">
                      <Clock3 className="h-3.5 w-3.5" /> {restaurant.deliveryTime}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1">
                      <Truck className="h-3.5 w-3.5" /> رسوم {restaurant.deliveryFee}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-border/70 bg-secondary/20 p-4">
                    <div className="text-xs font-semibold text-muted-foreground">أبرز الأصناف</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {restaurant.menuItems.slice(0, 3).map((item) => (
                        <span key={item.id} className="rounded-full bg-background px-3 py-1 text-xs font-medium text-foreground">
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/menu/$restaurantSlug"
                      params={{ restaurantSlug: restaurant.slug }}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-3 text-sm font-semibold text-primary-foreground glow transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      تصفح القائمة
                    </Link>
                  </div>
                </article>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            العودة إلى لوحة المستخدم
          </Link>
        </div>
      </section>
    </>
  );
}
