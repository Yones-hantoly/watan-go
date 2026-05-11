import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle, Navigation, MapPin, Package, Clock, Ruler } from "lucide-react";
import type * as L from "leaflet";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderKind = "ride" | "food" | "shop";

export interface TrackingOrder {
  id: string;
  kind: OrderKind;
  customerName: string;
  pickup: string;
  pickupCoords: { lat: number; lng: number } | null;
  destination: string;
  destinationCoords: { lat: number; lng: number } | null;
  price: number | null;
}

interface Props {
  order: TrackingOrder;
  onComplete: () => void;
  canComplete?: boolean;
  completeLabel?: string;
  initialDriverCoords?: { lat: number; lng: number } | null;
  onDriverLocationChange?: (coords: { lat: number; lng: number }) => void;
}

// ── Haversine ─────────────────────────────────────────────────────────────────

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
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

function etaMinutes(km: number): number {
  return Math.max(1, Math.round((km / 30) * 60));
}

// ── Marker HTML factories ─────────────────────────────────────────────────────

function driverIconHtml() {
  return `<div style="
    width:36px;height:36px;
    background:oklch(0.82 0.13 200);
    border:3px solid white;
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 14px rgba(0,0,0,0.5);
    font-size:16px;
  ">🚗</div>`;
}

function pinIconHtml(color: string, emoji: string) {
  return `<div style="
    width:32px;height:32px;
    background:${color};
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 4px 12px rgba(0,0,0,0.4);
    display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:13px">${emoji}</span></div>`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LiveTrackingMap({
  order,
  onComplete,
  canComplete = true,
  completeLabel = "إنهاء الطلب",
  initialDriverCoords,
  onDriverLocationChange,
}: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<L.Map | null>(null);
  const leafletRef     = useRef<typeof L | null>(null);
  const driverMarkerRef  = useRef<L.Marker | null>(null);
  const pickupMarkerRef  = useRef<L.Marker | null>(null);
  const destMarkerRef    = useRef<L.Marker | null>(null);
  const routeLineRef     = useRef<L.Polyline | null>(null);
  const watchIdRef       = useRef<number | null>(null);

  const [mapReady,     setMapReady]     = useState(false);
  const [mapError,     setMapError]     = useState<string | null>(null);
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError,     setGpsError]     = useState<string | null>(null);
  const [distRemaining, setDistRemaining] = useState<number | null>(null);

  // Destination coords (may be null for text-only orders)
  const destCoords = order.destinationCoords?.lat && order.destinationCoords?.lng
    ? order.destinationCoords
    : null;

  // ── Init Leaflet ────────────────────────────────────────────────────────────

  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        const lf = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        if (destroyed || !containerRef.current || mapRef.current) return;

        leafletRef.current = lf;

        // Default center: pickup coords, or dest, or Ramallah
        const defaultCenter: [number, number] =
          order.pickupCoords ? [order.pickupCoords.lat, order.pickupCoords.lng] :
          destCoords         ? [destCoords.lat, destCoords.lng] :
          [31.9038, 35.2034];

        const map = lf.map(containerRef.current, {
          center: defaultCenter,
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        lf.control.zoom({ position: "topleft" }).addTo(map);
        lf.control.attribution({ position: "bottomleft", prefix: "© OpenStreetMap" }).addTo(map);

        // Pickup marker
        if (order.pickupCoords) {
          pickupMarkerRef.current = lf.marker(
            [order.pickupCoords.lat, order.pickupCoords.lng],
            { icon: lf.divIcon({ className: "", html: pinIconHtml("oklch(0.82 0.13 200)", "📦"), iconSize: [32, 32], iconAnchor: [16, 32] }) },
          ).addTo(map).bindPopup(`<b>نقطة الاستلام</b><br>${order.pickup}`);
        }

        // Destination marker
        if (destCoords) {
          destMarkerRef.current = lf.marker(
            [destCoords.lat, destCoords.lng],
            { icon: lf.divIcon({ className: "", html: pinIconHtml("oklch(0.78 0.17 60)", "🏁"), iconSize: [32, 32], iconAnchor: [16, 32] }) },
          ).addTo(map).bindPopup(`<b>الوجهة</b><br>${order.destination}`);
        }

        // Fit bounds to show both markers
        const points: [number, number][] = [];
        if (order.pickupCoords) points.push([order.pickupCoords.lat, order.pickupCoords.lng]);
        if (destCoords)         points.push([destCoords.lat, destCoords.lng]);
        if (points.length === 2) map.fitBounds(lf.latLngBounds(points), { padding: [60, 60] });

        mapRef.current = map;
        setMapReady(true);
      } catch {
        if (!destroyed) setMapError("تعذّر تحميل الخريطة. تحقق من اتصالك بالإنترنت.");
      }
    })();

    return () => { destroyed = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GPS watch ───────────────────────────────────────────────────────────────

  const updateDriverPosition = useCallback((lat: number, lng: number) => {
    const lf  = leafletRef.current;
    const map = mapRef.current;
    if (!lf || !map) return;

    const nextCoords = { lat, lng };
    setDriverCoords(nextCoords);
    onDriverLocationChange?.(nextCoords);

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng([lat, lng]);
    } else {
      driverMarkerRef.current = lf.marker(
        [lat, lng],
        { icon: lf.divIcon({ className: "", html: driverIconHtml(), iconSize: [36, 36], iconAnchor: [18, 18] }), zIndexOffset: 1000 },
      ).addTo(map).bindPopup("موقعك الحالي");
    }

    // Update route line: driver → pickup → destination
    const waypoints: [number, number][] = [[lat, lng]];
    if (order.pickupCoords) waypoints.push([order.pickupCoords.lat, order.pickupCoords.lng]);
    if (destCoords)         waypoints.push([destCoords.lat, destCoords.lng]);

    if (routeLineRef.current) {
      routeLineRef.current.setLatLngs(waypoints);
    } else if (waypoints.length > 1) {
      routeLineRef.current = lf.polyline(waypoints, {
        color: "oklch(0.82 0.13 200)",
        weight: 5,
        opacity: 0.85,
        dashArray: "12 8",
      }).addTo(map);
    }

    // Distance remaining to destination
    const target = destCoords ?? (order.pickupCoords ?? null);
    if (target) {
      setDistRemaining(haversineKm({ lat, lng }, target));
    }
  }, [order.pickupCoords, destCoords, onDriverLocationChange]);

  useEffect(() => {
    if (!mapReady || !initialDriverCoords || driverCoords) return;
    updateDriverPosition(initialDriverCoords.lat, initialDriverCoords.lng);
  }, [driverCoords, initialDriverCoords, mapReady, updateDriverPosition]);

  useEffect(() => {
    if (!mapReady) return;

    if (!navigator.geolocation) {
      setGpsError("GPS غير مدعوم في هذا المتصفح");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsError(null);
        updateDriverPosition(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        const msg =
          err.code === 1 ? "تم رفض إذن الموقع — لن يتم تتبع موقعك" :
          err.code === 2 ? "تعذّر تحديد الموقع" :
          "انتهت مهلة GPS";
        setGpsError(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
    );

    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [mapReady, updateDriverPosition]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
      driverMarkerRef.current = null;
      pickupMarkerRef.current = null;
      destMarkerRef.current   = null;
      routeLineRef.current    = null;
    };
  }, []);

  const kindLabel = order.kind === "ride" ? "رحلة" : order.kind === "food" ? "توصيل طعام" : "توصيل تسوق";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-surface/90 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{kindLabel} · {order.id}</p>
            <p className="font-display text-sm font-bold">{order.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-500">تتبع مباشر</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border/40 border-b border-border/60 bg-secondary/20">
        <StatCell icon={<Ruler className="h-3.5 w-3.5" />} label="المسافة المتبقية"
          value={distRemaining != null ? `${distRemaining.toFixed(1)} كم` : "—"} />
        <StatCell icon={<Clock className="h-3.5 w-3.5" />} label="الوصول المتوقع"
          value={distRemaining != null ? `${etaMinutes(distRemaining)} د` : "—"} />
        <StatCell icon={<Package className="h-3.5 w-3.5" />} label="السعر"
          value={order.price != null ? `${order.price} ₪` : "—"} />
      </div>

      {/* Route summary */}
      <div className="grid grid-cols-2 gap-px border-b border-border/60 bg-border/40">
        <div className="bg-surface px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan">الاستلام</p>
          <p className="mt-0.5 text-xs font-semibold leading-snug">{order.pickup}</p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">التسليم</p>
          <p className="mt-0.5 text-xs font-semibold leading-snug">{order.destination}</p>
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: 340 }}>
        {/* Loading overlay */}
        {!mapReady && !mapError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface">
            <Loader2 className="h-7 w-7 animate-spin text-cyan" />
            <p className="text-sm text-muted-foreground">جارٍ تحميل الخريطة...</p>
          </div>
        )}
        {/* Error overlay */}
        {mapError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{mapError}</p>
          </div>
        )}
        {/* GPS error toast */}
        {gpsError && mapReady && (
          <div className="absolute bottom-3 end-3 z-10 flex max-w-[220px] items-start gap-2 rounded-xl border border-destructive/30 bg-surface px-3 py-2 text-xs text-destructive shadow-lg">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {gpsError}
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {/* Driver location indicator */}
      {driverCoords && (
        <div className="flex items-center gap-2 border-t border-border/60 bg-secondary/20 px-4 py-2.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-cyan" />
          <span>موقعك: {driverCoords.lat.toFixed(4)}, {driverCoords.lng.toFixed(4)}</span>
        </div>
      )}

      {/* Complete button */}
      <div className="border-t border-border/60 p-4">
        <button
          type="button"
          onClick={onComplete}
          disabled={!canComplete}
          className="w-full rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:opacity-90 disabled:cursor-not-allowed disabled:from-secondary disabled:to-secondary disabled:text-muted-foreground disabled:shadow-none"
        >
          {canComplete ? completeLabel : "أكمل مراحل التوصيل أولاً"}
        </button>
      </div>
    </div>
  );
}

function StatCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3 py-3 text-center">
      <div className="flex items-center gap-1 text-muted-foreground">{icon}</div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-display text-sm font-bold text-primary">{value}</p>
    </div>
  );
}
