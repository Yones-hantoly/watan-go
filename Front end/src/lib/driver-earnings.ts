import type { Order as CommerceOrder } from "@/lib/commerce";
import type { RideOrder } from "@/lib/ride-orders";
import { isToday } from "@/lib/driver-stats";

export type DriverEarningItemType = "ride" | "delivery";

export interface DriverEarningItem {
  id: string;
  type: DriverEarningItemType;
  pickup: string;
  destination: string;
  fare: number;
  completedAt: string;
}

export interface DailyDriverEarnings {
  totalEarnings: number;
  completedCount: number;
  items: DriverEarningItem[];
}

export function getDailyDriverEarnings(params: {
  driverPhone: string;
  rides: RideOrder[];
  orders: CommerceOrder[];
  now?: Date;
}): DailyDriverEarnings {
  const now = params.now ?? new Date();

  const rideItems: DriverEarningItem[] = params.rides
    .filter((ride) =>
      ride.driverPhone === params.driverPhone &&
      ride.status === "completed" &&
      isToday(ride.completedAt ?? ride.updatedAt, now),
    )
    .map((ride) => ({
      id: ride.id,
      type: "ride",
      pickup: ride.pickup,
      destination: ride.destination,
      fare: Number(ride.price ?? 0),
      completedAt: ride.completedAt ?? ride.updatedAt,
    }));

  const deliveryItems: DriverEarningItem[] = params.orders
    .filter((order) =>
      order.driverPhone === params.driverPhone &&
      (order.status === "completed" || order.status === "delivered" || order.driverStatus === "completed" || order.driverStatus === "delivered") &&
      isToday(order.completedAt ?? order.updatedAt, now),
    )
    .map((order) => ({
      id: order.id,
      type: "delivery",
      pickup: order.vendorName,
      destination: order.deliveryAddress,
      fare: Number(order.deliveryFee || order.total || 0),
      completedAt: order.completedAt ?? order.updatedAt,
    }));

  const items = [...rideItems, ...deliveryItems].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  );

  return {
    totalEarnings: items.reduce((sum, item) => sum + item.fare, 0),
    completedCount: items.length,
    items,
  };
}
