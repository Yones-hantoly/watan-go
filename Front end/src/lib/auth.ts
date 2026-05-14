// نظام أدوار للمنصة — يخزن محلياً (localStorage)
import { useSyncExternalStore } from "react";

export type Role = "customer" | "driver" | "restaurant" | "shop" | "admin";
export type PublicRegisterRole = Exclude<Role, "admin">;

export interface AuthUser {
  name: string;
  phone: string;
  role: Role;
}

export interface RoleNavLink {
  to: string;
  label: string;
}

export interface RegisteredAccount {
  name: string;
  phone: string;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number;
  role: Role;
}

const AUTH_KEY = "watan_go_auth";
const ACCOUNTS_KEY = "watan_go_accounts";
const AUDIT_LOG_KEY = "watan_go_audit_log";
const PENDING_LOGIN_ROLE_KEY = "watan_go_pending_login_role";
const AUTH_CHANGED_EVENT = "watan_go_auth_changed";
const PASSWORD_ITERATIONS = 210000;
const authListeners = new Set<() => void>();
let authSnapshot: AuthUser | null | undefined;
const INITIAL_ADMIN_ACCOUNT = {
  name: "System Administrator",
  phone: "0599990000",
  role: "admin" as const,
  passwordHash: "g_Y0CP-UQ1C72k4GWeFTqs7ft3XC57-zyLsdC_cD5d8",
  passwordSalt: "pMxnp9qbpw0dbVW2to7AGQ",
  passwordIterations: PASSWORD_ITERATIONS,
};

export const ROLES: { value: Role; label: string; emoji: string; route: string; desc: string }[] = [
  { value: "customer",   label: "مستخدم",       emoji: "🙋", route: "/dashboard/customer",   desc: "اطلب طعام، تسوّق، احجز رحلة" },
  { value: "driver",     label: "سائق",         emoji: "🚗", route: "/dashboard/driver",     desc: "استلم طلبات التوصيل والرحلات" },
  { value: "restaurant", label: "صاحب مطعم",    emoji: "🍔", route: "/dashboard/restaurant", desc: "أدر قائمتك والطلبات الواردة" },
  { value: "shop",       label: "صاحب محل",     emoji: "🏪", route: "/dashboard/shop",       desc: "أدر منتجاتك ومخزون متجرك" },
  { value: "admin",      label: "أدمن المنصة",  emoji: "🛡️", route: "/dashboard/admin",      desc: "إشراف كامل على المنظومة" },
];

export const PUBLIC_REGISTER_ROLES = ROLES.filter(
  (role): role is (typeof ROLES)[number] & { value: PublicRegisterRole } => role.value !== "admin",
);

export function isPublicRegisterRole(role: Role): role is PublicRegisterRole {
  return role !== "admin";
}

export function routeForRole(role: Role): string {
  return ROLES.find((r) => r.value === role)?.route ?? "/";
}

export function redirectToOwnDashboard(user: AuthUser | null) {
  if (!user) return "/login";
  return routeForRole(user.role);
}

export function labelForRole(role: Role): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

export function emojiForRole(role: Role): string {
  return ROLES.find((r) => r.value === role)?.emoji ?? "👤";
}

export function setPendingLoginRole(role: PublicRegisterRole) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PENDING_LOGIN_ROLE_KEY, role);
}

export function getPendingLoginRole(): PublicRegisterRole | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PENDING_LOGIN_ROLE_KEY);
  return raw && isPublicRegisterRole(raw as Role) ? (raw as PublicRegisterRole) : null;
}

export function clearPendingLoginRole() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_LOGIN_ROLE_KEY);
}

function readAuthFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function getAuthSnapshot() {
  if (authSnapshot === undefined) {
    authSnapshot = readAuthFromStorage();
  }
  return authSnapshot;
}

function publishAuth(nextUser: AuthUser | null, notifyWindow = false) {
  authSnapshot = nextUser;
  authListeners.forEach((listener) => listener());

  if (notifyWindow && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
  }
}

export function subscribeToAuth(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  authListeners.add(listener);
  const handleAuthChanged = () => {
    publishAuth(readAuthFromStorage());
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== AUTH_KEY) return;
    publishAuth(readAuthFromStorage());
  };

  window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
  window.addEventListener("storage", handleStorage);

  return () => {
    authListeners.delete(listener);
    window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useAuth() {
  return useSyncExternalStore(subscribeToAuth, getAuthSnapshot, () => null);
}

export function setAuth(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  publishAuth(user, true);
}

export function getAuth(): AuthUser | null {
  return getAuthSnapshot();
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  publishAuth(null, true);
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(left: string, right: string) {
  const leftBytes = base64UrlToBytes(left);
  const rightBytes = base64UrlToBytes(right);
  if (leftBytes.length !== rightBytes.length) return false;

  let diff = 0;
  leftBytes.forEach((byte, index) => {
    diff |= byte ^ rightBytes[index];
  });
  return diff === 0;
}

async function hashPassword(password: string, salt: string, iterations = PASSWORD_ITERATIONS) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations,
    },
    key,
    256,
  );
  return bytesToBase64Url(new Uint8Array(bits));
}

async function createPasswordRecord(password: string) {
  const salt = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  return {
    passwordHash: await hashPassword(password, salt),
    passwordSalt: salt,
    passwordIterations: PASSWORD_ITERATIONS,
  };
}

function appendAuditLog(event: string, details: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    const logs = raw ? (JSON.parse(raw) as Array<Record<string, string>>) : [];
    localStorage.setItem(
      AUDIT_LOG_KEY,
      JSON.stringify([
        ...logs,
        {
          event,
          timestamp: new Date().toISOString(),
          ...details,
        },
      ]),
    );
  } catch {
    // Audit logging must not block authentication.
  }
}

export function getRegisteredAccounts(): RegisteredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as RegisteredAccount[]) : [];
  } catch {
    return [];
  }
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function ensureInitialAdminAccount() {
  if (typeof window === "undefined") return null;

  const accounts = getRegisteredAccounts();
  const adminExists = accounts.some(
    (account) =>
      account.role === "admin" ||
      normalizePhone(account.phone) === normalizePhone(INITIAL_ADMIN_ACCOUNT.phone),
  );

  if (adminExists) return null;

  saveRegisteredAccounts([...accounts, INITIAL_ADMIN_ACCOUNT]);
  appendAuditLog("admin.bootstrap.created", {
    phone: INITIAL_ADMIN_ACCOUNT.phone,
    role: INITIAL_ADMIN_ACCOUNT.role,
  });
  return INITIAL_ADMIN_ACCOUNT;
}

export function findRegisteredAccountByPhone(phone: string) {
  ensureInitialAdminAccount();
  const normalizedPhone = normalizePhone(phone);
  return getRegisteredAccounts().find((account) => normalizePhone(account.phone) === normalizedPhone) ?? null;
}

export async function registerAccount(account: { name: string; phone: string; password: string; role: PublicRegisterRole }) {
  ensureInitialAdminAccount();
  const accounts = getRegisteredAccounts();
  const exists = accounts.some((storedAccount) => normalizePhone(storedAccount.phone) === normalizePhone(account.phone));
  if (exists) {
    return { ok: false as const, message: "رقم الهاتف مستخدم بالفعل" };
  }

  const passwordRecord = await createPasswordRecord(account.password);
  saveRegisteredAccounts([
    ...accounts,
    {
      name: account.name,
      phone: account.phone,
      role: account.role,
      ...passwordRecord,
    },
  ]);
  return { ok: true as const };
}

export async function authenticateAccount(phone: string, password: string) {
  const account = findRegisteredAccountByPhone(phone);
  if (!account) {
    appendAuditLog("auth.login.failed", { phone: normalizePhone(phone), reason: "account_not_found" });
    return { ok: false as const, reason: "account_not_found" as const };
  }

  if (account.passwordHash && account.passwordSalt) {
    const hash = await hashPassword(password, account.passwordSalt, account.passwordIterations ?? PASSWORD_ITERATIONS);
    if (!timingSafeEqual(hash, account.passwordHash)) {
      appendAuditLog("auth.login.failed", { phone: normalizePhone(phone), reason: "invalid_password" });
      return { ok: false as const, reason: "invalid_password" as const };
    }
  } else if (account.password !== password) {
    appendAuditLog("auth.login.failed", { phone: normalizePhone(phone), reason: "invalid_password" });
    return { ok: false as const, reason: "invalid_password" as const };
  }

  appendAuditLog("auth.login.success", { phone: normalizePhone(account.phone), role: account.role });
  return { ok: true as const, account };
}

export function getDashboardNavLinks(role: Role): RoleNavLink[] {
  switch (role) {
    case "customer":
      return [
        { to: "/restaurants", label: "طلب طعام" },
        { to: "/shops", label: "تسوق" },
        { to: "/ride-request", label: "رحلات" },
      ];
    case "driver":
      return [
        { to: "/dashboard/driver", label: "الطلبات" },
        { to: "/dashboard/driver", label: "التوصيل" },
      ];
    case "restaurant":
      return [];
    case "shop":
      return [
        { to: "/dashboard/shop", label: "المنتجات" },
        { to: "/dashboard/shop", label: "الطلبات" },
      ];
    case "admin":
      return [{ to: "/dashboard/admin", label: "لوحة الإدارة" }];
    default:
      return [];
  }
}
