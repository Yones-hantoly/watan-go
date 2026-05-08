import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useReducer, useRef, useState } from "react";
import {
  Car, MapPin, Navigation, Tag,
  Loader2, AlertCircle, LocateFixed, X, Map, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHero, SectionHeading } from "@/components/ui-bits";
import { MapModal, type MapSelection } from "@/components/MapModal";
import { requireAuthForProtectedRoute } from "@/lib/route-guards";
import { getAuth } from "@/lib/auth";
import { createRideOrder } from "@/lib/ride-orders";

export const Route = createFileRoute("/ride-request")({
  beforeLoad: requireAuthForProtectedRoute,
  head: () => ({
    meta: [
      { title: "طلب رحلة — وطن جو" },
      { name: "description", content: "احجز رحلتك بسهولة مع تحديد موقعك تلقائياً عبر GPS." },
    ],
  }),
  component: RideRequestPage,
});

// ── Types ────────────────────────────────────────────────────────────────────

interface Coords { lat: number; lng: number }

interface LocationField {
  address: string;
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

interface RideState {
  pickup: LocationField;
  destination: LocationField;
  destInput: string;
}

type RideAction =
  | { type: "PICKUP_LOADING" }
  | { type: "PICKUP_SUCCESS"; address: string; coords: Coords }
  | { type: "PICKUP_ERROR"; error: string }
  | { type: "DEST_INPUT"; value: string }
  | { type: "DEST_LOADING" }
  | { type: "DEST_SUCCESS"; address: string; coords: Coords }
  | { type: "DEST_ERROR"; error: string }
  | { type: "DEST_CLEAR" };

const emptyField = (): LocationField => ({ address: "", coords: null, loading: false, error: null });

function reducer(state: RideState, action: RideAction): RideState {
  switch (action.type) {
    case "PICKUP_LOADING":
      return { ...state, pickup: { ...emptyField(), loading: true } };
    case "PICKUP_SUCCESS":
      return { ...state, pickup: { address: action.address, coords: action.coords, loading: false, error: null } };
    case "PICKUP_ERROR":
      return { ...state, pickup: { ...emptyField(), error: action.error } };
    case "DEST_INPUT":
      return { ...state, destInput: action.value, destination: emptyField() };
    case "DEST_LOADING":
      return { ...state, destination: { ...emptyField(), loading: true } };
    case "DEST_SUCCESS":
      return { ...state, destination: { address: action.address, coords: action.coords, loading: false, error: null }, destInput: action.address };
    case "DEST_ERROR":
      return { ...state, destination: { ...emptyField(), error: action.error } };
    case "DEST_CLEAR":
      return { ...state, destination: emptyField(), destInput: "" };
    default:
      return state;
  }
}

const initialState: RideState = {
  pickup: emptyField(),
  destination: emptyField(),
  destInput: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Reverse-geocode via Nominatim (OSM) — no API key required */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`;
  const res = await fetch(url, { headers: { "Accept-Language": "ar" } });
  if (!res.ok) throw new Error("فشل تحويل الإحداثيات إلى عنوان");
  const data = await res.json() as { display_name?: string; error?: string };
  if (data.error || !data.display_name) throw new Error("تعذّر الحصول على العنوان");
  // Trim to a readable short form: first 2 comma-separated parts
  const parts = data.display_name.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.slice(0, 3).join("، ");
}

/** Haversine distance in km */
function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

function estimateDuration(km: number): string {
  const minutes = Math.round((km / 30) * 60); // assume avg 30 km/h in city
  if (minutes < 1) return "أقل من دقيقة";
  return `${minutes} دقيقة`;
}

const PRICE_PER_KM = 3; // شيكل per km — swap for API value when backend is ready

const recentPlaces = ["الجامعة", "وسط البلد", "المستشفى", "المنزل"];

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldStatus({ loading, error }: { loading: boolean; error: string | null }) {
  if (loading) return (
    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      جارٍ تحديد الموقع...
    </div>
  );
  if (error) return (
    <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {error}
    </div>
  );
  return null;
}

// ── Main page ─────────────────────────────────────────────────────────────────

function RideRequestPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [mapOpen, setMapOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const destInputRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);

  const handleMapConfirm = useCallback((sel: MapSelection) => {
    dispatch({ type: "DEST_SUCCESS", address: sel.address, coords: { lat: sel.lat, lng: sel.lng } });
    setConfirmed(false);
    setMapOpen(false);
  }, []);

  /** Request GPS and dispatch result to either pickup or destination */
  const requestGPS = useCallback(async (target: "pickup" | "dest") => {
    if (!navigator.geolocation) {
      const msg = "GPS غير مدعوم في هذا المتصفح";
      dispatch(target === "pickup" ? { type: "PICKUP_ERROR", error: msg } : { type: "DEST_ERROR", error: msg });
      return;
    }

    dispatch(target === "pickup" ? { type: "PICKUP_LOADING" } : { type: "DEST_LOADING" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        try {
          const address = await reverseGeocode(coords.lat, coords.lng);
          dispatch(
            target === "pickup"
              ? { type: "PICKUP_SUCCESS", address, coords }
              : { type: "DEST_SUCCESS", address, coords },
          );
        } catch {
          dispatch(
            target === "pickup"
              ? { type: "PICKUP_SUCCESS", address: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`, coords }
              : { type: "DEST_SUCCESS", address: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`, coords },
          );
        }
      },
      (err) => {
        const msg =
          err.code === 1 ? "تم رفض إذن الوصول إلى الموقع" :
          err.code === 2 ? "تعذّر تحديد الموقع — تحقق من إعدادات GPS" :
          "انتهت مهلة تحديد الموقع، حاول مجدداً";
        dispatch(target === "pickup" ? { type: "PICKUP_ERROR", error: msg } : { type: "DEST_ERROR", error: msg });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }, []);

  const handleDestInputChange = (value: string) => {
    dispatch({ type: "DEST_INPUT", value });
  };

  const handleDestInputCommit = () => {
    const v = state.destInput.trim();
    if (!v) return;
    dispatch({ type: "DEST_SUCCESS", address: v, coords: { lat: 0, lng: 0 } });
  };

  const setRecentPlace = (place: string) => {
    dispatch({ type: "DEST_SUCCESS", address: place, coords: { lat: 0, lng: 0 } });
  };

  // Derived trip estimates
  const bothCoords =
    state.pickup.coords &&
    state.destination.coords &&
    (state.destination.coords.lat !== 0 || state.destination.coords.lng !== 0) &&
    (state.pickup.coords.lat !== 0 || state.pickup.coords.lng !== 0);

  const distanceKm = bothCoords
    ? haversineKm(state.pickup.coords!, state.destination.coords!)
    : null;

  const canConfirm = !!state.pickup.address && !!state.destination.address &&
    !state.pickup.loading && !state.destination.loading;

  const handleConfirmRide = useCallback(() => {
    if (submitLockRef.current || !canConfirm) return;
    submitLockRef.current = true;
    setSubmitting(true);

    const user = getAuth();
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      setSubmitting(false);
      submitLockRef.current = false;
      return;
    }

    createRideOrder(user, {
      pickup:             state.pickup.address,
      pickupCoords:       state.pickup.coords,
      destination:        state.destination.address,
      destinationCoords:  state.destination.coords,
      distanceKm,
      durationLabel:      distanceKm != null ? estimateDuration(distanceKm) : null,
      price:              distanceKm != null ? parseFloat((distanceKm * PRICE_PER_KM).toFixed(1)) : null,
    });

    toast.success("تم تأكيد طلب الرحلة بنجاح!", {
      description: "سيتم تعيين سائق لك قريباً.",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    });

    setConfirmed(true);
    setSubmitting(false);
    // Reset form after short delay so user sees the success state
    setTimeout(() => {
      dispatch({ type: "DEST_CLEAR" });
      dispatch({ type: "PICKUP_ERROR", error: "" }); // clears pickup address
      setConfirmed(false);
      submitLockRef.current = false;
    }, 2500);
  }, [canConfirm, state.pickup, state.destination, distanceKm]);

  return (
    <>
      <PageHero
        eyebrow="طلب رحلة"
        icon={<Car className="h-5 w-5" />}
        title={<>احجز رحلتك <span className="text-gradient">بخطوات واضحة.</span></>}
        description="حدّد موقعك تلقائياً عبر GPS أو أدخل وجهتك يدوياً، وتابع تفاصيل رحلتك قبل التأكيد."
      />

      <MapModal
        open={mapOpen}
        initialCoords={state.pickup.coords}
        onConfirm={handleMapConfirm}
        onClose={() => setMapOpen(false)}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── Left column: form ── */}
          <div className="card-elevated p-6">
            <SectionHeading eyebrow="الطلب" title="إلى أين تريد الذهاب؟" />

            <div className="mt-6 space-y-4">

              {/* Pickup field */}
              <div
                className={`rounded-2xl border bg-secondary/30 p-4 transition-colors ${
                  state.pickup.error ? "border-destructive/50" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan">
                    <Navigation className="h-4 w-4 shrink-0" />
                    نقطة الانطلاق
                  </div>
                  <button
                    type="button"
                    onClick={() => requestGPS("pickup")}
                    disabled={state.pickup.loading}
                    title="تحديد موقعي الحالي"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs font-semibold text-cyan transition-colors hover:bg-cyan/20 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {state.pickup.loading
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <LocateFixed className="h-3.5 w-3.5" />}
                    موقعي الحالي
                  </button>
                </div>

                {state.pickup.address ? (
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed text-foreground">{state.pickup.address}</p>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "PICKUP_ERROR", error: "" })}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="مسح نقطة الانطلاق"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    اضغط «موقعي الحالي» لتحديد نقطة الانطلاق تلقائياً
                  </p>
                )}

                <FieldStatus loading={state.pickup.loading} error={state.pickup.error} />
              </div>

              {/* Destination field */}
              <div
                className={`rounded-2xl border bg-secondary/30 p-4 transition-colors ${
                  state.destination.error ? "border-destructive/50" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <MapPin className="h-4 w-4 shrink-0" />
                    الوجهة
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Open map modal */}
                    <button
                      type="button"
                      onClick={() => setMapOpen(true)}
                      title="اختر على الخريطة"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      <Map className="h-3.5 w-3.5" />
                      الخريطة
                    </button>
                    {/* GPS shortcut */}
                    <button
                      type="button"
                      onClick={() => requestGPS("dest")}
                      disabled={state.destination.loading}
                      title="استخدام موقعي الحالي كوجهة"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
                    >
                      {state.destination.loading
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <LocateFixed className="h-3.5 w-3.5" />}
                      GPS
                    </button>
                  </div>
                </div>

                {/* Text input row */}
                <div
                  className="mt-3 flex cursor-text items-center gap-2"
                  onClick={() => setMapOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setMapOpen(true)}
                  aria-label="افتح الخريطة لاختيار الوجهة"
                >
                  <input
                    ref={destInputRef}
                    type="text"
                    value={state.destInput}
                    onChange={(e) => { e.stopPropagation(); handleDestInputChange(e.target.value); }}
                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") handleDestInputCommit(); }}
                    onBlur={handleDestInputCommit}
                    onClick={(e) => { e.stopPropagation(); setMapOpen(true); }}
                    placeholder="انقر لاختيار الوجهة على الخريطة..."
                    readOnly
                    className="flex-1 cursor-pointer bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  {state.destInput && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: "DEST_CLEAR" }); }}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="مسح الوجهة"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {state.destination.address && !state.destination.loading && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    ✓ {state.destination.address}
                  </p>
                )}

                <FieldStatus loading={state.destination.loading} error={state.destination.error} />
              </div>
            </div>

            {/* Trip estimates */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-xs text-muted-foreground">المسافة التقديرية</div>
                <div className="mt-1 font-display text-xl font-bold">
                  {distanceKm != null ? `${distanceKm.toFixed(1)} كم` : "—"}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-xs text-muted-foreground">المدة المتوقعة</div>
                <div className="mt-1 font-display text-xl font-bold">
                  {distanceKm != null ? estimateDuration(distanceKm) : "—"}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  السعر التقديري
                </div>
                {distanceKm != null ? (
                  <div className="mt-1 font-display text-xl font-bold text-primary">
                    {(distanceKm * PRICE_PER_KM).toFixed(1)} شيكل
                  </div>
                ) : (
                  <div className="mt-1 font-display text-xl font-bold text-muted-foreground">—</div>
                )}
                <div className="mt-1.5 text-[11px] text-muted-foreground">
                  {PRICE_PER_KM} شيكل / كم
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column: quick places + confirm ── */}
          <div className="space-y-6">
            <div className="card-elevated p-6">
              <SectionHeading eyebrow="أماكن سريعة" title="وجهات متكررة" />
              <div className="mt-5 flex flex-wrap gap-2">
                {recentPlaces.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => setRecentPlace(place)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                      state.destination.address === place
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 hover:bg-secondary"
                    }`}
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <button
              type="button"
              onClick={handleConfirmRide}
              disabled={!canConfirm || submitting || confirmed}
              className={`w-full rounded-2xl px-6 py-4 text-sm font-bold text-primary-foreground glow transition-all disabled:pointer-events-none disabled:opacity-40 ${
                confirmed
                  ? "bg-emerald-500"
                  : "bg-gradient-to-br from-primary to-primary/80"
              }`}
            >
              {confirmed ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> تم تأكيد الطلب
                </span>
              ) : submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الإرسال...
                </span>
              ) : !state.pickup.address ? (
                "حدّد نقطة الانطلاق أولاً"
              ) : !state.destination.address ? (
                "حدّد الوجهة أولاً"
              ) : (
                "تأكيد طلب الرحلة"
              )}
            </button>

            {/* GPS permission hint */}
            {(state.pickup.error || state.destination.error) && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-semibold">تعذّر الوصول إلى الموقع</p>
                    <p className="mt-1 text-xs opacity-80">
                      تأكد من منح إذن الموقع في إعدادات المتصفح، أو أدخل العنوان يدوياً في حقل الوجهة.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/dashboard/customer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            العودة إلى لوحة المستخدم
          </Link>
          <Link to="/restaurants" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            طلب طعام
          </Link>
          <Link to="/shops" className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-6 py-3.5 text-sm font-semibold">
            التسوق
          </Link>
        </div>
      </section>
    </>
  );
}
