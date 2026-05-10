import type { AuthUser } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

export type RideStatus =
  | "pending"
  | "accepted"
  | "driver_assigned"
  | "on_the_way"
  | "completed"
  | "cancelled";

export type DeliveryType = "internal" | "external";

export const INTERNAL_PRICE = 10;        // fixed ILS — same city, ≤ 7 km
export const EXTERNAL_PRICE_PER_KM = 3;  // ILS per km — different city or > 7 km
export const INTERNAL_MAX_KM = 7;        // hard radius cap inside the same city

// ── City resolution via Nominatim structured API ──────────────────────────────

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
}

/**
 * Fetch the exact administrative city/town name for a coordinate pair.
 * Uses Nominatim's structured `address` object — never the display_name string.
 * Priority: city > town > village > municipality > county.
 * Returns null on network failure or if no city-level field is present.
 */
export async function fetchCityName(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "ar" } },
    );
    if (!res.ok) return null;
    const data = await res.json() as { address?: NominatimAddress };
    const a = data.address;
    if (!a) return null;
    const name = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? null;
    return name ? normCity(name) : null;
  } catch {
    return null;
  }
}

/** Normalise a city name: lowercase + strip Arabic harakat + trim. */
function normCity(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\u064B-\u065F]/g, "") // strip Arabic harakat
    .trim();
}

/**
 * Strict delivery-type detection.
 *
 * Internal ONLY when ALL three conditions are true:
 *  1. Both city names are resolved (non-null).
 *  2. City names match exactly after normalisation.
 *  3. Haversine distance ≤ INTERNAL_MAX_KM (7 km).
 *
 * Any other case → external.
 * Returns null when GPS coords are not yet available.
 */
export function detectDeliveryType(
  pickupCity: string | null,
  destCity: string | null,
  pickupCoords: RideCoords | null,
  destCoords: RideCoords | null,
  distanceKm: number | null,
): DeliveryType | null {
  if (!pickupCoords || !destCoords) return null;
  if (pickupCoords.lat === 0 && pickupCoords.lng === 0) return null;
  if (destCoords.lat === 0   && destCoords.lng === 0)   return null;
  if (distanceKm == null) return null;

  // Both city names must be known and identical — no fallback to distance alone
  if (!pickupCity || !destCity || pickupCity !== destCity) return "external";

  // Same city — enforce 7 km radius cap
  return distanceKm <= INTERNAL_MAX_KM ? "internal" : "external";
}

export function calcDeliveryPrice(type: DeliveryType, distanceKm: number | null): number | null {
  if (type === "internal") return INTERNAL_PRICE;
  if (distanceKm == null || distanceKm === 0) return null;
  return parseFloat((distanceKm * EXTERNAL_PRICE_PER_KM).toFixed(1));
}

// ── Core types ────────────────────────────────────────────────────────────────

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
  deliveryType: DeliveryType;
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
    deliveryType: DeliveryType;
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
