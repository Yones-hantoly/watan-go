import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DashboardShell } from "@/components/dashboard-shell";
import { DELIVERY_STAGES, getOrderDeliveryStage, isFinalDeliveryStage, setOrderDeliveryStage, type DeliveryStage } from "@/lib/delivery-flow";
import { getOrders, subscribeToOrders, updateOrderStatus, type Order } from "@/lib/commerce";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Clock3, MapPin, Navigation, PackageCheck, RadioTower, Store, UserRound } from "lucide-react";
import type * as L from "leaflet";

export const Route = createFileRoute("/orders/$id/tracking")({
  component: () => (
    <DashboardShell expectedRole="customer">
      {(user) => <OrderTrackingPage customerPhone={user.phone} />}
    </DashboardShell>
  ),
});

type Coords = { lat: number; lng: number };

const CUSTOMER_BASE: Coords = { lat: 31.9072, lng: 35.2045 };
const RESTAURANT_BASE: Coords = { lat: 31.9004, lng: 35.1986 };
const SIMULATION_INTERVAL_MS = 4500;

const TRACKING_DESCRIPTIONS: Record<Exclude<DeliveryStage, "delivered">, string> = {
  accepted: "تمت مراجعة الطلب وتأكيده من المطعم أو المتجر.",
  preparing: "الفريق يجهز طلبك الآن وسيتم إشعار السائق عند الجاهزية.",
  ready_for_pickup: "الطلب جاهز، والسائق متواجد عند نقطة الاستلام.",
  picked_up: "السائق استلم الطلب وبدأ التحرك من نقطة الاستلام.",
  on_the_way: "السائق في الطريق إلى عنوانك، وتحديث الموقع يعمل مباشرة.",
  completed: "تم تسليم الطلب بنجاح.",
};

function OrderTrackingPage({ customerPhone }: { customerPhone: string }) {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(() => findCustomerOrder(id, customerPhone));
  const [driverCoords, setDriverCoords] = useState<Coords | null>(null);
  const orderRef = useRef<Order | null>(order);
  const progressRef = useRef(0);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    const load = () => setOrder(findCustomerOrder(id, customerPhone));
    load();
    return subscribeToOrders(load);
  }, [customerPhone, id]);

  const route = useMemo(() => (order ? createOrderRoute(order) : null), [order]);
  const activeStage = order ? getOrderDeliveryStage(order) : "accepted";
  const isComplete = isFinalDeliveryStage(activeStage);
  const progressPercent = getProgressPercent(activeStage);
  const etaMinutes = route ? getEtaMinutes(route.customer, driverCoords ?? getDriverPositionForStage(activeStage, route, progressRef.current), activeStage) : 0;

  useEffect(() => {
    if (!order || !route) return;
    progressRef.current = getInitialMovementProgress(activeStage);
    setDriverCoords(getDriverPositionForStage(activeStage, route, progressRef.current));
  }, [activeStage, order, route]);

  useEffect(() => {
    if (!order || !route || order.status === "cancelled" || isComplete) return;

    const timer = window.setInterval(() => {
      const latestOrder = orderRef.current;
      if (!latestOrder || latestOrder.status === "cancelled") return;

      const latestStage = getOrderDeliveryStage(latestOrder);
      if (isFinalDeliveryStage(latestStage)) return;

      if (latestStage === "picked_up" || latestStage === "on_the_way") {
        progressRef.current = Math.min(1, progressRef.current + (latestStage === "picked_up" ? 0.18 : 0.24));
        setDriverCoords(getDriverPositionForStage(latestStage, route, progressRef.current));
      }

      const nextStage = getNextSimulatedStage(latestStage, progressRef.current);
      if (!nextStage || nextStage === latestStage) return;

      if (nextStage === "accepted" || nextStage === "preparing" || nextStage === "ready_for_pickup") {
        updateOrderStatus(latestOrder.id, nextStage);
      } else {
        setOrderDeliveryStage(latestOrder.id, nextStage);
      }
    }, SIMULATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isComplete, order, route]);

  if (!order) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h1 className="mt-4 font-display text-2xl font-bold">لم يتم العثور على الطلب</h1>
        <p className="mt-2 text-sm text-muted-foreground">قد لا يكون الطلب تابعاً لحسابك أو تم حذفه من التخزين المحلي.</p>
        <Link to="/dashboard/customer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <ArrowRight className="h-4 w-4" />
          العودة للطلبات
        </Link>
      </section>
    );
  }

  if (!route) return null;

  return (
    <div dir="rtl" className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-surface/85 p-5 shadow-2xl shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border border-cyan/30 bg-cyan/10">
            <AvatarFallback className="bg-transparent text-cyan">س</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-500">
                <span className="me-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                يجري التوصيل الآن
              </span>
              <StatusBadge stage={activeStage} status={order.status} />
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">تتبع الطلب {order.id}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{order.vendorName} إلى {order.deliveryAddress}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[480px]">
          <InfoCell icon={<UserRound className="h-4 w-4" />} label="العميل" value={order.user.name} />
          <InfoCell icon={<Navigation className="h-4 w-4" />} label="السائق" value={order.driverName ?? "سائق وطن جو"} />
          <InfoCell icon={<Clock3 className="h-4 w-4" />} label="الوصول المتوقع" value={isComplete ? "تم التسليم" : `${etaMinutes} دقيقة`} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="rounded-3xl border border-white/10 bg-surface/85 p-5 lg:order-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-orange-500">حالة الطلب الحالية</p>
              <h2 className="mt-1 font-display text-xl font-bold">{getStageLabel(activeStage)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{TRACKING_DESCRIPTIONS[normalizeStage(activeStage)]}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-center font-display text-lg font-bold text-primary">
              {progressPercent}%
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-l from-emerald-500 via-cyan to-orange-500 transition-all duration-700" style={{ width: `${progressPercent}%` }} />
          </div>

          <DeliveryTimeline activeStage={activeStage} />
        </div>

        <div className="space-y-4 lg:order-1">
          <OrderInfoPanel order={order} stage={activeStage} etaMinutes={etaMinutes} />
          <CustomerLiveTrackingMap
            order={order}
            route={route}
            stage={activeStage}
            driverCoords={driverCoords ?? getDriverPositionForStage(activeStage, route, progressRef.current)}
          />
        </div>
      </section>
    </div>
  );
}

function DeliveryTimeline({ activeStage }: { activeStage: DeliveryStage }) {
  const activeIndex = DELIVERY_STAGES.findIndex((step) => step.id === normalizeStage(activeStage));
  const final = isFinalDeliveryStage(activeStage);

  return (
    <div className="mt-7 space-y-1">
      {DELIVERY_STAGES.map((step, index) => {
        const done = activeIndex > index || final;
        const current = activeIndex === index && !final;
        return (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300",
                  done && "border-emerald-500 bg-emerald-500/15 text-emerald-500",
                  current && "scale-105 animate-pulse border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25",
                  !done && !current && "border-border bg-secondary/50 text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              {index < DELIVERY_STAGES.length - 1 && (
                <span className={cn("h-12 w-px transition-colors", done ? "bg-emerald-500" : "bg-border")} />
              )}
            </div>
            <div className="min-w-0 pb-5 pt-1.5">
              <p className={cn("font-bold", done && "text-emerald-500", current && "text-orange-500", !done && !current && "text-muted-foreground")}>
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{TRACKING_DESCRIPTIONS[normalizeStage(step.id)]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderInfoPanel({ order, stage, etaMinutes }: { order: Order; stage: DeliveryStage; etaMinutes: number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-surface/85 p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCell icon={<PackageCheck className="h-4 w-4" />} label="رقم الطلب" value={order.id} />
        <InfoCell icon={<Store className="h-4 w-4" />} label={order.type === "food" ? "المطعم" : "المتجر"} value={order.vendorName} />
        <InfoCell icon={<Clock3 className="h-4 w-4" />} label="الوقت المتبقي" value={isFinalDeliveryStage(stage) ? "اكتمل" : `${etaMinutes} دقيقة`} />
        <InfoCell icon={<MapPin className="h-4 w-4" />} label="الإجمالي" value={`${order.total} شيكل`} />
      </div>
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <span className="text-cyan">{icon}</span>
        {label}
      </div>
      <p className="mt-2 truncate font-display text-sm font-bold">{value}</p>
    </div>
  );
}

function CustomerLiveTrackingMap({
  order,
  route,
  stage,
  driverCoords,
}: {
  order: Order;
  route: TrackingRoute;
  stage: DeliveryStage;
  driverCoords: Coords;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const vendorMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      const lf = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (destroyed || !containerRef.current || mapRef.current) return;

      leafletRef.current = lf;
      const map = lf.map(containerRef.current, {
        center: [route.vendor.lat, route.vendor.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
      lf.control.zoom({ position: "topleft" }).addTo(map);
      lf.control.attribution({ position: "bottomleft", prefix: "OpenStreetMap" }).addTo(map);

      vendorMarkerRef.current = lf.marker([route.vendor.lat, route.vendor.lng], {
        icon: lf.divIcon({ className: "", html: markerHtml("vendor"), iconSize: [38, 38], iconAnchor: [19, 38] }),
      }).addTo(map).bindPopup(order.vendorName);

      customerMarkerRef.current = lf.marker([route.customer.lat, route.customer.lng], {
        icon: lf.divIcon({ className: "", html: markerHtml("customer"), iconSize: [38, 38], iconAnchor: [19, 38] }),
      }).addTo(map).bindPopup(order.deliveryAddress);

      driverMarkerRef.current = lf.marker([driverCoords.lat, driverCoords.lng], {
        icon: lf.divIcon({ className: "", html: markerHtml("driver"), iconSize: [44, 44], iconAnchor: [22, 22] }),
        zIndexOffset: 1000,
      }).addTo(map).bindPopup(order.driverName ?? "سائق وطن جو");

      routeLineRef.current = lf.polyline([[route.vendor.lat, route.vendor.lng], [route.midpoint.lat, route.midpoint.lng], [route.customer.lat, route.customer.lng]], {
        color: "#8b5cf6",
        weight: 5,
        opacity: 0.85,
        dashArray: "12 8",
      }).addTo(map);

      const bounds = lf.latLngBounds([
        [route.vendor.lat, route.vendor.lng],
        [route.customer.lat, route.customer.lng],
        [driverCoords.lat, driverCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapRef.current = map;
      setReady(true);
      window.setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      destroyed = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lf = leafletRef.current;
    const map = mapRef.current;
    if (!lf || !map || !ready) return;

    driverMarkerRef.current?.setLatLng([driverCoords.lat, driverCoords.lng]);
    routeLineRef.current?.setLatLngs([[driverCoords.lat, driverCoords.lng], [route.customer.lat, route.customer.lng]]);

    const bounds = lf.latLngBounds([
      [route.vendor.lat, route.vendor.lng],
      [route.customer.lat, route.customer.lng],
      [driverCoords.lat, driverCoords.lng],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 0.5 });
  }, [driverCoords, ready, route]);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-2xl shadow-black/10">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-500">
            <RadioTower className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">الخريطة المباشرة</h2>
            <p className="text-xs text-muted-foreground">موقع السائق يتحرك حسب حالة الطلب</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
          <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
          مباشر
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border/50 border-b border-border/60 bg-secondary/20 text-center text-xs">
        <MapSummary label="نقطة الاستلام" value={order.vendorName} tone="text-cyan" />
        <MapSummary label="موقع السائق" value={getStageLabel(stage)} tone="text-purple-500" />
        <MapSummary label="موقع العميل" value={order.deliveryAddress} tone="text-primary" />
      </div>

      <div className="relative h-[430px] min-h-[360px]">
        {!ready && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface text-sm text-muted-foreground">
            جاري تحميل الخريطة...
          </div>
        )}
        <div ref={containerRef} className="h-full w-full dark:[filter:brightness(0.82)_contrast(1.08)_saturate(0.85)]" />
      </div>
    </div>
  );
}

function MapSummary({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-0 px-3 py-3">
      <p className={cn("text-[10px] font-bold", tone)}>{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  );
}

type TrackingRoute = {
  vendor: Coords;
  midpoint: Coords;
  customer: Coords;
};

function findCustomerOrder(id: string, customerPhone: string) {
  return getOrders().find((item) => item.id === id && item.user.phone === customerPhone) ?? null;
}

function createOrderRoute(order: Order): TrackingRoute {
  const seed = hashString(`${order.vendorId}-${order.id}`);
  const vendor = offsetCoords(RESTAURANT_BASE, seed, 0.009);
  const customer = offsetCoords(CUSTOMER_BASE, seed * 1.7, 0.011);
  const midpoint = {
    lat: (vendor.lat + customer.lat) / 2 + 0.002,
    lng: (vendor.lng + customer.lng) / 2 - 0.0015,
  };
  return { vendor, midpoint, customer };
}

function offsetCoords(base: Coords, seed: number, radius: number): Coords {
  return {
    lat: base.lat + Math.sin(seed) * radius,
    lng: base.lng + Math.cos(seed * 1.37) * radius,
  };
}

function hashString(value: string) {
  return Array.from(value).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7);
}

function interpolate(a: Coords, b: Coords, t: number): Coords {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    lat: a.lat + (b.lat - a.lat) * clamped,
    lng: a.lng + (b.lng - a.lng) * clamped,
  };
}

function getDriverPositionForStage(stage: DeliveryStage, route: TrackingRoute, progress: number): Coords {
  if (stage === "completed" || stage === "delivered") return route.customer;
  if (stage === "on_the_way") return interpolate(route.midpoint, route.customer, Math.max(0.15, progress));
  if (stage === "picked_up") return interpolate(route.vendor, route.midpoint, Math.max(0.05, progress));
  return route.vendor;
}

function getInitialMovementProgress(stage: DeliveryStage) {
  if (stage === "picked_up") return 0.12;
  if (stage === "on_the_way") return 0.35;
  if (stage === "completed" || stage === "delivered") return 1;
  return 0;
}

function getNextSimulatedStage(stage: DeliveryStage, progress: number): DeliveryStage | null {
  if (stage === "accepted") return "preparing";
  if (stage === "preparing") return "ready_for_pickup";
  if (stage === "ready_for_pickup") return "picked_up";
  if (stage === "picked_up" && progress >= 0.55) return "on_the_way";
  if (stage === "on_the_way" && progress >= 0.98) return "completed";
  return null;
}

function getEtaMinutes(customer: Coords, driver: Coords, stage: DeliveryStage) {
  if (stage === "completed" || stage === "delivered") return 0;
  if (stage === "accepted" || stage === "preparing") return 24;
  if (stage === "ready_for_pickup") return 18;
  const distance = haversineKm(customer, driver);
  return Math.max(2, Math.round((distance / 28) * 60));
}

function haversineKm(a: Coords, b: Coords) {
  const earthRadiusKm = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.asin(Math.sqrt(h));
}

function getProgressPercent(stage: DeliveryStage) {
  const normalized = normalizeStage(stage);
  const index = DELIVERY_STAGES.findIndex((item) => item.id === normalized);
  if (index < 0) return 0;
  return Math.round(((index + 1) / DELIVERY_STAGES.length) * 100);
}

function normalizeStage(stage: DeliveryStage): Exclude<DeliveryStage, "delivered"> {
  return stage === "delivered" ? "completed" : stage;
}

function getStageLabel(stage: DeliveryStage) {
  return DELIVERY_STAGES.find((item) => item.id === normalizeStage(stage))?.label ?? "قيد المتابعة";
}

function StatusBadge({ stage, status }: { stage: DeliveryStage; status: Order["status"] }) {
  if (status === "cancelled") {
    return <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">تم إلغاء الطلب</span>;
  }

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-bold", statusBadgeClass(stage))}>
      {getStageLabel(stage)}
    </span>
  );
}

function statusBadgeClass(stage: DeliveryStage) {
  if (stage === "preparing") return "bg-orange-500/15 text-orange-500";
  if (stage === "ready_for_pickup") return "bg-cyan/15 text-cyan";
  if (stage === "picked_up" || stage === "on_the_way") return "bg-purple-500/15 text-purple-500";
  if (stage === "completed" || stage === "delivered") return "bg-emerald-500/15 text-emerald-500";
  return "bg-yellow-500/15 text-yellow-600";
}

function markerHtml(type: "driver" | "vendor" | "customer") {
  if (type === "driver") {
    return `<div style="position:relative;width:44px;height:44px">
      <div style="position:absolute;inset:0;border-radius:999px;background:#10b981;opacity:.25;animation:pulse 1.5s infinite"></div>
      <div style="position:absolute;inset:5px;border-radius:999px;background:#8b5cf6;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 28px rgba(0,0,0,.35);font-size:17px">🚗</div>
    </div>`;
  }

  const color = type === "vendor" ? "#06b6d4" : "#f59e0b";
  const label = type === "vendor" ? "🍽️" : "🏠";
  return `<div style="width:38px;height:38px;border-radius:16px 16px 16px 4px;transform:rotate(-45deg);background:${color};border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,.32)">
    <span style="transform:rotate(45deg);font-size:16px">${label}</span>
  </div>`;
}
