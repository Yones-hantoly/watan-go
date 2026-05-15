import { getOrders, saveOrders, type Order, type OrderStatus } from "@/lib/commerce";

export type DeliveryStage =
  | "created"
  | "accepted"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "on_the_way"
  | "completed"
  | "delivered";

export const DELIVERY_STAGES: { id: DeliveryStage; label: string }[] = [
  { id: "created", label: "تم إنشاء الطلب" },
  { id: "accepted", label: "تم قبول الطلب" },
  { id: "preparing", label: "قيد التجهيز" },
  { id: "ready_for_pickup", label: "جاهز للاستلام" },
  { id: "picked_up", label: "تم الاستلام" },
  { id: "on_the_way", label: "في الطريق" },
  { id: "completed", label: "تم التسليم بنجاح" },
];

export const FINAL_DELIVERY_STAGE: DeliveryStage = "completed";

export function getOrderDeliveryStage(
  order: Pick<Order, "deliveryStage" | "status" | "driverStatus">,
): DeliveryStage {
  if (order.deliveryStage)
    return order.deliveryStage === "delivered" ? "completed" : order.deliveryStage;
  if (
    order.status === "completed" ||
    order.status === "delivered" ||
    order.driverStatus === "completed" ||
    order.driverStatus === "delivered"
  )
    return "completed";
  if (order.status === "on_the_way") return "on_the_way";
  if (order.driverStatus === "on_the_way") return "on_the_way";
  if (order.status === "picked_up" || order.driverStatus === "picked_up") return "picked_up";
  if (order.status === "ready_for_pickup") return "ready_for_pickup";
  if (order.status === "preparing") return "preparing";
  if (order.driverStatus === "accepted" || order.status === "accepted") return "accepted";
  return "created";
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
  const nextStage = stage === "delivered" ? "completed" : stage;

  saveOrders(
    getOrders().map((order) => {
      if (order.id !== orderId) return order;
      updatedOrder = {
        ...order,
        deliveryStage: nextStage,
        driverStatus: stageToDriverStatus(nextStage, order.driverStatus),
        status: stageToOrderStatus(nextStage, order.status),
        updatedAt: now,
        completedAt: isFinalDeliveryStage(nextStage) ? now : order.completedAt,
      };
      return updatedOrder;
    }),
  );

  return updatedOrder;
}

function stageToDriverStatus(
  stage: DeliveryStage,
  currentStatus: Order["driverStatus"],
): Order["driverStatus"] {
  if (stage === "picked_up") return "picked_up";
  if (stage === "on_the_way") return "on_the_way";
  if (stage === "completed" || stage === "delivered") return "completed";
  if (
    stage === "created" ||
    stage === "accepted" ||
    stage === "preparing" ||
    stage === "ready_for_pickup"
  )
    return "pending";
  return currentStatus;
}

function stageToOrderStatus(stage: DeliveryStage, currentStatus: OrderStatus): OrderStatus {
  if (stage === "completed" || stage === "delivered") return "completed";
  if (stage === "on_the_way") return "on_the_way";
  if (stage === "picked_up") return "picked_up";
  if (stage === "ready_for_pickup") return "ready_for_pickup";
  if (stage === "preparing") return "preparing";
  if (stage === "accepted") return "accepted";
  if (stage === "created") return "pending";
  if (currentStatus === "pending") return "accepted";
  return currentStatus === "delivered" ? "completed" : currentStatus;
}
