// نظام أدوار للمنصة — يخزن محلياً (localStorage)
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
  password: string;
  role: PublicRegisterRole;
}

const AUTH_KEY = "watan_go_auth";
const ACCOUNTS_KEY = "watan_go_accounts";

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

export function setAuth(user: AuthUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
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

export function findRegisteredAccountByPhone(phone: string) {
  const normalizedPhone = normalizePhone(phone);
  return getRegisteredAccounts().find((account) => normalizePhone(account.phone) === normalizedPhone) ?? null;
}

export function registerAccount(account: RegisteredAccount) {
  const accounts = getRegisteredAccounts();
  const exists = accounts.some((storedAccount) => normalizePhone(storedAccount.phone) === normalizePhone(account.phone));
  if (exists) {
    return { ok: false as const, message: "رقم الهاتف مستخدم بالفعل" };
  }

  saveRegisteredAccounts([...accounts, account]);
  return { ok: true as const };
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
      return [
        { to: "/dashboard/restaurant", label: "إدارة الطلبات" },
        { to: "/dashboard/restaurant", label: "القائمة" },
      ];
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
