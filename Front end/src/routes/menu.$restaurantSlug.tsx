import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, Plus, ShoppingCart, Star, Truck, UtensilsCrossed } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/ui-bits";
import { showCartItemAddedToast } from "@/lib/cart-notifications";
import { addCartItem } from "@/lib/commerce";
import { getRestaurantBySlug } from "@/lib/mock-restaurants";
import { requireAuthForProtectedRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/menu/$restaurantSlug")({
  beforeLoad: requireAuthForProtectedRoute,
  head: ({ params }) => {
    const restaurant = getRestaurantBySlug(params.restaurantSlug);
    return {
      meta: [
        { title: `${restaurant?.name ?? "القائمة"} — قائمة الطعام | وطن جو` },
        {
          name: "description",
          content: restaurant
            ? `تصفح قائمة ${restaurant.name} وأسعار الوجبات والتصنيفات.`
            : "قائمة الطعام غير موجودة.",
        },
      ],
    };
  },
  pendingComponent: MenuLoading,
  component: RestaurantMenuPage,
});

function MenuLoading() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="card-elevated flex min-h-56 items-center justify-center p-6 text-center">
        <div className="font-mono text-sm text-muted-foreground">جار تحميل القائمة...</div>
      </div>
    </section>
  );
}

function RestaurantMenuPage() {
  const { restaurantSlug } = Route.useParams();
  const restaurant = getRestaurantBySlug(restaurantSlug);

  if (!restaurant) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="card-elevated flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold">القائمة غير موجودة</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            لم نتمكن من العثور على قائمة هذا المطعم. عد إلى صفحة المطاعم واختر مطعمًا آخر.
          </p>
          <Link
            to="/restaurants"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-3 text-sm font-semibold text-primary-foreground glow"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى المطاعم
          </Link>
        </div>
      </section>
    );
  }

  const menuCategories = Array.from(new Set(restaurant.menuItems.map((item) => item.category)));
  const addMealToCart = (item: (typeof restaurant.menuItems)[number]) => {
    addCartItem({
      id: item.id,
      type: "food",
      name: item.name,
      description: item.description,
      price: Number.parseFloat(item.price.replace(/[^\d.]/g, "")) || 0,
      image: restaurant.image,
      vendorId: restaurant.id,
      vendorName: restaurant.name,
    });
    showCartItemAddedToast();
  };

  return (
    <>
      <PageHero
        eyebrow="قائمة الطعام"
        icon={<span className="text-xl">{restaurant.image}</span>}
        title={<>{restaurant.name} <span className="text-gradient">قائمة الطلبات.</span></>}
        description={restaurant.description}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="space-y-6">
            <div className="card-elevated overflow-hidden">
              <div className="flex min-h-44 items-center justify-center bg-gradient-to-br from-primary/20 via-secondary to-cyan/20 text-7xl">
                <span aria-hidden>{restaurant.image}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">{restaurant.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{restaurant.category}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      restaurant.isOpen ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-500/15 text-slate-500"
                    }`}
                  >
                    {restaurant.isOpen ? "مفتوح" : "مغلق"}
                  </span>
                </div>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
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
                </div>
              </div>
            </div>

            <div className="card-elevated p-6">
              <SectionHeading eyebrow="التصنيفات" title="أقسام القائمة" />
              <div className="mt-4 flex flex-wrap gap-2">
                {menuCategories.map((category) => (
                  <a
                    key={category}
                    href={`#${category}`}
                    className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
                  >
                    {category}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            {menuCategories.map((category) => (
              <section key={category} id={category} className="card-elevated p-6 scroll-mt-24">
                <SectionHeading eyebrow="الوجبات" title={category} />
                <div className="grid gap-4 md:grid-cols-2">
                  {restaurant.menuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <article key={item.id} className="rounded-2xl border border-border bg-secondary/20 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background text-2xl">
                            <span aria-hidden>{restaurant.image}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-display text-lg font-semibold">{item.name}</h3>
                              <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                                {item.price}
                              </div>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addMealToCart(item)}
                          className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground glow transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto"
                        >
                          <Plus className="h-4 w-4" />
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
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى المطاعم
          </Link>
          <Link
            to="/dashboard/customer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold"
          >
            <ShoppingCart className="h-4 w-4" />
            لوحة المستخدم
          </Link>
        </div>
      </section>
    </>
  );
}
