import type { AuthUser } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RideStatus =
  | "pending"
  | "accepted"
  | "driver_assigned"
  | "on_the_way"
  | "completed"
  | "cancelled";

export interface RideCoords { lat: number; lng: number }

export interface RideOrder {
  id: string;
  user: AuthUser;
  pickup: string;
  pickupCoords: RideCoords | null;
  destination: string;
  destinationCoords: RideCoords | null;
  distanceKm: number | null;
  durationLabel: string | null;
  price: number | null;
  status: RideStatus;
  driverName: string | null;
  driverPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Storage keys & event ──────────────────────────────────────────────────────

const RIDE_ORDERS_KEY = "watan_go_ride_orders";
const RIDE_EVENT      = "watan-go-ride-orders-updated";

// ── Internal helpers ──────────────────────────────────────────────────────────

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RIDE_EVENT));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getRideOrders(): RideOrder[] {
  return readJson<RideOrder[]>(RIDE_ORDERS_KEY, []);
}

export function saveRideOrders(orders: RideOrder[]) {
  writeJson(RIDE_ORDERS_KEY, orders);
  emit();
}

/** Subscribe to any ride-order change (localStorage cross-tab + same-tab event). */
export function subscribeToRideOrders(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(RIDE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(RIDE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function createRideOrder(
  user: AuthUser,
  params: {
    pickup: string;
    pickupCoords: RideCoords | null;
    destination: string;
    destinationCoords: RideCoords | null;
    distanceKm: number | null;
    durationLabel: string | null;
    price: number | null;
  },
): RideOrder {
  const now = new Date().toISOString();
  const order: RideOrder = {
    id: `RD-${Date.now()}`,
    user,
    ...params,
    status: "pending",
    driverName: null,
    driverPhone: null,
    createdAt: now,
    updatedAt: now,
  };
  saveRideOrders([order, ...getRideOrders()]);
  return order;
}

export function updateRideStatus(id: string, status: RideStatus, extra?: { driverName?: string; driverPhone?: string }) {
  saveRideOrders(
    getRideOrders().map((o) =>
      o.id === id
        ? { ...o, status, ...extra, updatedAt: new Date().toISOString() }
        : o,
    ),
  );
}

export function assignDriver(id: string, driverName: string, driverPhone: string) {
  updateRideStatus(id, "driver_assigned", { driverName, driverPhone });
}

// ── Status display helpers ────────────────────────────────────────────────────

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
  pending:         "قيد الانتظار",
  accepted:        "مقبول",
  driver_assigned: "تم تعيين سائق",
  on_the_way:      "في الطريق",
  completed:       "مكتمل",
  cancelled:       "ملغي",
};

export const RIDE_STATUS_COLORS: Record<RideStatus, string> = {
  pending:         "bg-amber/15 text-amber",
  accepted:        "bg-cyan/15 text-cyan",
  driver_assigned: "bg-primary/15 text-primary",
  on_the_way:      "bg-emerald-500/15 text-emerald-500",
  completed:       "bg-emerald-500/15 text-emerald-600",
  cancelled:       "bg-destructive/15 text-destructive",
};
