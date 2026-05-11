import {
  getOrders,
  saveOrders,
  type Order,
  type OrderStatus,
} from "@/lib/commerce";

export type DeliveryStage = "accepted" | "arrived_pickup" | "picked_up" | "on_the_way" | "delivered";

export const DELIVERY_STAGES: { id: DeliveryStage; label: string }[] = [
  { id: "accepted", label: "تم قبول الطلب" },
  { id: "arrived_pickup", label: "وصل إلى نقطة الاستلام" },
  { id: "picked_up", label: "تم استلام الطلب" },
  { id: "on_the_way", label: "في الطريق" },
  { id: "delivered", label: "تم التسليم بنجاح" },
];

export const FINAL_DELIVERY_STAGE: DeliveryStage = "delivered";

export function getOrderDeliveryStage(order: Pick<Order, "deliveryStage" | "status" | "driverStatus">): DeliveryStage {
  if (order.deliveryStage) return order.deliveryStage;
  if (order.status === "delivered" || order.driverStatus === "delivered") return "delivered";
  if (order.status === "on_the_way") return "on_the_way";
  if (order.driverStatus === "picked_up") return "picked_up";
  if (order.driverStatus === "accepted" || order.status === "accepted" || order.status === "preparing") return "accepted";
  return "accepted";
}

export function getNextDeliveryStage(stage: DeliveryStage) {
  const index = DELIVERY_STAGES.findIndex((item) => item.id === stage);
  return DELIVERY_STAGES[index + 1]?.id ?? null;
}

export function isFinalDeliveryStage(stage: DeliveryStage) {
  return stage === FINAL_DELIVERY_STAGE;
}

export function advanceOrderDeliveryStage(orderId: string) {
  const orders = getOrders();
  const order = orders.find((item) => item.id === orderId);
  if (!order) return null;

  const currentStage = getOrderDeliveryStage(order);
  const nextStage = getNextDeliveryStage(currentStage);
  if (!nextStage) return order;

  return setOrderDeliveryStage(orderId, nextStage);
}

export function setOrderDeliveryStage(orderId: string, stage: DeliveryStage) {
  let updatedOrder: Order | null = null;
  const now = new Date().toISOString();

  saveOrders(
    getOrders().map((order) => {
      if (order.id !== orderId) return order;
      updatedOrder = {
        ...order,
        deliveryStage: stage,
        driverStatus: stageToDriverStatus(stage),
        status: stageToOrderStatus(stage, order.status),
        updatedAt: now,
        completedAt: stage === "delivered" ? now : order.completedAt,
      };
      return updatedOrder;
    }),
  );

  return updatedOrder;
}

function stageToDriverStatus(stage: DeliveryStage): Order["driverStatus"] {
  if (stage === "picked_up" || stage === "on_the_way") return "picked_up";
  if (stage === "delivered") return "delivered";
  return "accepted";
}

function stageToOrderStatus(stage: DeliveryStage, currentStatus: OrderStatus): OrderStatus {
  if (stage === "delivered") return "delivered";
  if (stage === "on_the_way" || stage === "picked_up") return "on_the_way";
  if (currentStatus === "pending") return "accepted";
  return currentStatus === "delivered" ? "delivered" : currentStatus;
}
