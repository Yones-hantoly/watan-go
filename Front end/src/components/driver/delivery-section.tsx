import { useEffect, useState } from "react";
import { CheckCircle2, Clock, MapPin, Navigation, PackageCheck, RadioTower } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type DriverStatus, type Order } from "@/lib/driver-mock-data";
import { DELIVERY_STAGES, isFinalDeliveryStage, type DeliveryStage } from "@/lib/delivery-flow";
import { LiveTrackingMap, type TrackingOrder } from "@/components/driver/LiveTrackingMap";

interface DeliverySectionProps {
  currentOrder?: Order;
  driverStatus: DriverStatus;
  onStatusChange: (status: DriverStatus) => void;
  activeTracking?: TrackingOrder | null;
  activeDeliveryStage?: DeliveryStage | null;
  lastDriverCoords?: { lat: number; lng: number } | null;
  onAdvanceDeliveryStage?: () => void;
  onCompleteTracking?: () => void;
  onDriverLocationChange?: (coords: { lat: number; lng: number }) => void;
}

export function DeliverySection({
  currentOrder,
  driverStatus,
  onStatusChange,
  activeTracking,
  activeDeliveryStage,
  lastDriverCoords,
  onAdvanceDeliveryStage,
  onCompleteTracking,
  onDriverLocationChange,
}: DeliverySectionProps) {
  const activeDelivery = Boolean(activeTracking || currentOrder);
  const isConnected = driverStatus === "online";
  const isDelivered = Boolean(activeDeliveryStage && isFinalDeliveryStage(activeDeliveryStage));
  const canShowDeliveryUI = driverStatus === "online" && activeDelivery && driverStatus !== "busy";
  const showMap = isConnected || !isDelivered;

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">إدارة التوصيل</h2>
        <p className="mt-1 text-sm text-muted-foreground">تحكم بحالتك الحالية وتابع الرحلة النشطة وتقدم التوصيل.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/85 p-5">
        <div className="mb-4 flex items-center gap-2">
          <RadioTower className="h-5 w-5 text-cyan" />
          <h3 className="font-display text-lg font-bold">حالة السائق</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <StatusButton label="متصل"     status="online"  active={driverStatus === "online"}  onClick={onStatusChange} />
          <StatusButton label="مشغول"    status="busy"    active={driverStatus === "busy"}    onClick={onStatusChange} />
          <StatusButton label="غير متصل" status="offline" active={driverStatus === "offline"} onClick={onStatusChange} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {canShowDeliveryUI ? (
          <>
            <div className="space-y-6">
              {/* Live tracking map — shown when driver accepted an order */}
              {activeTracking && showMap ? (
                <LiveTrackingMap
                  order={activeTracking}
                  onComplete={onCompleteTracking ?? (() => {})}
                  canComplete={!activeDeliveryStage || isFinalDeliveryStage(activeDeliveryStage)}
                  completeLabel="إنهاء الطلب"
                  initialDriverCoords={lastDriverCoords}
                  onDriverLocationChange={onDriverLocationChange}
                />
              ) : activeTracking && isDelivered ? (
                <CompletedDeliveryOffline />
              ) : currentOrder ? (
                <ActiveDelivery order={currentOrder} />
              ) : (
                <NoActiveDelivery />
              )}
            </div>
            <DeliveryTimeline
              activeStage={activeDeliveryStage ?? null}
              hasActiveOrder={activeDelivery}
              onNext={onAdvanceDeliveryStage}
              onFinish={onCompleteTracking}
            />
          </>
        ) : isConnected ? (
          <div className="xl:col-span-2">
            <NoActiveDelivery />
          </div>
        ) : (
          <DriverAvailabilityMessage status={driverStatus} />
        )}
      </div>
    </section>
  );
}

function DriverAvailabilityMessage({ status }: { status: DriverStatus }) {
  const isBusy = status === "busy";

  return (
    <div className="xl:col-span-2 rounded-2xl border border-dashed border-border bg-secondary/15 p-10 text-center">
      <RadioTower className={cn("mx-auto h-12 w-12", isBusy ? "text-amber" : "text-muted-foreground/60")} />
      <p className="mt-3 font-display text-lg font-bold">
        {isBusy ? "أنت مشغول حالياً. أنهِ الطلب الحالي لتستقبل طلباً جديداً." : "أنت غير متصل. فعّل الاتصال للبدء باستقبال الطلبات."}
      </p>
    </div>
  );
}

function CompletedDeliveryOffline() {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
      <PackageCheck className="mx-auto h-12 w-12 text-emerald-500" />
      <p className="mt-3 font-display text-lg font-bold text-emerald-500">تم التسليم بنجاح</p>
      <p className="mt-1 text-sm text-muted-foreground">الخريطة محفوظة بآخر موقع معروف، وستظهر مجدداً عند عودة السائق للاتصال.</p>
    </div>
  );
}

function ActiveDelivery({ order }: { order: Order }) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-cyan/10 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Navigation className="h-5 w-5 text-cyan" />
        <h3 className="font-display text-lg font-bold">التوصيل الحالي</h3>
      </div>
      <div className="rounded-2xl border border-border bg-background/35 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <RoutePoint label="من" value={order.pickupLocation}   tone="cyan" />
          <RoutePoint label="إلى" value={order.deliveryLocation} tone="primary" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniMetric label="المسافة"       value={`${order.distance} كم`} />
        <MiniMetric label="الوقت المتوقع" value={`${order.duration} د`} />
        <MiniMetric label="رسوم التوصيل"  value={`${order.price} شيكل`} />
        <MiniMetric label="الوصول"        value={order.estimatedDeliveryTime} />
      </div>
    </div>
  );
}

function NoActiveDelivery() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/15 p-10 text-center">
      <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
      <p className="mt-3 font-display text-lg font-bold">لا يوجد توصيل نشط</p>
      <p className="mt-1 text-sm text-muted-foreground">اقبل طلباً جديداً ليبدأ التتبع المباشر تلقائياً.</p>
    </div>
  );
}

function DeliveryTimeline({
  activeStage,
  hasActiveOrder,
  onNext,
  onFinish,
}: {
  activeStage: DeliveryStage | null;
  hasActiveOrder: boolean;
  onNext?: () => void;
  onFinish?: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (!activeStage) return;
    const nextIndex = DELIVERY_STAGES.findIndex((step) => step.id === activeStage);
    if (nextIndex >= 0) setCurrentStep(nextIndex + 1);
  }, [activeStage]);

  const activeIndex = Math.min(currentStep, DELIVERY_STAGES.length) - 1;
  const displayedStage = DELIVERY_STAGES[activeIndex]?.id ?? DELIVERY_STAGES[0].id;
  const final = isFinalDeliveryStage(displayedStage);

  const handleNext = () => {
    if (final) return;

    if (activeStage && onNext) {
      onNext();
      return;
    }

    setCurrentStep((step) => Math.min(DELIVERY_STAGES.length, step + 1));
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/85 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">تقدم التوصيل</h3>
        {hasActiveOrder && (
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
            {currentStep}/{DELIVERY_STAGES.length}
          </span>
        )}
      </div>
      {!hasActiveOrder ? (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
          لا يوجد طلب نشط لعرض مسار التوصيل.
        </div>
      ) : (
        <div className="mt-5 space-y-1">
          {DELIVERY_STAGES.map((step, index) => {
          const done = activeIndex > index || final;
          const current = activeIndex === index && !final;
          return (
            <motion.div key={step.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition",
                  done && "border-emerald-500 bg-emerald-500/15 text-emerald-500",
                  current && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                  !done && !current && "border-border bg-secondary text-muted-foreground",
                )}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                {index < DELIVERY_STAGES.length - 1 && <span className={cn("h-10 w-px", activeIndex > index || final ? "bg-emerald-500" : "bg-border")} />}
              </div>
              <div className="pt-2">
                <p className={cn("font-bold", done || current ? "text-foreground" : "text-muted-foreground")}>{step.label}</p>
                {current && <p className="mt-1 text-xs text-cyan">جاري الآن</p>}
                {done && <p className="mt-1 text-xs text-emerald-500">مكتملة</p>}
              </div>
            </motion.div>
          );
        })}
        </div>
      )}
      {hasActiveOrder && (
        <div className="mt-5 border-t border-border/70 pt-4">
          {final ? (
            <button
              onClick={onFinish}
              disabled={!onFinish}
              className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              تم
            </button>
          ) : (
            <button onClick={handleNext} className="w-full rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
              التالي
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusButton({ label, status, active, onClick }: { label: string; status: DriverStatus; active: boolean; onClick: (s: DriverStatus) => void }) {
  return (
    <button onClick={() => onClick(status)} className={cn(
      "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold transition",
      active ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border bg-secondary/30 text-muted-foreground hover:border-cyan/40 hover:text-foreground",
    )}>
      <span className={cn("h-2.5 w-2.5 rounded-full", status === "online" ? "bg-cyan" : status === "busy" ? "bg-amber" : "bg-muted-foreground")} />
      {label}
    </button>
  );
}

function RoutePoint({ label, value, tone }: { label: string; value: string; tone: "cyan" | "primary" }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-bold", tone === "cyan" ? "text-cyan" : "text-primary")}>{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/35 p-3 text-center">
      <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display font-bold text-primary">{value}</p>
    </div>
  );
}
