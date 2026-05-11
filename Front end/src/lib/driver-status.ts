import { normalizePhone } from "@/lib/auth";
import { type DriverStatus } from "@/lib/driver-mock-data";

const DRIVER_STATUS_KEY = "watan_go_driver_status";
const DRIVER_STATUS_EVENT = "watan-go-driver-status-updated";

type DriverStatusRecord = Record<string, DriverStatus>;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function emitDriverStatusUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DRIVER_STATUS_EVENT));
}

function driverKey(phone: string) {
  return normalizePhone(phone);
}

export function getDriverStatus(phone: string): DriverStatus {
  const statuses = readJson<DriverStatusRecord>(DRIVER_STATUS_KEY, {});
  return statuses[driverKey(phone)] ?? "online";
}

export function updateDriverAvailabilityStatus(phone: string, status: DriverStatus) {
  const statuses = readJson<DriverStatusRecord>(DRIVER_STATUS_KEY, {});
  writeJson(DRIVER_STATUS_KEY, { ...statuses, [driverKey(phone)]: status });
  emitDriverStatusUpdated();
  return { ok: true as const, status };
}

export function subscribeToDriverStatus(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(DRIVER_STATUS_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(DRIVER_STATUS_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
