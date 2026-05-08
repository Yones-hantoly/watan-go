import { useMemo, useState } from "react";
import { CheckCircle, Clock, Eye, MapPin, MapPinCheck, PackageCheck, Play, XCircle, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { type Order, type OrderStatus } from "@/lib/driver-mock-data";

interface OrdersSectionProps {
  orders: Order[];
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onViewDetails: (order: Order) => void;
}

const tabs: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "طلبات جديدة" },
  { value: "active", label: "طلبات نشطة" },
  { value: "completed", label: "مكتملة" },
  { value: "cancelled", label: "ملغاة" },
];

export function OrdersSection({ orders, onAccept, onReject, onStart, onComplete, onViewDetails }: OrdersSectionProps) {
  const [selectedTab, setSelectedTab] = useState<OrderStatus>("new");
  const grouped = useMemo(
    () => ({
      new: orders.filter((order) => order.status === "new"),
      active: orders.filter((order) => order.status === "active"),
      completed: orders.filter((order) => order.status === "completed"),
      cancelled: orders.filter((order) => order.status === "cancelled"),
    }),
    [orders],
  );

  return (
    <section className="space-y-5">
      <SectionTitle title="إدارة الطلبات" subtitle="تابع الطلبات الجديدة والنشطة وسجل الطلبات المكتملة من مكان واحد." />
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as OrderStatus)} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-secondary/30 p-2 md:grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {tab.label}
              <span className="me-2 rounded-full bg-background/50 px-2 text-xs">{grouped[tab.value].length}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-5 space-y-3">
            {grouped[tab.value].length > 0 ? (
              grouped[tab.value].map((order, index) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  index={index}
                  onAccept={onAccept}
                  onReject={onReject}
                  onStart={onStart}
                  onComplete={onComplete}
                  onViewDetails={onViewDetails}
                />
              ))
            ) : (
              <EmptyOrders status={tab.value} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function OrderCard({
  order,
  index,
  onAccept,
  onReject,
  onStart,
  onComplete,
  onViewDetails,
}: {
  order: Order;
  index: number;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onStart: (orderId: string) => void;
  onComplete: (orderId: string) => void;
  onViewDetails: (order: Order) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-white/10 bg-surface/85 p-4 shadow-[0_18px_55px_-40px_rgba(0,0,0,0.9)] transition hover:border-primary/35"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold text-foreground">{order.id}</h3>
            <span className="text-sm text-muted-foreground">{order.customerName}</span>
            <StatusBadge status={order.status} />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <LocationLine icon={MapPin} label="نقطة الاستلام" value={order.pickupLocation} tone="cyan" />
            <LocationLine icon={MapPinCheck} label="نقطة التسليم" value={order.deliveryLocation} tone="primary" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <InfoPill icon={MapPin} value={`${order.distance} كم`} />
            <InfoPill icon={Clock} value={`${order.duration} دقيقة`} />
            <InfoPill icon={PackageCheck} value={`${order.price} شيكل`} />
            <InfoPill icon={Clock} value={order.orderTime} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:w-80 xl:justify-end">
          {order.status === "new" && (
            <>
              <ActionButton icon={CheckCircle} label="قبول" tone="primary" onClick={() => onAccept(order.id)} />
              <ActionButton icon={XCircle} label="رفض" tone="secondary" onClick={() => onReject(order.id)} />
            </>
          )}
          {order.status === "active" && (
            <>
              <ActionButton icon={Play} label="بدء التوصيل" tone="cyan" onClick={() => onStart(order.id)} />
              <ActionButton icon={CheckCircle} label="إكمال الطلب" tone="primary" onClick={() => onComplete(order.id)} />
            </>
          )}
          <ActionButton icon={Eye} label="عرض التفاصيل" tone="secondary" onClick={() => onViewDetails(order)} />
        </div>
      </div>
    </motion.article>
  );
}

export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan/25 bg-cyan/10 p-4">
        <p className="text-sm text-muted-foreground">معلومات العميل</p>
        <p className="mt-2 font-display text-2xl font-bold">{order.customerName}</p>
        <a href={`tel:${order.customerPhone}`} className="mt-1 inline-block text-sm font-bold text-cyan">
          {order.customerPhone}
        </a>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailBox label="ملاحظات التوصيل" value={order.notes ?? "لا توجد ملاحظات خاصة"} />
        <DetailBox label="طريقة الدفع" value={paymentLabel(order.paymentMethod)} />
        <DetailBox label="الوقت المتوقع للوصول" value={order.estimatedDeliveryTime} />
        <DetailBox label="رسوم التوصيل" value={`${order.price} شيكل`} />
      </div>
      <div className="rounded-2xl border border-border bg-secondary/20 p-4">
        <h3 className="font-display font-bold">تفاصيل المسار</h3>
        <div className="mt-4 space-y-3">
          <LocationLine icon={MapPin} label="من" value={order.pickupLocation} tone="cyan" />
          <LocationLine icon={MapPinCheck} label="إلى" value={order.deliveryLocation} tone="primary" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <InfoPill icon={MapPin} value={`${order.distance} كم`} />
          <InfoPill icon={Clock} value={`${order.duration} دقيقة`} />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-display font-bold">سجل الطلب</h3>
        {order.timeline.map((event, index) => (
          <div key={`${event.label}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn("mt-1 h-3 w-3 rounded-full", event.done ? "bg-cyan" : "bg-muted-foreground")} />
              {index < order.timeline.length - 1 && <span className="h-10 w-px bg-border" />}
            </div>
            <div>
              <p className="font-bold">{event.label}</p>
              <p className="text-xs text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function EmptyOrders({ status }: { status: OrderStatus }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/15 p-10 text-center">
      <PackageCheck className="mx-auto h-10 w-10 text-muted-foreground/60" />
      <p className="mt-3 font-bold">لا توجد {statusLabel(status)} حاليا</p>
      <p className="mt-1 text-sm text-muted-foreground">ستظهر الطلبات هنا عند توفرها.</p>
    </div>
  );
}

function LocationLine({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: "cyan" | "primary" }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-secondary/20 p-3">
      <Icon className={cn("mt-1 h-4 w-4 shrink-0", tone === "cyan" ? "text-cyan" : "text-primary")} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/20 px-3 py-1">
      <Icon className="h-3.5 w-3.5" />
      {value}
    </span>
  );
}

function ActionButton({ icon: Icon, label, tone, onClick }: { icon: LucideIcon; label: string; tone: "primary" | "cyan" | "secondary"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition xl:flex-none",
        tone === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        tone === "cyan" && "bg-cyan text-primary-foreground hover:bg-cyan/90",
        tone === "secondary" && "border border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "rounded-lg px-2.5 py-1 text-xs font-bold",
        status === "new" && "bg-cyan/15 text-cyan",
        status === "active" && "bg-primary/15 text-primary",
        status === "completed" && "bg-emerald-500/15 text-emerald-400",
        status === "cancelled" && "bg-red-500/15 text-red-400",
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

function statusLabel(status: OrderStatus) {
  if (status === "new") return "طلبات جديدة";
  if (status === "active") return "طلبات نشطة";
  if (status === "completed") return "طلبات مكتملة";
  return "طلبات ملغاة";
}

function paymentLabel(method: Order["paymentMethod"]) {
  if (method === "cash") return "نقدا";
  if (method === "card") return "بطاقة بنكية";
  return "محفظة إلكترونية";
}

function DetailBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}
