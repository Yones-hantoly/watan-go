import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHero, SectionHeading } from "@/components/ui-bits";
import { getAuth } from "@/lib/auth";
import {
  createOrder,
  getCartItems,
  getCartSubtotal,
  getDeliveryFee,
  removeCartItem,
  subscribeToCart,
  updateCartQuantity,
  type CartItem,
} from "@/lib/commerce";
import { requireAuthForProtectedRoute } from "@/lib/route-guards";

export const Route = createFileRoute("/cart")({
  beforeLoad: requireAuthForProtectedRoute,
  component: CartPage,
});

function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("شارع الجامعة، الطابق الثالث");

  const refreshCart = () => setItems(getCartItems());

  useEffect(() => {
    refreshCart();
    return subscribeToCart(refreshCart);
  }, []);

  const subtotal = getCartSubtotal(items);
  const deliveryFee = getDeliveryFee(items);
  const total = subtotal + deliveryFee;

  const confirmOrder = () => {
    const user = getAuth();
    if (!user) return;

    const order = createOrder(user, address.trim() || "عنوان غير محدد");
    if (!order) {
      toast.error("السلة فارغة");
      return;
    }

    toast.success(`تم تأكيد الطلب ${order.id}`);
    refreshCart();
  };

  return (
    <>
      <PageHero
        eyebrow="السلة"
        icon={<ShoppingCart className="h-5 w-5" />}
        title={<>راجع طلبك <span className="text-gradient">قبل التأكيد.</span></>}
        description="عدّل الكميات، احذف العناصر، ثم أرسل الطلب إلى المطعم أو المتجر وشركة التوصيل."
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {items.length === 0 ? (
          <div className="card-elevated flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <ShoppingCart className="h-10 w-10 text-primary" />
            <h1 className="mt-5 font-display text-3xl font-bold">السلة فارغة</h1>
            <p className="mt-2 text-sm text-muted-foreground">أضف وجبات أو منتجات بقالة لتظهر هنا.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/restaurants" className="rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-3 text-sm font-semibold text-primary-foreground glow">
                طلب طعام
              </Link>
              <Link to="/shops" className="rounded-xl border border-border bg-secondary/50 px-5 py-3 text-sm font-semibold">
                التسوق
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <article key={`${item.vendorId}-${item.id}`} className="card-elevated p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-2xl">
                        <span aria-hidden>{item.image}</span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-primary">{item.vendorName}</div>
                        <h2 className="mt-1 font-display text-lg font-bold">{item.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        <div className="mt-2 font-bold text-primary">{item.price} شيكل</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.vendorId, item.quantity - 1)}
                        className="rounded-lg border border-border bg-secondary/40 p-2 transition-colors hover:bg-secondary"
                        aria-label="تقليل الكمية"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-8 text-center font-mono text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.vendorId, item.quantity + 1)}
                        className="rounded-lg border border-border bg-secondary/40 p-2 transition-colors hover:bg-secondary"
                        aria-label="زيادة الكمية"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCartItem(item.id, item.vendorId)}
                        className="rounded-lg border border-border bg-secondary/40 p-2 text-destructive transition-colors hover:bg-destructive/10"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="card-elevated h-fit p-6">
              <SectionHeading eyebrow="الدفع" title="ملخص الطلب" />
              <label className="block text-sm font-semibold text-muted-foreground" htmlFor="address">
                عنوان التوصيل
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between"><span>المجموع الفرعي</span><span>{subtotal} شيكل</span></div>
                <div className="flex justify-between"><span>رسوم التوصيل</span><span>{deliveryFee} شيكل</span></div>
                <div className="flex justify-between border-t border-border pt-3 font-display text-xl font-bold">
                  <span>الإجمالي</span><span className="text-primary">{total} شيكل</span>
                </div>
              </div>
              <button
                type="button"
                onClick={confirmOrder}
                className="mt-6 w-full rounded-xl bg-gradient-to-br from-primary to-primary/80 px-5 py-3 text-sm font-bold text-primary-foreground glow transition-transform hover:-translate-y-0.5"
              >
                تأكيد الطلب
              </button>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
