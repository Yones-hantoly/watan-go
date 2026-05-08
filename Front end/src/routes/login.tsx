import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Phone, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  PUBLIC_REGISTER_ROLES,
  findRegisteredAccountByPhone,
  isPublicRegisterRole,
  normalizePhone,
  routeForRole,
  setAuth,
  type PublicRegisterRole,
} from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — وطن جو | Watan Go" },
      { name: "description", content: "سجّل الدخول إلى منصة وطن جو لتوصيل الطعام والتسوق والتنقل في مدينتك." },
      { property: "og:title", content: "تسجيل الدخول — وطن جو" },
      { property: "og:description", content: "بوابة الدخول الآمنة إلى منظومة وطن جو." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<PublicRegisterRole>("customer");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const validate = () => {
    const nextErrors: typeof errors = {};
    const digits = normalizePhone(phone);
    if (digits.length < 9) nextErrors.phone = "رقم الهاتف غير صحيح";
    if (password.length < 4) nextErrors.password = "كلمة المرور قصيرة جدًا";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!isPublicRegisterRole(role)) {
      toast.error("نوع الحساب غير متاح من شاشة الدخول العامة");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));

    const account = findRegisteredAccountByPhone(phone);

    if (!account) {
      setLoading(false);
      setShake(true);
      setErrors({ phone: "رقم الهاتف غير مسجل" });
      setTimeout(() => setShake(false), 500);
      toast.error("رقم الهاتف غير مسجل");
      return;
    }

    if (account.password !== password) {
      setLoading(false);
      setShake(true);
      setErrors({ password: "كلمة المرور غير صحيحة" });
      setTimeout(() => setShake(false), 500);
      toast.error("كلمة المرور غير صحيحة");
      return;
    }

    if (account.role !== role) {
      setLoading(false);
      setShake(true);
      setErrors({ phone: " ", password: "نوع الحساب غير صحيح" });
      setTimeout(() => setShake(false), 500);
      toast.error("نوع الحساب غير صحيح");
      return;
    }

    setAuth({ name: account.name, phone: account.phone, role: account.role });
    toast.success(`تم تسجيل الدخول كـ ${account.name}`);
    navigate({ to: routeForRole(account.role) });
  };

  const isInvalid = !phone || !password;

  return (
    <div
      dir="rtl"
      className="relative min-h-screen w-full overflow-hidden bg-white text-slate-800"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(34,197,94,0.10), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(34,197,94,0.06), transparent 60%)",
        fontFamily: "'Tajawal','Cairo','Noto Sans Arabic',sans-serif",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div
          className={`w-full max-w-[420px] rounded-[20px] border border-slate-100 bg-white p-7 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] transition-transform sm:p-8 ${
            shake ? "animate-[shake_0.45s_ease-in-out]" : ""
          }`}
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                <span className="text-xl font-bold text-white">و</span>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-xl font-bold text-slate-900">وطن جو</span>
                <span className="mt-0.5 text-xs font-medium text-emerald-600" dir="ltr">Watan Go</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-slate-500">منصة التوصيل المحلية الأسرع في مدينتك</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                {PUBLIC_REGISTER_ROLES.map((item) => {
                  const active = role === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setRole(item.value)}
                      disabled={loading}
                      title={item.label}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-base">{item.emoji}</span>
                      <span className={`text-[10px] font-bold ${active ? "text-emerald-700" : "text-slate-600"}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-slate-700">رقم الهاتف</label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition-all ${
                  errors.phone
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
                }`}
              >
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="text-sm font-medium text-slate-400" dir="ltr">+970</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  dir="ltr"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  placeholder="59 123 4567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatPhone(e.target.value));
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  disabled={loading}
                />
              </div>
              {errors.phone && errors.phone.trim() && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">كلمة المرور</label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition-all ${
                  errors.password
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
                }`}
              >
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((state) => !state)}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showPwd ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700">
                نسيت كلمة المرور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isInvalid}
              className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ تسجيل الدخول...</span>
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>بياناتك محمية بتشفير عالي المستوى</span>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-600">
              ليس لديك حساب؟{" "}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
                إنشاء حساب جديد
              </Link>
            </p>
            <p className="mt-3 text-xs text-slate-400">اطلب طعامك أو تسوق من محلاتك المفضلة بسهولة وسرعة</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
