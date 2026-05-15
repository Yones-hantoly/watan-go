import { Eye, Pencil, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard-shell";
import {
  ensureInitialAdminAccount,
  getRegisteredAccounts,
  labelForRole,
  normalizePhone,
  ROLES,
  saveRegisteredAccounts,
  type RegisteredAccount,
  type Role,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

type UserStatus = "active" | "pending" | "suspended";

interface UserMeta {
  status: UserStatus;
  createdAt: string;
}

interface UserFormState {
  name: string;
  phone: string;
  role: Role;
  status: UserStatus;
  password: string;
}

const META_KEY = "watan_go_admin_user_meta";

const statusLabels: Record<UserStatus, string> = {
  active: "نشط",
  pending: "قيد المراجعة",
  suspended: "موقوف",
};

const emptyForm: UserFormState = {
  name: "",
  phone: "",
  role: "customer",
  status: "active",
  password: "",
};

const fieldClass =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary";

export function AdminUsersPage() {
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [detailsPhone, setDetailsPhone] = useState<string | null>(null);
  const [deletePhone, setDeletePhone] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const users = useMemo(() => loadUsers(), [version]);
  const filteredUsers = users.filter((user) => {
    const meta = user.meta;
    const searchHit = [user.name, user.phone, labelForRole(user.role)]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const roleHit = roleFilter === "all" || user.role === roleFilter;
    const statusHit = statusFilter === "all" || meta.status === statusFilter;
    return searchHit && roleHit && statusHit;
  });

  const selectedUser = users.find((user) => normalizePhone(user.phone) === detailsPhone);
  const deleteUser = users.find((user) => normalizePhone(user.phone) === deletePhone);
  const isEditing = Boolean(editingPhone);

  const openAdd = () => {
    setEditingPhone("");
    setForm(emptyForm);
  };

  const openEdit = (user: RegisteredAccount & { meta: UserMeta }) => {
    setEditingPhone(normalizePhone(user.phone));
    setForm({
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.meta.status,
      password: "",
    });
  };

  const closeForm = () => {
    setEditingPhone(null);
    setForm(emptyForm);
  };

  const saveUser = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const normalizedPhone = normalizePhone(phone);

    if (!name || !normalizedPhone) {
      toast.error("أدخل الاسم ورقم الهاتف قبل الحفظ");
      return;
    }

    const accounts = getRegisteredAccounts();
    const existingIndex = accounts.findIndex(
      (account) => normalizePhone(account.phone) === normalizedPhone,
    );
    const editingExistingIndex = accounts.findIndex(
      (account) => normalizePhone(account.phone) === editingPhone,
    );
    const duplicate =
      existingIndex !== -1 &&
      (!isEditing || normalizePhone(accounts[existingIndex].phone) !== editingPhone);

    if (duplicate) {
      toast.error("رقم الهاتف مستخدم بالفعل");
      return;
    }

    const nextAccount: RegisteredAccount = {
      ...(isEditing && editingExistingIndex !== -1 ? accounts[editingExistingIndex] : {}),
      name,
      phone,
      role: form.role,
    };

    if (!isEditing || form.password.trim()) {
      nextAccount.password = form.password.trim() || "123456";
      delete nextAccount.passwordHash;
      delete nextAccount.passwordSalt;
      delete nextAccount.passwordIterations;
    }

    const nextAccounts =
      isEditing && editingExistingIndex !== -1
        ? accounts.map((account, index) => (index === editingExistingIndex ? nextAccount : account))
        : [...accounts, nextAccount];

    saveRegisteredAccounts(nextAccounts);
    saveMeta({
      ...readMeta(),
      [normalizedPhone]: {
        status: form.status,
        createdAt:
          editingExistingIndex !== -1
            ? getUserMeta(accounts[editingExistingIndex]).createdAt
            : new Date().toISOString(),
      },
    });

    toast.success(isEditing ? "تم تحديث بيانات المستخدم" : "تم إضافة المستخدم");
    closeForm();
    setVersion((current) => current + 1);
  };

  const confirmDelete = () => {
    if (!deletePhone) return;
    const accounts = getRegisteredAccounts().filter(
      (account) => normalizePhone(account.phone) !== deletePhone,
    );
    const meta = readMeta();
    delete meta[deletePhone];
    saveRegisteredAccounts(accounts);
    saveMeta(meta);
    setDeletePhone(null);
    setVersion((current) => current + 1);
    toast.success("تم حذف المستخدم");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            إدارة حسابات مستخدمي وطن جو، مراجعة الأدوار والحالات، وإضافة أو تعديل الحسابات من لوحة
            الإدارة.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          إضافة مستخدم
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="إجمالي المستخدمين" value={String(users.length)} accent="primary" />
        <StatCard
          label="حسابات نشطة"
          value={String(users.filter((user) => user.meta.status === "active").length)}
          accent="cyan"
        />
        <StatCard
          label="قيد المراجعة"
          value={String(users.filter((user) => user.meta.status === "pending").length)}
          accent="amber"
        />
        <StatCard
          label="أدوار مختلفة"
          value={String(new Set(users.map((user) => user.role)).size)}
          accent="primary"
        />
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-secondary/20 p-3 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث بالاسم أو رقم الهاتف أو الدور"
            className="h-11 w-full rounded-xl border border-border bg-background px-9 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as Role | "all")}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary"
        >
          <option value="all">كل الأدوار</option>
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as UserStatus | "all")}
          className="h-11 rounded-xl border border-border bg-background px-3 text-sm font-semibold outline-none transition focus:border-primary"
        >
          <option value="all">كل الحالات</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="hidden grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_0.8fr_auto] gap-3 border-b border-border bg-secondary/30 px-4 py-3 text-xs font-bold text-muted-foreground lg:grid">
          <span>اسم المستخدم</span>
          <span>رقم الهاتف</span>
          <span>نوع الحساب / الدور</span>
          <span>الحالة</span>
          <span>تاريخ التسجيل</span>
          <span>الإجراءات</span>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">لا توجد نتائج مطابقة.</div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.phone}
              className="grid gap-3 border-b border-border/60 px-4 py-4 text-sm last:border-b-0 lg:grid-cols-[1.2fr_0.9fr_0.8fr_0.7fr_0.8fr_auto] lg:items-center"
            >
              <div>
                <p className="font-bold">{user.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">{user.phone}</p>
              </div>
              <span className="hidden text-muted-foreground lg:block">{user.phone}</span>
              <span className="text-muted-foreground">{labelForRole(user.role)}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-2.5 py-1 text-xs font-bold",
                  user.meta.status === "active" && "bg-emerald-500/15 text-emerald-500",
                  user.meta.status === "pending" && "bg-amber/15 text-amber",
                  user.meta.status === "suspended" && "bg-destructive/10 text-destructive",
                )}
              >
                {statusLabels[user.meta.status]}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(user.meta.createdAt).toLocaleDateString("ar-SA")}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setDetailsPhone(normalizePhone(user.phone))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs font-bold transition hover:bg-secondary"
                >
                  <Eye className="h-3.5 w-3.5" />
                  عرض التفاصيل
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(user)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/15"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => setDeletePhone(normalizePhone(user.phone))}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingPhone !== null && (
        <Modal title={isEditing ? "تعديل مستخدم" : "إضافة مستخدم"} onClose={closeForm}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الاسم الكامل">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="رقم الهاتف">
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                className={fieldClass}
              />
            </Field>
            <Field label="نوع الحساب">
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
                className={fieldClass}
              >
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="الحالة">
              <select
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })}
                className={fieldClass}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={isEditing ? "كلمة المرور الجديدة إن لزم" : "كلمة المرور"}>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={isEditing ? "اتركها فارغة بدون تغيير" : "اختياري، الافتراضي 123456"}
                className={fieldClass}
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-border px-4 py-2 text-sm font-bold transition hover:bg-secondary"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={saveUser}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
            >
              حفظ
            </button>
          </div>
        </Modal>
      )}

      {selectedUser && (
        <Modal title="تفاصيل المستخدم" onClose={() => setDetailsPhone(null)}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="الاسم" value={selectedUser.name} />
            <Detail label="رقم الهاتف" value={selectedUser.phone} />
            <Detail label="الدور" value={labelForRole(selectedUser.role)} />
            <Detail label="الحالة" value={statusLabels[selectedUser.meta.status]} />
            <Detail
              label="تاريخ التسجيل"
              value={new Date(selectedUser.meta.createdAt).toLocaleString("ar-SA")}
            />
          </dl>
        </Modal>
      )}

      {deleteUser && (
        <Modal title="تأكيد حذف المستخدم" onClose={() => setDeletePhone(null)}>
          <p className="text-sm text-muted-foreground">
            هل تريد حذف حساب {deleteUser.name}؟ لن يتم الحذف إلا بعد تأكيدك.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeletePhone(null)}
              className="rounded-xl border border-border px-4 py-2 text-sm font-bold transition hover:bg-secondary"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-xl bg-destructive px-4 py-2 text-sm font-bold text-destructive-foreground transition hover:bg-destructive/90"
            >
              تأكيد الحذف
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function loadUsers(): Array<RegisteredAccount & { meta: UserMeta }> {
  ensureInitialAdminAccount();
  const meta = readMeta();
  const accounts = getRegisteredAccounts();
  let changed = false;
  const users = accounts.map((account) => {
    const key = normalizePhone(account.phone);
    if (!meta[key]) {
      meta[key] = getUserMeta(account);
      changed = true;
    }
    return { ...account, meta: meta[key] };
  });
  if (changed) saveMeta(meta);
  return users;
}

function readMeta(): Record<string, UserMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Record<string, UserMeta>) : {};
  } catch {
    return {};
  }
}

function saveMeta(meta: Record<string, UserMeta>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function getUserMeta(account: RegisteredAccount): UserMeta {
  return {
    status: "active",
    createdAt: new Date().toISOString(),
    ...readMeta()[normalizePhone(account.phone)],
  };
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm font-bold">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-3">
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
