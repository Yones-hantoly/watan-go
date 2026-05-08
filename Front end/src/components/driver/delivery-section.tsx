import { useState } from "react";
import { CheckCircle2, Clock, MapPin, Navigation, PackageCheck, RadioTower } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { type DriverStatus, type Order } from "@/lib/driver-mock-data";

interface DeliverySectionProps {
  currentOrder?: Order;
  driverStatus: DriverStatus;
  onStatusChange: (status: DriverStatus) => void;
}

export function DeliverySection({ currentOrder, driverStatus, onStatusChange }: DeliverySectionProps) {
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
          <StatusButton label="متصل" status="online" active={driverStatus === "online"} onClick={onStatusChange} />
          <StatusButton label="مشغول" status="busy" active={driverStatus === "busy"} onClick={onStatusChange} />
          <StatusButton label="غير متصل" status="offline" active={driverStatus === "offline"} onClick={onStatusChange} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {currentOrder ? <ActiveDelivery order={currentOrder} /> : <NoActiveDelivery />}
          <MapPlaceholder />
        </div>
        <DeliveryTimeline />
      </div>
    </section>
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
          <RoutePoint label="من" value={order.pickupLocation} tone="cyan" />
          <RoutePoint label="إلى" value={order.deliveryLocation} tone="primary" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniMetric label="المسافة" value={`${order.distance} كم`} />
        <MiniMetric label="الوقت المتوقع" value={`${order.duration} د`} />
        <MiniMetric label="رسوم التوصيل" value={`${order.price} شيكل`} />
        <MiniMetric label="الوصول" value={order.estimatedDeliveryTime} />
      </div>
    </div>
  );
}

function NoActiveDelivery() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/15 p-10 text-center">
      <PackageCheck className="mx-auto h-12 w-12 text-muted-foreground/60" />
      <p className="mt-3 font-display text-lg font-bold">لا يوجد توصيل نشط</p>
      <p className="mt-1 text-sm text-muted-foreground">اقبل طلبا جديدا ليظهر هنا مسار التوصيل الحالي.</p>
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
      <div className="relative aspect-[16/10] min-h-[280px] bg-[linear-gradient(135deg,rgba(11,31,51,0.9),rgba(20,54,82,0.92))]">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute right-[18%] top-[28%] h-4 w-4 rounded-full bg-cyan shadow-[0_0_40px_rgba(103,232,249,0.8)]" />
        <div className="absolute left-[20%] bottom-[24%] h-4 w-4 rounded-full bg-primary shadow-[0_0_40px_rgba(251,146,60,0.8)]" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 500" aria-hidden="true">
          <path d="M650 140 C530 160 520 260 430 275 S260 280 170 380" fill="none" stroke="rgb(103 232 249)" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 16" />
        </svg>
        <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-background/80 p-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-bold">خريطة المسار</p>
              <p className="text-xs text-muted-foreground">نموذج بصري جاهز للربط مع خرائط حقيقية لاحقا.</p>
            </div>
            <MapPin className="h-6 w-6 text-cyan" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DeliveryTimeline() {
  const [activeStep, setActiveStep] = useState(3);
  const steps = ["تم قبول الطلب", "وصل إلى نقطة الاستلام", "تم استلام الطلب", "في الطريق", "تم التسليم بنجاح"];

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/85 p-5">
      <h3 className="font-display text-lg font-bold">تقدم التوصيل</h3>
      <div className="mt-5 space-y-1">
        {steps.map((step, index) => {
          const current = index + 1;
          const done = activeStep >= current;
          return (
            <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold", done ? "border-primary bg-primary/20 text-primary" : "border-border bg-secondary text-muted-foreground")}>
                  {done ? <CheckCircle2 className="h-4 w-4" /> : current}
                </span>
                {index < steps.length - 1 && <span className={cn("h-10 w-px", activeStep > current ? "bg-primary" : "bg-border")} />}
              </div>
              <div className="pt-2">
                <p className={cn("font-bold", done ? "text-foreground" : "text-muted-foreground")}>{step}</p>
                {activeStep === current && <p className="mt-1 text-xs text-cyan">جاري الآن</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-5 flex gap-2 border-t border-border/70 pt-4">
        <button onClick={() => setActiveStep((step) => Math.max(1, step - 1))} className="flex-1 rounded-xl border border-border bg-secondary/40 px-3 py-2 text-sm font-bold transition hover:border-primary/40">
          السابق
        </button>
        <button onClick={() => setActiveStep((step) => Math.min(5, step + 1))} className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90">
          التالي
        </button>
      </div>
    </div>
  );
}

function StatusButton({ label, status, active, onClick }: { label: string; status: DriverStatus; active: boolean; onClick: (status: DriverStatus) => void }) {
  return (
    <button
      onClick={() => onClick(status)}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-bold transition",
        active ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border bg-secondary/30 text-muted-foreground hover:border-cyan/40 hover:text-foreground",
      )}
    >
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
