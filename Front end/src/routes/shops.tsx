import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Store, ShoppingCart, Truck, Tag, Boxes, CreditCard,
  Search, X, SlidersHorizontal, ChevronDown, PackageX,
} from "lucide-react";
import { PageHero, FeatureCard, SectionHeading } from "@/components/ui-bits";
import { showCartItemAddedToast } from "@/lib/cart-notifications";
import { addCartItem, groceryItems, type GroceryItem } from "@/lib/commerce";
import { requireAuthForProtectedRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/shops")({
  beforeLoad: requireAuthForProtectedRoute,
  head: () => ({
    meta: [
      { title: "طلبات المتاجر — وطن جو" },
      { name: "description", content: "تسوّق من المتاجر المحلية في وطن جو واستلم مشترياتك في نفس اليوم." },
      { property: "og:title", content: "طلبات المتاجر — وطن جو" },
      { property: "og:description", content: "بقالة طازجة وأساسيات يومية — توصيل سريع إلى بابك." },
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

type SortKey = "default" | "price-asc" | "price-desc" | "rating" | "popular" | "newest";
type StockFilter = "all" | "in-stock" | "out-of-stock";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "default",    label: "الترتيب الافتراضي" },
  { value: "price-asc",  label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "rating",     label: "الأعلى تقييماً" },
  { value: "popular",    label: "الأكثر شعبية" },
  { value: "newest",     label: "الأحدث" },
];

const ALL_CATEGORIES = ["الكل", ...Array.from(new Set(groceryItems.map((i) => i.category)))];
const MAX_PRICE = Math.max(...groceryItems.map((i) => i.price));

function useProductFilter() {
  const [query, setQuery]           = useState("");
  const [category, setCategory]     = useState("الكل");
  const [sort, setSort]             = useState<SortKey>("default");
  const [stock, setStock]           = useState<StockFilter>("all");
  const [minPrice, setMinPrice]     = useState(0);
  const [maxPrice, setMaxPrice]     = useState(MAX_PRICE);
  const [onlyPopular, setOnlyPopular] = useState(false);
  const [onlyNew, setOnlyNew]       = useState(false);
  const [minRating, setMinRating]   = useState(0);

  const hasActiveFilters =
    query !== "" ||
    category !== "الكل" ||
    sort !== "default" ||
    stock !== "all" ||
    minPrice !== 0 ||
    maxPrice !== MAX_PRICE ||
    onlyPopular ||
    onlyNew ||
    minRating !== 0;

  const reset = () => {
    setQuery(""); setCategory("الكل"); setSort("default");
    setStock("all"); setMinPrice(0); setMaxPrice(MAX_PRICE);
    setOnlyPopular(false); setOnlyNew(false); setMinRating(0);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = groceryItems.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q) &&
               !item.category.toLowerCase().includes(q) &&
               !item.description.toLowerCase().includes(q) &&
               !item.storeName.toLowerCase().includes(q)) return false;
      if (category !== "الكل" && item.category !== category) return false;
      if (stock === "in-stock"     && !item.inStock) return false;
      if (stock === "out-of-stock" &&  item.inStock) return false;
      if (item.price < minPrice || item.price > maxPrice) return false;
      if (onlyPopular && !item.isPopular) return false;
      if (onlyNew     && !item.isNew)     return false;
      if (item.rating < minRating)        return false;
      return true;
    });

    switch (sort) {
      case "price-asc":  list = [...list].sort((a, b) => a.price - b.price);   break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price);   break;
      case "rating":     list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "popular":    list = [...list].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)); break;
      case "newest":     list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));        break;
    }

    return list;
  }, [query, category, sort, stock, minPrice, maxPrice, onlyPopular, onlyNew, minRating]);

  return {
    query, setQuery, category, setCategory, sort, setSort,
    stock, setStock, minPrice, setMinPrice, maxPrice, setMaxPrice,
    onlyPopular, setOnlyPopular, onlyNew, setOnlyNew,
    minRating, setMinRating, results, hasActiveFilters, reset,
  };
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400 text-xs font-semibold">
      ★ {value.toFixed(1)}
    </span>
  );
}

function ProductCard({ item, onAdd }: { item: GroceryItem; onAdd: (item: GroceryItem) => void }) {
  return (
    <article className={`card-elevated p-6 flex flex-col transition-opacity duration-200 ${!item.inStock ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary">{item.category}</span>
            {item.isNew     && <span className="rounded-full bg-cyan/15 text-cyan px-2 py-0.5 text-[10px] font-bold">جديد</span>}
            {item.isPopular && <span className="rounded-full bg-amber/15 text-amber px-2 py-0.5 text-[10px] font-bold">الأكثر طلباً</span>}
            {!item.inStock  && <span className="rounded-full bg-destructive/15 text-destructive px-2 py-0.5 text-[10px] font-bold">نفد المخزون</span>}
          </div>
          <h3 className="mt-2 font-display text-lg font-bold leading-snug">{item.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary text-2xl">
          <span aria-hidden>{item.image}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">{item.storeName}</div>
        <StarRating value={item.rating} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="font-display text-xl font-bold text-primary">{item.price} شيكل</div>
        <button
          type="button"
          disabled={!item.inStock}
          onClick={() => onAdd(item)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-primary-foreground glow transition-transform duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          إضافة للسلة
        </button>
      </div>
    </article>
  );
}

function ShopsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const f = useProductFilter();

  const addGroceryToCart = (item: GroceryItem) => {
    addCartItem({
      id: item.id, type: "grocery", name: item.name,
      description: item.description, price: item.price,
      image: item.image, vendorId: item.storeId, vendorName: item.storeName,
    });
    showCartItemAddedToast();
  };

  return (
    <>
      <PageHero
        eyebrow="طلبات المتاجر"
        icon={<Store className="h-5 w-5" />}
        title={<>متاجر مدينتك<span className="text-gradient"> في جيبك.</span></>}
        description="تسوّق من متاجر البقالة المحلية — أساسيات يومية وخضار وفواكه — مع توصيل سريع وتتبع لحظي."
      />

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="الميزات" title="تجربة تسوق ذكية ومرنة" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => <FeatureCard key={feat.title} {...feat} />)}
        </div>
      </section>

      {/* ── Products + Search/Filter ── */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHeading eyebrow="المنتجات" title="منتجات متاحة للطلب" />

        {/* Search bar + sort + filter toggle */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={f.query}
              onChange={(e) => f.setQuery(e.target.value)}
              placeholder="ابحث عن منتج، فئة، متجر..."
              className="w-full rounded-xl border border-border bg-secondary/40 py-3 pe-10 ps-4 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {f.query && (
              <button
                type="button"
                onClick={() => f.setQuery("")}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="مسح البحث"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort select */}
          <div className="relative shrink-0">
            <select
              value={f.sort}
              onChange={(e) => f.setSort(e.target.value as SortKey)}
              className="w-full appearance-none rounded-xl border border-border bg-secondary/40 py-3 pe-9 ps-4 text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
              filtersOpen || f.hasActiveFilters
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border bg-secondary/40 hover:bg-secondary"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            فلترة
            {f.hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                !
              </span>
            )}
          </button>
        </div>

        {/* Expandable filter panel */}
        {filtersOpen && (
          <div className="mt-4 card-elevated p-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Category */}
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">الفئة</div>
              <div className="flex flex-wrap gap-2">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => f.setCategory(cat)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      f.category === cat
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                نطاق السعر: {f.minPrice}–{f.maxPrice} شيكل
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">الحد الأدنى</label>
                  <input
                    type="range" min={0} max={MAX_PRICE} step={1}
                    value={f.minPrice}
                    onChange={(e) => f.setMinPrice(Math.min(Number(e.target.value), f.maxPrice - 1))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">الحد الأقصى</label>
                  <input
                    type="range" min={0} max={MAX_PRICE} step={1}
                    value={f.maxPrice}
                    onChange={(e) => f.setMaxPrice(Math.max(Number(e.target.value), f.minPrice + 1))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Availability + badges */}
            <div className="space-y-4">
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">التوفر</div>
                <div className="flex flex-wrap gap-2">
                  {([ ["all", "الكل"], ["in-stock", "متوفر"], ["out-of-stock", "نفد"] ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => f.setStock(val)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        f.stock === val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/40 hover:bg-secondary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">خصائص</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => f.setOnlyPopular((v) => !v)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      f.onlyPopular
                        ? "border-amber/60 bg-amber/10 text-amber"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    الأكثر طلباً
                  </button>
                  <button
                    type="button"
                    onClick={() => f.setOnlyNew((v) => !v)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      f.onlyNew
                        ? "border-cyan/60 bg-cyan/10 text-cyan"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    جديد
                  </button>
                </div>
              </div>
            </div>

            {/* Min rating + reset */}
            <div className="space-y-4">
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  الحد الأدنى للتقييم: {f.minRating > 0 ? `★ ${f.minRating}+` : "الكل"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[0, 4, 4.5, 4.8].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => f.setMinRating(r)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        f.minRating === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/40 hover:bg-secondary"
                      }`}
                    >
                      {r === 0 ? "الكل" : `★ ${r}+`}
                    </button>
                  ))}
                </div>
              </div>

              {f.hasActiveFilters && (
                <button
                  type="button"
                  onClick={f.reset}
                  className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" /> إعادة تعيين الفلاتر
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {f.results.length === groceryItems.length
              ? `عرض جميع المنتجات (${groceryItems.length})`
              : `${f.results.length} نتيجة من أصل ${groceryItems.length}`}
          </p>
          {f.hasActiveFilters && (
            <button
              type="button"
              onClick={f.reset}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              مسح الفلاتر
            </button>
          )}
        </div>

        {/* Product grid */}
        {f.results.length === 0 ? (
          <div className="mt-8 card-elevated flex min-h-64 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
              <PackageX className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">لا توجد منتجات مطابقة</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                جرّب تعديل كلمة البحث أو تغيير الفلاتر المحددة.
              </p>
            </div>
            <button
              type="button"
              onClick={f.reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" /> مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {f.results.map((item) => (
              <ProductCard key={item.id} item={item} onAdd={addGroceryToCart} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl border border-border bg-surface p-10 grid gap-8 md:grid-cols-4">
          {[
            { v: "نفس اليوم", l: "وقت التوصيل" },
            { v: "300+",      l: "متجر شريك" },
            { v: "10K+",      l: "منتج متاح" },
            { v: "★ 4.6",    l: "متوسط التقييم" },
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
