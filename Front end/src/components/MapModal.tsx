import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Search, LocateFixed, MapPin, Loader2, AlertCircle, Check } from "lucide-react";

// Leaflet is loaded lazily so it never runs during SSR
import type * as L from "leaflet";

export interface MapSelection {
  lat: number;
  lng: number;
  address: string;
}

interface Props {
  open: boolean;
  initialCoords?: { lat: number; lng: number } | null;
  onConfirm: (selection: MapSelection) => void;
  onClose: () => void;
}

// ── Nominatim helpers ────────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { "Accept-Language": "ar" } },
  );
  if (!res.ok) throw new Error("network");
  const data = await res.json() as { display_name?: string };
  if (!data.display_name) throw new Error("empty");
  return data.display_name.split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 3).join("، ");
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function searchPlaces(query: string): Promise<NominatimResult[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=ar`,
    { headers: { "Accept-Language": "ar" } },
  );
  if (!res.ok) return [];
  return res.json() as Promise<NominatimResult[]>;
}

// ── Default map center (Ramallah, Palestine) ─────────────────────────────────
const DEFAULT_CENTER: [number, number] = [31.9038, 35.2034];
const DEFAULT_ZOOM = 13;

// ── Component ────────────────────────────────────────────────────────────────

export function MapModal({ open, initialCoords, onConfirm, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const markerRef       = useRef<L.Marker | null>(null);
  const leafletRef      = useRef<typeof L | null>(null);

  const [mapReady,    setMapReady]    = useState(false);
  const [mapError,    setMapError]    = useState<string | null>(null);
  const [pinCoords,   setPinCoords]   = useState<{ lat: number; lng: number } | null>(null);
  const [pinAddress,  setPinAddress]  = useState("");
  const [addrLoading, setAddrLoading] = useState(false);
  const [gpsLoading,  setGpsLoading]  = useState(false);
  const [gpsError,    setGpsError]    = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults,   setShowResults]   = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Place / move marker ───────────────────────────────────────────────────

  const placeMarker = useCallback(async (lat: number, lng: number) => {
    const lf = leafletRef.current;
    const map = mapRef.current;
    if (!lf || !map) return;

    setPinCoords({ lat, lng });
    setPinAddress("");
    setAddrLoading(true);

    // Create or move marker
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const icon = lf.divIcon({
        className: "",
        html: `<div style="
          width:32px;height:32px;
          background:oklch(0.78 0.17 60);
          border:3px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 12px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });
      markerRef.current = lf.marker([lat, lng], { icon, draggable: true }).addTo(map);

      markerRef.current.on("dragend", async () => {
        const pos = markerRef.current!.getLatLng();
        await placeMarker(pos.lat, pos.lng);
      });
    }

    map.panTo([lat, lng], { animate: true, duration: 0.5 });

    try {
      const address = await reverseGeocode(lat, lng);
      setPinAddress(address);
    } catch {
      setPinAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setAddrLoading(false);
    }
  }, []);

  // ── Init Leaflet (lazy, runs once when modal opens) ───────────────────────

  useEffect(() => {
    if (!open) return;

    let destroyed = false;

    (async () => {
      try {
        // Dynamic import so Leaflet never touches SSR
        const lf = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        if (destroyed) return;

        leafletRef.current = lf;

        if (!mapContainerRef.current || mapRef.current) return;

        const center: [number, number] = initialCoords
          ? [initialCoords.lat, initialCoords.lng]
          : DEFAULT_CENTER;

        const map = lf.map(mapContainerRef.current, {
          center,
          zoom: DEFAULT_ZOOM,
          zoomControl: false,
          attributionControl: false,
        });

        lf.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        // Custom zoom control (top-left for RTL)
        lf.control.zoom({ position: "topleft" }).addTo(map);

        lf.control.attribution({
          position: "bottomleft",
          prefix: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        map.on("click", (e: L.LeafletMouseEvent) => {
          placeMarker(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current = map;
        setMapReady(true);

        // If we have initial coords, drop a pin immediately
        if (initialCoords) {
          placeMarker(initialCoords.lat, initialCoords.lng);
        }
      } catch {
        if (!destroyed) setMapError("تعذّر تحميل الخريطة. تحقق من اتصالك بالإنترنت.");
      }
    })();

    return () => {
      destroyed = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Destroy map on close ──────────────────────────────────────────────────

  useEffect(() => {
    if (!open) {
      mapRef.current?.remove();
      mapRef.current   = null;
      markerRef.current = null;
      setMapReady(false);
      setMapError(null);
      setPinCoords(null);
      setPinAddress("");
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
      setGpsError(null);
    }
  }, [open]);

  // ── GPS center ────────────────────────────────────────────────────────────

  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS غير مدعوم في هذا المتصفح");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        mapRef.current?.setView([lat, lng], 16, { animate: true });
        placeMarker(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1 ? "تم رفض إذن الموقع" :
          err.code === 2 ? "تعذّر تحديد الموقع" :
          "انتهت مهلة GPS",
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  }, [placeMarker]);

  // ── Search ────────────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(false);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value.trim()) { setSearchResults([]); return; }

    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchPlaces(value);
        setSearchResults(results);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);
  };

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchQuery(result.display_name.split(",")[0].trim());
    setShowResults(false);
    setSearchResults([]);
    mapRef.current?.setView([lat, lng], 16, { animate: true });
    placeMarker(lat, lng);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (!pinCoords || addrLoading) return;
    onConfirm({ lat: pinCoords.lat, lng: pinCoords.lng, address: pinAddress });
  };

  // ── Keyboard close ────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="اختر الوجهة على الخريطة"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal panel */}
      <div className="relative z-10 flex w-full flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:max-w-3xl sm:rounded-3xl"
           style={{ height: "min(90dvh, 680px)" }}>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-base font-bold">اختر الوجهة</p>
              <p className="text-xs text-muted-foreground">انقر على الخريطة أو ابحث عن موقع</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative shrink-0 border-b border-border px-4 py-3">
          <div className="relative flex items-center gap-2">
            {searchLoading
              ? <Loader2 className="pointer-events-none absolute end-3.5 h-4 w-4 animate-spin text-muted-foreground" />
              : <Search className="pointer-events-none absolute end-3.5 h-4 w-4 text-muted-foreground" />}
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
              placeholder="ابحث عن موقع، شارع، مدينة..."
              className="w-full rounded-xl border border-border bg-secondary/40 py-2.5 pe-10 ps-4 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute inset-x-4 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-right text-sm transition-colors hover:bg-secondary/60 border-b border-border/40 last:border-0"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="line-clamp-2 leading-relaxed">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map area */}
        <div className="relative flex-1 overflow-hidden">
          {/* Loading overlay */}
          {!mapReady && !mapError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-surface">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جارٍ تحميل الخريطة...</p>
            </div>
          )}

          {/* Error overlay */}
          {mapError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">تعذّر تحميل الخريطة</p>
                <p className="mt-1 text-sm text-muted-foreground">{mapError}</p>
              </div>
              <button
                type="button"
                onClick={() => { setMapError(null); setMapReady(false); }}
                className="rounded-xl border border-border bg-secondary/50 px-5 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Leaflet container */}
          <div ref={mapContainerRef} className="h-full w-full" />

          {/* GPS button (floating) */}
          {mapReady && (
            <button
              type="button"
              onClick={handleGPS}
              disabled={gpsLoading}
              title="موقعي الحالي"
              className="absolute bottom-4 end-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface shadow-lg transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50"
            >
              {gpsLoading
                ? <Loader2 className="h-4 w-4 animate-spin text-primary" />
                : <LocateFixed className="h-4 w-4 text-primary" />}
            </button>
          )}

          {/* GPS error toast */}
          {gpsError && (
            <div className="absolute bottom-16 end-4 z-10 flex max-w-[220px] items-start gap-2 rounded-xl border border-destructive/30 bg-surface px-3 py-2.5 text-xs text-destructive shadow-lg">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {gpsError}
            </div>
          )}
        </div>

        {/* Footer: selected address + confirm */}
        <div className="shrink-0 border-t border-border bg-surface px-5 py-4">
          {pinCoords ? (
            <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-border bg-secondary/30 px-4 py-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted-foreground">الموقع المحدد</p>
                {addrLoading ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    جارٍ تحديد العنوان...
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm leading-relaxed text-foreground">{pinAddress}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="mb-3 text-center text-sm text-muted-foreground">
              انقر على الخريطة لتحديد الوجهة
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-secondary/50 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!pinCoords || addrLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 py-3 text-sm font-bold text-primary-foreground glow transition-opacity disabled:pointer-events-none disabled:opacity-40"
            >
              <Check className="h-4 w-4" />
              تأكيد الوجهة
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
