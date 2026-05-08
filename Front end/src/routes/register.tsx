import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Phone, User, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PUBLIC_REGISTER_ROLES, isPublicRegisterRole, normalizePhone, registerAccount, type PublicRegisterRole } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب — وطن جو | Watan Go" },
      { name: "description", content: "أنشئ حسابك في وطن جو وابدأ بطلب الطعام والتسوق والتنقل في مدينتك." },
      { property: "og:title", content: "إنشاء حساب — وطن جو" },
      { property: "og:description", content: "انضم إلى منصة وطن جو في أقل من دقيقة." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<PublicRegisterRole>("customer");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; password?: string; confirm?: string }>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  const pwdStrength = (() => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) || /[\u0600-\u06FF]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  })();

  const strengthColors = ["bg-slate-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["—", "ضعيفة", "مقبولة", "جيدة", "قوية"];

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = "الاسم قصير جدًا";
    const digits = normalizePhone(phone);
    if (digits.length < 9) nextErrors.phone = "رقم الهاتف غير صحيح";
    if (password.length < 6) nextErrors.password = "يجب أن تكون 6 أحرف على الأقل";
    if (confirm !== password) nextErrors.confirm = "كلمتا المرور غير متطابقتين";
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
      toast.error("نوع الحساب غير متاح من صفحة التسجيل العامة");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const result = registerAccount({ name: name.trim(), phone, password, role });

    if (!result.ok) {
      setLoading(false);
      setShake(true);
      setErrors((prev) => ({ ...prev, phone: result.message }));
      setTimeout(() => setShake(false), 500);
      toast.error(result.message);
      return;
    }

    toast.success("تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن");
    navigate({ to: "/login" });
  };

  const isInvalid = !name || !phone || !password || !confirm;

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
          className={`w-full max-w-[440px] rounded-[20px] border border-slate-100 bg-white p-7 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)] transition-transform sm:p-8 ${
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
            <h1 className="mt-4 text-base font-bold text-slate-800">إنشاء حساب جديد</h1>
            <p className="mt-1 text-sm text-slate-500">انضم خلال أقل من دقيقة وابدأ الطلب فورًا</p>
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
                      className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all ${
                        active
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className={`text-xs font-bold ${active ? "text-emerald-700" : "text-slate-700"}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">{PUBLIC_REGISTER_ROLES.find((item) => item.value === role)?.desc}</p>
            </div>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">الاسم الكامل</label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition-all ${
                  errors.name
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
                }`}
              >
                <User className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  placeholder="مثلاً: أحمد محمد"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  disabled={loading}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
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
              {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
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
                  autoComplete="new-password"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  placeholder="6 أحرف على الأقل"
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
                  aria-label={showPwd ? "إخفاء" : "إظهار"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          index < pwdStrength ? strengthColors[pwdStrength] : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{strengthLabels[pwdStrength]}</span>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-slate-700">تأكيد كلمة المرور</label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-white px-3 transition-all ${
                  errors.confirm
                    ? "border-red-400 ring-2 ring-red-100"
                    : confirm && confirm === password
                      ? "border-emerald-400 ring-2 ring-emerald-100"
                      : "border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
                }`}
              >
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  disabled={loading}
                />
                {confirm && confirm === password ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirm((state) => !state)}
                    className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-700"
                    aria-label={showConfirm ? "إخفاء" : "إظهار"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {errors.confirm && <p className="mt-1.5 text-xs text-red-500">{errors.confirm}</p>}
            </div>

            <p className="text-[11px] leading-relaxed text-slate-500">
              بإنشاء الحساب، أنت توافق على <span className="font-semibold text-emerald-600">شروط الاستخدام</span> و{" "}
              <span className="font-semibold text-emerald-600">سياسة الخصوصية</span>.
            </p>

            <button
              type="submit"
              disabled={loading || isInvalid}
              className="relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جارٍ إنشاء الحساب...</span>
                </>
              ) : (
                "إنشاء الحساب"
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>بياناتك محمية بتشفير عالي المستوى</span>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-600">
              لديك حساب بالفعل؟{" "}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
                تسجيل الدخول
              </Link>
            </p>
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
