import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, ChefHat, Clock3, ClipboardList, ImageIcon, PackageCheck, Pencil, Plus, Tag, Trash2, TrendingUp, XCircle } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard-shell";
import { cn } from "@/lib/utils";
import { getOrders, subscribeToOrders, updateOrderStatus, type Order } from "@/lib/commerce";
import {
  advanceOrderDeliveryStage,
  DELIVERY_STAGES,
  getOrderDeliveryStage,
  isFinalDeliveryStage,
  setOrderDeliveryStage,
} from "@/lib/delivery-flow";
import type { AuthUser } from "@/lib/auth";

type RestaurantView = "orders" | "menu";
type MealCategory = "شاورما" | "برجر" | "مشاوي" | "حلويات" | "فطور";

interface RestaurantMeal {
  id: string;
  name: string;
  description: string;
  price: string;
  category: MealCategory;
  image: string;
  prepTime: string;
  available: boolean;
}

const mealCategories: MealCategory[] = ["شاورما", "برجر", "مشاوي", "حلويات", "فطور"];

const initialRestaurantMeals: RestaurantMeal[] = [
  {
    id: "meal-1",
    name: "وجبة شاورما دجاج",
    description: "شاورما دجاج مع بطاطا، مخلل، وثومية بيتية.",
    price: "24",
    category: "شاورما",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80",
    prepTime: "18 دقيقة",
    available: true,
  },
  {
    id: "meal-2",
    name: "برجر كلاسيك",
    description: "لحم مشوي، جبنة، خس، وطماطم مع صوص خاص.",
    price: "28",
    category: "برجر",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    prepTime: "15 دقيقة",
    available: true,
  },
  {
    id: "meal-3",
    name: "مشاوي مشكلة",
    description: "تشكيلة كباب وشيش طاووق مع سلطات وخبز طازج.",
    price: "65",
    category: "مشاوي",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    prepTime: "25 دقيقة",
    available: false,
  },
];

const emptyMealForm: Omit<RestaurantMeal, "id"> = {
  name: "",
  description: "",
  price: "",
  category: "شاورما",
  image: "",
  prepTime: "",
  available: true,
};

const restaurantTabs: Array<{ view: RestaurantView; to: "/dashboard/restaurant/orders" | "/dashboard/restaurant/menu"; label: string; icon: ReactNode }> = [
  { view: "orders", to: "/dashboard/restaurant/orders", label: "إدارة الطلبات", icon: <ClipboardList className="h-4 w-4" /> },
  { view: "menu", to: "/dashboard/restaurant/menu", label: "القائمة", icon: <ChefHat className="h-4 w-4" /> },
];

export function RestaurantDashboardPage({ user, view = "orders" }: { user: AuthUser; view?: RestaurantView }) {
  return (
    <RestaurantDashboardLayout user={user}>
      {view === "menu" ? <RestaurantMenuManagementPanel /> : <RestaurantOrdersManagementPanel />}
    </RestaurantDashboardLayout>
  );
}

function RestaurantDashboardLayout({ user, children }: { user: AuthUser; children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const isActiveTab = (view: RestaurantView) =>
    view === "orders"
      ? pathname === "/dashboard/restaurant" || pathname === "/dashboard/restaurant/orders"
      : pathname === "/dashboard/restaurant/menu";

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <div>
          <h1 className="font-display text-3xl font-bold">لوحة المطعم</h1>
          <p className="mt-2 text-muted-foreground">{user.name} · أدر طلباتك وقائمتك من مكان واحد</p>
        </div>

        <nav className="flex w-full flex-wrap gap-2 rounded-xl border border-border bg-secondary/30 p-1.5 sm:w-fit">
          {restaurantTabs.map((tab) => (
            <Link
              key={tab.view}
              to={tab.to}
              activeOptions={{ exact: true }}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground",
                isActiveTab(tab.view) && "bg-background text-foreground shadow-sm",
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </nav>
      </section>

      {children}
    </div>
  );
}

function RestaurantOrdersPanel({ user }: { user: AuthUser }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const refresh = () => setOrders(getOrders().filter((order) => order.type === "food"));
  const setStatus = (id: string, status: Order["status"]) => {
    updateOrderStatus(id, status);
    if (status === "accepted") setOrderDeliveryStage(id, "accepted");
    refresh();
  };
  const advanceStatus = (id: string) => {
    const updatedOrder = advanceOrderDeliveryStage(id);
    if (!updatedOrder) return;
    if (isFinalDeliveryStage(getOrderDeliveryStage(updatedOrder))) {
      toast.success("تم تسليم الطلب للعميل");
      refresh();
      return;
    }
    toast.success("تم تحديث مرحلة الطلب");
    refresh();
  };

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, []);

  const activeOrders = orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const completedOrders = orders.filter((order) => order.status === "delivered");

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="طلبات نشطة" value={String(activeOrders.length)} accent="primary" />
        <StatCard label="مبيعات اليوم" value="٨٤٠ ₪" accent="amber" />
        <StatCard label="متوسط التحضير" value="١٨ د" accent="cyan" />
        <StatCard label="تقييم المطعم" value="٤.٧ ⭐" accent="amber" />
      </section>

      <section className="card-elevated p-6">
        <h2 className="font-display text-xl font-bold">طلبات الطعام الواردة</h2>
        <div className="mt-4 space-y-3">
          {activeOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات طعام حالية.</div>
          ) : (
            activeOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-secondary/30 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-cyan">{order.id}</span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">{order.status}</span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}
                    </div>
                    <OrderProgress order={order} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setStatus(order.id, "accepted")} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">قبول</button>
                    <button onClick={() => setStatus(order.id, "preparing")} className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold">تحضير</button>
                    <button onClick={() => advanceStatus(order.id)} className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-500">التالي</button>
                    <button onClick={() => setStatus(order.id, "cancelled")} className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">رفض</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="card-elevated p-6">
        <h2 className="font-display text-xl font-bold">الطلبات المكتملة</h2>
        <div className="mt-4 space-y-3">
          {completedOrders.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد طلبات مكتملة بعد.</div>
          ) : (
            completedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div>
                  <span className="font-mono text-sm font-bold text-emerald-500">{order.id}</span>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">مكتمل</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card-elevated p-6">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-amber" />
            <h2 className="font-display text-lg font-bold">قائمتي</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">٢٤ صنف نشط · ٣ غير متوفر</p>
          <Link to="/dashboard/restaurant/menu" className="mt-3 inline-flex rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-semibold">
            إدارة القائمة
          </Link>
        </div>
        <TopItemsCard />
      </section>
    </div>
  );
}

function RestaurantOrdersManagementPanel() {
  const [orders, setOrders] = useState<Order[]>([]);

  const refresh = () => setOrders(getOrders().filter((order) => order.type === "food"));

  useEffect(() => {
    refresh();
    return subscribeToOrders(refresh);
  }, []);

  const updateRestaurantOrder = (orderId: string, status: Order["status"], message: string) => {
    updateOrderStatus(orderId, status);
    toast.success(message);
    refresh();
  };

  const newOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter((order) => order.status === "accepted" || order.status === "preparing");
  const readyOrders = orders.filter((order) => order.status === "ready_for_pickup");
  const completedOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "rejected" || order.status === "cancelled",
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="الطلبات الجديدة" value={String(newOrders.length)} accent="primary" />
        <StatCard label="قيد التحضير" value={String(preparingOrders.length)} accent="amber" />
        <StatCard label="جاهزة للاستلام" value={String(readyOrders.length)} accent="cyan" />
        <StatCard label="الطلبات المكتملة" value={String(completedOrders.length)} accent="primary" />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <RestaurantOrderSection
          title="الطلبات الجديدة"
          description="راجع الطلبات الواردة واقبلها أو ارفضها قبل بدء التحضير."
          orders={newOrders}
          emptyText="لا توجد طلبات جديدة حالياً."
          actions={(order) => (
            <>
              <button
                type="button"
                onClick={() => updateRestaurantOrder(order.id, "accepted", "تم قبول الطلب ونقله إلى التحضير")}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                قبول
              </button>
              <button
                type="button"
                onClick={() => updateRestaurantOrder(order.id, "rejected", "تم رفض الطلب")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive"
              >
                <XCircle className="h-3.5 w-3.5" />
                رفض
              </button>
            </>
          )}
        />

        <RestaurantOrderSection
          title="طلبات قيد التحضير"
          description="الطلبات المقبولة والتي يعمل عليها فريق المطبخ."
          orders={preparingOrders}
          emptyText="لا توجد طلبات قيد التحضير."
          actions={(order) => (
            <>
              {order.status === "accepted" ? (
                <button
                  type="button"
                  onClick={() => updateRestaurantOrder(order.id, "preparing", "بدأ تحضير الطلب")}
                  className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-bold"
                >
                  بدء التحضير
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => updateRestaurantOrder(order.id, "ready_for_pickup", "تم وضع الطلب كجاهز للاستلام")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-500"
              >
                <PackageCheck className="h-3.5 w-3.5" />
                جاهز للاستلام
              </button>
            </>
          )}
        />

        <RestaurantOrderSection
          title="الطلبات الجاهزة للاستلام"
          description="هنا يتوقف دور المطعم، والسائق هو من يكمل التوصيل."
          orders={readyOrders}
          emptyText="لا توجد طلبات جاهزة للاستلام."
          actions={() => (
            <span className="rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs font-bold text-cyan">
              بانتظار السائق
            </span>
          )}
        />

        <RestaurantOrderSection
          title="الطلبات المكتملة"
          description="طلبات تم تسليمها بواسطة السائق أو تم رفضها من المطعم."
          orders={completedOrders}
          emptyText="لا توجد طلبات مكتملة بعد."
          actions={() => null}
        />
      </section>
    </div>
  );
}

function RestaurantOrderSection({
  title,
  description,
  orders,
  emptyText,
  actions,
}: {
  title: string;
  description: string;
  orders: Order[];
  emptyText: string;
  actions: (order: Order) => ReactNode;
}) {
  return (
    <section className="card-elevated p-5">
      <div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
            {emptyText}
          </div>
        ) : (
          orders.map((order) => <RestaurantOrderCard key={order.id} order={order} actions={actions(order)} />)
        )}
      </div>
    </section>
  );
}

function RestaurantOrderCard({ order, actions }: { order: Order; actions: ReactNode }) {
  return (
    <article className="rounded-xl border border-border bg-secondary/30 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-cyan">{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="mt-2 text-sm font-semibold">{order.user.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{formatOrderTime(order.createdAt)}</div>
        </div>
        <div className="font-mono text-sm font-bold text-primary">{order.total} ₪</div>
      </div>

      <div className="mt-3 rounded-lg bg-background/60 p-3">
        <div className="text-xs font-bold text-muted-foreground">الوجبات والكميات</div>
        <div className="mt-1 text-sm">
          {order.items.map((item) => `${item.name} × ${item.quantity}`).join("، ")}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-background/60 p-3">
          <div className="text-xs font-bold text-muted-foreground">ملاحظات العميل</div>
          <div className="mt-1 text-sm">{order.deliveryAddress || "لا توجد ملاحظات"}</div>
        </div>
        <div className="rounded-lg bg-background/60 p-3">
          <div className="text-xs font-bold text-muted-foreground">حالة الطلب</div>
          <div className="mt-1 text-sm font-semibold">{restaurantOrderStatusLabel(order.status)}</div>
        </div>
      </div>

      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}

function OrderStatusBadge({ status }: { status: Order["status"] }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", restaurantOrderStatusClass(status))}>
      {restaurantOrderStatusLabel(status)}
    </span>
  );
}

function restaurantOrderStatusLabel(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "طلب جديد";
    case "accepted":
      return "مقبول";
    case "preparing":
      return "قيد التحضير";
    case "ready_for_pickup":
      return "جاهز للاستلام";
    case "on_the_way":
      return "مع السائق";
    case "delivered":
      return "مكتمل";
    case "rejected":
      return "مرفوض";
    case "cancelled":
      return "ملغي";
    default:
      return status;
  }
}

function restaurantOrderStatusClass(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "bg-primary/15 text-primary";
    case "accepted":
    case "preparing":
      return "bg-amber/15 text-amber";
    case "ready_for_pickup":
      return "bg-cyan/15 text-cyan";
    case "delivered":
      return "bg-emerald-500/15 text-emerald-500";
    case "rejected":
    case "cancelled":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-secondary text-muted-foreground";
  }
}

function formatOrderTime(value: string) {
  try {
    return new Intl.DateTimeFormat("ar", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function RestaurantMenuManagementPanel() {
  const [meals, setMeals] = useState<RestaurantMeal[]>(initialRestaurantMeals);
  const [form, setForm] = useState<Omit<RestaurantMeal, "id">>(emptyMealForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const availableMeals = meals.filter((meal) => meal.available);
  const unavailableMeals = meals.filter((meal) => !meal.available);
  const formTitle = editingId ? "تعديل وجبة" : "إضافة وجبة جديدة";

  const resetForm = () => {
    setForm(emptyMealForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const startAddMeal = () => {
    setForm(emptyMealForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const startEditMeal = (meal: RestaurantMeal) => {
    const { id: _id, ...editableMeal } = meal;
    setForm(editableMeal);
    setEditingId(meal.id);
    setIsFormOpen(true);
  };

  const saveMeal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name.trim() || !form.price.trim()) {
      toast.error("أدخل اسم الوجبة والسعر أولاً");
      return;
    }

    const normalizedMeal = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim() || "وصف مختصر للوجبة",
      price: form.price.trim(),
      image: form.image.trim(),
      prepTime: form.prepTime.trim() || "15 دقيقة",
    };

    if (editingId) {
      setMeals((current) => current.map((meal) => (meal.id === editingId ? { ...normalizedMeal, id: editingId } : meal)));
      toast.success("تم تعديل وجبة");
    } else {
      setMeals((current) => [{ ...normalizedMeal, id: `meal-${Date.now()}` }, ...current]);
      toast.success("تمت إضافة وجبة جديدة");
    }

    resetForm();
  };

  const deleteMeal = (mealId: string) => {
    setMeals((current) => current.filter((meal) => meal.id !== mealId));
    if (editingId === mealId) resetForm();
    toast.success("تم حذف وجبة");
  };

  const toggleMealAvailability = (mealId: string) => {
    setMeals((current) => current.map((meal) => (meal.id === mealId ? { ...meal, available: !meal.available } : meal)));
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="قائمة الوجبات" value={String(meals.length)} accent="primary" />
        <StatCard label="متوفر الآن" value={String(availableMeals.length)} accent="cyan" />
        <StatCard label="غير متوفر" value={String(unavailableMeals.length)} accent="amber" />
        <StatCard label="التصنيف الأبرز" value="شاورما" accent="amber" />
      </section>

      <section className="card-elevated p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">قائمة الوجبات</h2>
            <p className="mt-1 text-sm text-muted-foreground">إدارة الوجبات: إضافة وجبة جديدة، تعديل وجبة، حذف وجبة، السعر، صورة الوجبة، التصنيف، وحالة التوفر.</p>
          </div>
          <button
            type="button"
            onClick={startAddMeal}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            إضافة وجبة جديدة
          </button>
        </div>

        {isFormOpen ? (
          <form onSubmit={saveMeal} className="mt-5 rounded-xl border border-border bg-secondary/25 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-display text-lg font-bold">{formTitle}</h3>
              <button type="button" onClick={resetForm} className="w-fit rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-semibold">
                إلغاء
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-sm font-semibold">
                <span>اسم الوجبة</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder="مثال: وجبة شاورما دجاج"
                />
              </label>
              <label className="space-y-1.5 text-sm font-semibold">
                <span>السعر</span>
                <input
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder="24"
                  inputMode="decimal"
                />
              </label>
              <label className="space-y-1.5 text-sm font-semibold">
                <span>التصنيف</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as MealCategory }))}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  {mealCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm font-semibold">
                <span>مدة التحضير</span>
                <input
                  value={form.prepTime}
                  onChange={(event) => setForm((current) => ({ ...current, prepTime: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder="15 دقيقة"
                />
              </label>
              <label className="space-y-1.5 text-sm font-semibold md:col-span-2">
                <span>صورة الوجبة</span>
                <input
                  value={form.image}
                  onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder="رابط صورة الوجبة"
                  dir="ltr"
                />
              </label>
              <label className="space-y-1.5 text-sm font-semibold md:col-span-2">
                <span>الوصف</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="وصف مختصر يظهر في بطاقة الوجبة"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(event) => setForm((current) => ({ ...current, available: event.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                حالة التوفر
              </label>
            </div>

            <div className="mt-5">
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
                {editingId ? "حفظ تعديل وجبة" : "إضافة وجبة جديدة"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {meals.map((meal) => (
            <article key={meal.id} className="overflow-hidden rounded-xl border border-border bg-secondary/30">
              <div className="relative aspect-[16/10] bg-secondary">
                {meal.image ? (
                  <img src={meal.image} alt={meal.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-9 w-9" />
                  </div>
                )}
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur",
                    meal.available ? "bg-emerald-500/90" : "bg-amber/90",
                  )}
                >
                  {meal.available ? "متوفر" : "غير متوفر"}
                </span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-bold">{meal.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{meal.description}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold text-cyan">{meal.price} ₪</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1">
                    <Tag className="h-3.5 w-3.5" />
                    {meal.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {meal.prepTime}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEditMeal(meal)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-semibold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل وجبة
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMealAvailability(meal.id)}
                    className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-semibold"
                  >
                    {meal.available ? "إيقاف التوفر" : "تفعيل التوفر"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteMeal(meal.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف وجبة
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TopItemsCard />
    </div>
  );
}

function RestaurantMenuPanel() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="أصناف نشطة" value="٢٤" accent="primary" />
        <StatCard label="غير متوفر" value="٣" accent="amber" />
        <StatCard label="تصنيفات" value="٦" accent="cyan" />
        <StatCard label="الأكثر طلباً" value="شاورما" accent="amber" />
      </section>

      <section className="card-elevated p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">القائمة</h2>
            <p className="mt-1 text-sm text-muted-foreground">تابع الأصناف والأسعار وحالة التوفر بسرعة.</p>
          </div>
          <button className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">إضافة صنف</button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { name: "شاورما دجاج", category: "ساندويش", price: "٢٤ ₪", status: "متوفر" },
            { name: "بيتزا مارجريتا", category: "بيتزا", price: "٣٨ ₪", status: "متوفر" },
            { name: "مشاوي مشكلة", category: "مشاوي", price: "٦٥ ₪", status: "غير متوفر" },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold",
                    item.status === "متوفر" ? "bg-emerald-500/15 text-emerald-500" : "bg-amber/15 text-amber",
                  )}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-cyan">{item.price}</span>
                <button className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs font-semibold">تعديل</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <TopItemsCard />
    </div>
  );
}

function TopItemsCard() {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <h2 className="font-display text-lg font-bold">الأكثر طلباً</h2>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <li>١. شاورما دجاج — ٤٢ طلب</li>
        <li>٢. بيتزا مارجريتا — ٣٠ طلب</li>
        <li>٣. مشاوي مشكلة — ٢٤ طلب</li>
      </ul>
    </div>
  );
}

function OrderProgress({ order }: { order: Order }) {
  const activeStage = getOrderDeliveryStage(order);
  const activeIndex = DELIVERY_STAGES.findIndex((step) => step.id === activeStage);
  const final = isFinalDeliveryStage(activeStage);

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {DELIVERY_STAGES.map((step, index) => {
        const done = activeIndex > index || final;
        const current = activeIndex === index && !final;
        return (
          <span
            key={step.id}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold",
              done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
              current && "border-primary bg-primary text-primary-foreground",
              !done && !current && "border-border bg-secondary/30 text-muted-foreground",
            )}
          >
            {done && <CheckCircle2 className="h-3 w-3" />}
            {step.label}
          </span>
        );
      })}
    </div>
  );
}
