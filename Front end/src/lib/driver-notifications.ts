import type { AuthUser } from "@/lib/auth";
import type { Order as CommerceOrder } from "@/lib/commerce";
import { getOrders } from "@/lib/commerce";
import type { RideOrder } from "@/lib/ride-orders";
import { getRideOrders } from "@/lib/ride-orders";

export type DriverNotificationType = "nearby" | "bonus" | "support" | "status";

export interface DriverNotification {
  id: string;
  type: DriverNotificationType;
  message: string;
  createdAt: string;
}

interface DriverBonusRecord {
  id: string;
  driverPhone: string;
  amount: number;
  rideId?: string;
  orderId?: string;
  createdAt: string;
}

interface DriverSupportMessageRecord {
  id: string;
  driverPhone: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

const DRIVER_BONUSES_KEY = "watan_go_driver_bonuses";
const DRIVER_SUPPORT_MESSAGES_KEY = "watan_go_driver_support_messages";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function isToday(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function extractCity(value: string) {
  return value.split(/[،,]/)[0]?.trim() || value.trim();
}

function belongsToDriver(phone: string, driverPhone?: string | null) {
  return Boolean(driverPhone && driverPhone === phone);
}

function getRideStatusMessage(ride: RideOrder) {
  if (ride.status === "accepted" || ride.status === "driver_assigned") {
    return `تم قبول الرحلة ${ride.id} وهي جاهزة للمتابعة.`;
  }
  if (ride.status === "on_the_way") return `الرحلة ${ride.id} في الطريق.`;
  if (ride.status === "completed") return `تم إكمال الرحلة ${ride.id} بنجاح.`;
  return null;
}

function getOrderStatusMessage(order: CommerceOrder) {
  if (order.driverStatus === "accepted") return `تم قبول توصيل الطلب ${order.id}.`;
  if (order.driverStatus === "picked_up") return `تم استلام الطلب ${order.id}.`;
  if (order.driverStatus === "delivered") return `تم تسليم الطلب ${order.id} للعميل.`;
  return null;
}

export async function getDriverNotifications(
  driver: Pick<AuthUser, "phone">,
  state?: {
    rides?: RideOrder[];
    orders?: CommerceOrder[];
  },
): Promise<DriverNotification[]> {
  const rides = state?.rides ?? getRideOrders();
  const orders = state?.orders ?? getOrders();
  const bonuses = readJson<DriverBonusRecord[]>(DRIVER_BONUSES_KEY, []);
  const supportMessages = readJson<DriverSupportMessageRecord[]>(DRIVER_SUPPORT_MESSAGES_KEY, []);

  const notifications: DriverNotification[] = [];

  rides
    .filter((ride) => ride.status === "pending" && isToday(ride.createdAt))
    .forEach((ride) => {
      notifications.push({
        id: `nearby-ride-${ride.id}`,
        type: "nearby",
        message: `طلب جديد قريب منك في ${extractCity(ride.pickup)}`,
        createdAt: ride.createdAt,
      });
    });

  orders
    .filter((order) => order.status === "pending" && order.driverStatus === "pending" && isToday(order.createdAt))
    .forEach((order) => {
      notifications.push({
        id: `nearby-order-${order.id}`,
        type: "nearby",
        message: `طلب جديد قريب منك في ${extractCity(order.vendorName)}`,
        createdAt: order.createdAt,
      });
    });

  rides
    .filter((ride) => belongsToDriver(driver.phone, ride.driverPhone) && isToday(ride.updatedAt))
    .forEach((ride) => {
      const message = getRideStatusMessage(ride);
      if (!message) return;
      notifications.push({
        id: `ride-status-${ride.id}-${ride.status}`,
        type: "status",
        message,
        createdAt: ride.updatedAt,
      });
    });

  orders
    .filter((order) => order.driverStatus !== "pending" && isToday(order.updatedAt))
    .forEach((order) => {
      const message = getOrderStatusMessage(order);
      if (!message) return;
      notifications.push({
        id: `order-status-${order.id}-${order.driverStatus}`,
        type: "status",
        message,
        createdAt: order.updatedAt,
      });
    });

  bonuses
    .filter((bonus) => bonus.driverPhone === driver.phone && bonus.amount > 0 && isToday(bonus.createdAt))
    .forEach((bonus) => {
      notifications.push({
        id: `bonus-${bonus.id}`,
        type: "bonus",
        message: `تم إضافة حافز ${bonus.amount} شيكل لرحلتك الأخيرة`,
        createdAt: bonus.createdAt,
      });
    });

  supportMessages
    .filter((message) => message.driverPhone === driver.phone && !message.read && isToday(message.createdAt))
    .forEach((supportMessage) => {
      notifications.push({
        id: `support-${supportMessage.id}`,
        type: "support",
        message: supportMessage.message,
        createdAt: supportMessage.createdAt,
      });
    });

  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
