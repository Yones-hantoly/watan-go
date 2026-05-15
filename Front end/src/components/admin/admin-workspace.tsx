import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Car,
  Check,
  ClipboardList,
  FileSearch,
  MenuSquare,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { DashboardShell, StatCard } from "@/components/dashboard-shell";
import { getRegisteredAccounts, type AuthUser } from "@/lib/auth";
import { getOrders, groceryItems } from "@/lib/commerce";
import { cn } from "@/lib/utils";

export type AdminSection =
  | "users"
  | "drivers"
  | "merchants"
  | "orders"
  | "reports"
  | "restaurants"
  | "stores";

interface AdminRecord {
  id: string;
  name: string;
  phone?: string;
  role?: string;
  status: string;
  orders: number;
  revenue: number;
  city: string;
}

const dashboardSections: Array<{
  id: Extract<AdminSection, "users" | "drivers" | "restaurants" | "stores" | "orders" | "reports">;
  title: string;
  description: string;
  to:
    | "/admin/users"
    | "/admin/drivers"
    | "/admin/restaurants"
    | "/admin/stores"
    | "/dashboard/admin/orders"
    | "/dashboard/admin/reports";
  icon: ReactNode;
}> = [
  {
    id: "users",
    title: "إدارة المستخدمين",
    description: "حسابات العملاء وأصحاب الأدوار",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "drivers",
    title: "إدارة السائقين",
    description: "مراجعة واعتماد السائقين",
    to: "/admin/drivers",
    icon: <Car className="h-4 w-4" />,
  },
  {
    id: "restaurants",
    title: "إدارة المطاعم",
    description: "المطاعم والقوائم والشراكات",
    to: "/admin/restaurants",
    icon: <UtensilsCrossed className="h-4 w-4" />,
  },
  {
    id: "stores",
    title: "إدارة المتاجر",
    description: "المتاجر والمنتجات والمخزون",
    to: "/admin/stores",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "orders",
    title: "مراقبة الطلبات",
    description: "متابعة الطلبات والرحلات النشطة",
    to: "/dashboard/admin/orders",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  {
    id: "reports",
    title: "التقارير والتحليلات",
    description: "المؤشرات والإيرادات والأداء",
    to: "/dashboard/admin/reports",
    icon: <BarChart3 className="h-4 w-4" />,
  },
];

const legacySectionIcon: Record<AdminSection, ReactNode> = {
  users: <Users className="h-4 w-4" />,
  drivers: <Car className="h-4 w-4" />,
  merchants: <Building2 className="h-4 w-4" />,
  orders: <ClipboardList className="h-4 w-4" />,
  reports: <BarChart3 className="h-4 w-4" />,
  restaurants: <UtensilsCrossed className="h-4 w-4" />,
  stores: <Store className="h-4 w-4" />,
};

export function AdminManagementRoute({
  section,
  children,
}: {
  section: AdminSection;
  children?: ReactNode;
}) {
  return (
    <DashboardShell expectedRole="admin">
      {(user) => (
        <AdminWorkspace user={user} activeSection={section}>
          {children ?? <AdminManagementPage section={section} />}
        </AdminWorkspace>
      )}
    </DashboardShell>
  );
}

export function AdminWorkspace({
  user,
  activeSection,
  children,
}: {
  user: AuthUser;
  activeSection?: AdminSection;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            لوحة الإدارة
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold">مركز تحكم وطن جو</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.name} · مساحة تشغيل مستقلة لكل وحدة إدارية
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 sm:flex">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="font-mono text-xs font-semibold text-primary">جميع الأنظمة تعمل</span>
        </div>
      </section>

      <nav className="grid gap-2 rounded-2xl border border-border bg-secondary/20 p-2 md:grid-cols-2 xl:grid-cols-5">
        {dashboardSections.map((item) => {
          const active = activeSection === item.id || pathname === item.to;
          return (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "flex min-h-16 items-center gap-3 rounded-xl border px-3 py-2 text-right transition",
                active
                  ? "border-primary/40 bg-primary text-primary-foreground shadow-lg shadow-primary/15"
                  : "border-transparent bg-background/40 text-muted-foreground hover:border-cyan/30 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  active ? "bg-primary-foreground/15" : "bg-secondary text-cyan",
                )}
              >
                {item.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold">{item.title}</span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[11px]",
                    active ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}

export function AdminManagementPage({ section }: { section: AdminSection }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const config = getSectionConfig(section);
  const rows = useMemo(() => getSectionRows(section), [section]);
  const filteredRows = rows.filter((row) => {
    const searchHit = [row.name, row.phone, row.role, row.status, row.city]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const statusHit = statusFilter === "all" || row.status === statusFilter;
    return searchHit && statusHit;
  });
  const statuses = Array.from(new Set(rows.map((row) => row.status)));
  const activeCount = rows.filter((row) => row.status === "نشط" || row.status === "معتمد").length;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {legacySectionIcon[section]}
          </div>
          <h2 className="font-display text-2xl font-bold">{config.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {sectionActionLabel(section) && (
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {sectionActionLabel(section)}
            </button>
          )}
          <label className="relative min-w-64">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث..."
              className="h-11 w-full rounded-xl border border-border bg-background px-9 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary"
          >
            <option value="all">كل الحالات</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={config.totalLabel} value={String(rows.length)} accent="primary" />
        <StatCard label={config.activeLabel} value={String(activeCount)} accent="cyan" />
        <StatCard
          label="طلبات مرتبطة"
          value={String(rows.reduce((total, row) => total + row.orders, 0))}
          accent="amber"
        />
        <StatCard
          label="إجمالي الإيراد"
          value={`${rows.reduce((total, row) => total + row.revenue, 0)} ₪`}
          accent="primary"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="grid grid-cols-[1.3fr_0.9fr_0.9fr_0.8fr_0.8fr_auto] gap-3 border-b border-border bg-secondary/30 px-4 py-3 text-xs font-bold text-muted-foreground">
          <span>الاسم</span>
          <span>التصنيف</span>
          <span>المدينة</span>
          <span>الطلبات</span>
          <span>الحالة</span>
          <span>إجراءات</span>
        </div>
        {filteredRows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">لا توجد نتائج مطابقة.</div>
        ) : (
          filteredRows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.3fr_0.9fr_0.9fr_0.8fr_0.8fr_auto] items-center gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-bold">{row.name}</p>
                {row.phone && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.phone}</p>
                )}
              </div>
              <span className="text-muted-foreground">{row.role ?? config.entityLabel}</span>
              <span className="text-muted-foreground">{row.city}</span>
              <span className="font-mono text-xs font-bold text-primary">{row.orders}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-2.5 py-1 text-xs font-bold",
                  statusClass(row.status),
                )}
              >
                {row.status}
              </span>
              <div className="flex gap-2">
                {section === "drivers" && (
                  <>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-500 transition hover:bg-emerald-500/15">
                      <Check className="h-3.5 w-3.5" />
                      اعتماد
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/15">
                      <X className="h-3.5 w-3.5" />
                      رفض
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-bold transition hover:bg-secondary">
                      <FileSearch className="h-3.5 w-3.5" />
                      مراجعة الوثائق
                    </button>
                  </>
                )}
                {section === "restaurants" && (
                  <>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/15">
                      <MenuSquare className="h-3.5 w-3.5" />
                      إدارة القائمة
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/15">
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </>
                )}
                {section === "stores" && (
                  <>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/15">
                      <Package className="h-3.5 w-3.5" />
                      إدارة المنتجات
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/15">
                      <Trash2 className="h-3.5 w-3.5" />
                      حذف
                    </button>
                  </>
                )}
                {!["drivers", "restaurants", "stores"].includes(section) && (
                  <>
                    <button className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-bold transition hover:bg-secondary">
                      عرض
                    </button>
                    <button className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/15">
                      تعديل
                    </button>
                    <button className="rounded-lg border border-border bg-background px-2 py-1.5 text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function AdminDriversPage() {
  return <AdminManagementPage section="drivers" />;
}

export function AdminRestaurantsPage() {
  return <AdminManagementPage section="restaurants" />;
}

export function AdminStoresPage() {
  return <AdminManagementPage section="stores" />;
}

function sectionActionLabel(section: AdminSection) {
  if (section === "restaurants") return "إضافة مطعم";
  if (section === "stores") return "إضافة متجر";
  return null;
}

function getSectionConfig(section: AdminSection) {
  const configs = {
    users: {
      title: "إدارة المستخدمين",
      description: "مساحة مخصصة لمراجعة حسابات المستخدمين والتحكم بحالتها.",
      totalLabel: "إجمالي المستخدمين",
      activeLabel: "مستخدمون نشطون",
      entityLabel: "مستخدم",
    },
    drivers: {
      title: "إدارة السائقين",
      description: "متابعة طلبات تسجيل السائقين ومراجعة الوثائق والاعتماد.",
      totalLabel: "إجمالي السائقين",
      activeLabel: "سائقون معتمدون",
      entityLabel: "سائق",
    },
    merchants: {
      title: "إدارة التجار",
      description: "إدارة المطاعم والمتاجر والشراكات ومؤشرات الأداء.",
      totalLabel: "إجمالي التجار",
      activeLabel: "تجار نشطون",
      entityLabel: "تاجر",
    },
    orders: {
      title: "مراقبة الطلبات",
      description: "متابعة الطلبات والرحلات النشطة وحالات التنفيذ عبر المنصة.",
      totalLabel: "إجمالي الطلبات",
      activeLabel: "طلبات نشطة",
      entityLabel: "طلب",
    },
    reports: {
      title: "التقارير والتحليلات",
      description: "مؤشرات الإيرادات وحجم التشغيل وأداء الشركاء والسائقين.",
      totalLabel: "مؤشرات متاحة",
      activeLabel: "مؤشرات مباشرة",
      entityLabel: "تقرير",
    },
    restaurants: {
      title: "إدارة المطاعم",
      description: "إدارة شركاء الطعام، الطلبات النشطة، ومؤشرات الأداء.",
      totalLabel: "إجمالي المطاعم",
      activeLabel: "مطاعم نشطة",
      entityLabel: "مطعم",
    },
    stores: {
      title: "إدارة المتاجر",
      description: "إدارة المتاجر، المخزون، الطلبات، وحالة الشراكة.",
      totalLabel: "إجمالي المتاجر",
      activeLabel: "متاجر نشطة",
      entityLabel: "متجر",
    },
  } satisfies Record<AdminSection, Record<string, string>>;

  return configs[section];
}

function getSectionRows(section: AdminSection): AdminRecord[] {
  const accounts = getRegisteredAccounts();
  const orders = getOrders();

  if (section === "users") {
    return accounts.map((account) => ({
      id: account.phone,
      name: account.name,
      phone: account.phone,
      role: roleLabel(account.role),
      status: "نشط",
      orders: orders.filter((order) => order.user.phone === account.phone).length,
      revenue: orders
        .filter((order) => order.user.phone === account.phone)
        .reduce((total, order) => total + order.total, 0),
      city: "رام الله",
    }));
  }

  if (section === "drivers") {
    const driverAccounts = accounts.filter((account) => account.role === "driver");
    const fallbackDrivers = [
      { name: "أحمد سالم", phone: "0591111111" },
      { name: "محمد خالد", phone: "0592222222" },
      { name: "يوسف علي", phone: "0593333333" },
    ];
    return (driverAccounts.length > 0 ? driverAccounts : fallbackDrivers).map((driver) => ({
      id: driver.phone,
      name: driver.name,
      phone: driver.phone,
      role: "سائق توصيل",
      status: "معتمد",
      orders: orders.filter((order) => order.driverPhone === driver.phone).length,
      revenue: orders
        .filter((order) => order.driverPhone === driver.phone)
        .reduce((total, order) => total + order.deliveryFee, 0),
      city: "البيرة",
    }));
  }

  if (section === "merchants") {
    return [...getVendorRows("food", "مطعم"), ...getStoreRows()];
  }

  if (section === "orders") {
    return orders.map((order) => ({
      id: order.id,
      name: order.vendorName,
      phone: order.user.phone,
      role: order.type === "food" ? "طلب طعام" : "طلب متجر",
      status: order.status,
      orders: 1,
      revenue: order.total,
      city: order.deliveryAddress,
    }));
  }

  if (section === "reports") {
    return [
      {
        id: "revenue",
        name: "الإيرادات",
        role: "مالي",
        status: "نشط",
        orders: orders.length,
        revenue: orders.reduce((total, order) => total + order.total, 0),
        city: "كل المناطق",
      },
      {
        id: "delivery",
        name: "التوصيل",
        role: "تشغيلي",
        status: "نشط",
        orders: orders.filter((order) => order.driverPhone).length,
        revenue: orders.reduce((total, order) => total + order.deliveryFee, 0),
        city: "كل المناطق",
      },
    ];
  }

  if (section === "restaurants") {
    return getVendorRows("food", "مطعم");
  }

  return getStoreRows();
}

function getStoreRows(): AdminRecord[] {
  const orders = getOrders();
  const groceryStoreIds = Array.from(new Set(groceryItems.map((item) => item.storeId)));
  const groceryStoreRows = groceryStoreIds.map((storeId) => {
    const item = groceryItems.find((groceryItem) => groceryItem.storeId === storeId);
    const storeOrders = orders.filter((order) => order.vendorId === storeId);
    return {
      id: storeId,
      name: item?.storeName ?? storeId,
      role: "متجر",
      status: "نشط",
      orders: storeOrders.length,
      revenue: storeOrders.reduce((total, order) => total + order.total, 0),
      city: "رام الله",
    };
  });

  return [...groceryStoreRows, ...getVendorRows("grocery", "متجر")];
}

function getVendorRows(type: "food" | "grocery", role: string): AdminRecord[] {
  const orders = getOrders().filter((order) => order.type === type);
  const vendorIds = Array.from(new Set(orders.map((order) => order.vendorId)));
  return vendorIds.map((vendorId) => {
    const vendorOrders = orders.filter((order) => order.vendorId === vendorId);
    return {
      id: vendorId,
      name: vendorOrders[0]?.vendorName ?? vendorId,
      role,
      status: "نشط",
      orders: vendorOrders.length,
      revenue: vendorOrders.reduce((total, order) => total + order.total, 0),
      city: "رام الله",
    };
  });
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    customer: "عميل",
    driver: "سائق",
    restaurant: "مطعم",
    shop: "متجر",
    admin: "مدير",
  };
  return labels[role] ?? role;
}

function statusClass(status: string) {
  if (["نشط", "معتمد", "completed", "delivered"].includes(status)) {
    return "bg-emerald-500/15 text-emerald-500";
  }
  if (["قيد المراجعة", "pending", "accepted", "preparing"].includes(status)) {
    return "bg-amber/15 text-amber";
  }
  return "bg-secondary text-muted-foreground";
}
