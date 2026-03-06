import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface InteractiveMapProps {
  onClose: () => void;
  flyTo?: { lat: number; lon: number; name: string };
}

// ── Helper – creates the search result marker ─────────────────────────────
function placeSearchMarker(L: any, map: any, target: { lat: number; lon: number; name: string }) {
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      width:14px;height:14px;
      background:#4ade80;
      border:2px solid #86efac;
      border-radius:50%;
      box-shadow:0 0 8px #4ade80, 0 0 18px #4ade8066;
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -12],
  });

  const shortName = target.name.split(",").slice(0, 2).join(",").trim();

  return L.marker([target.lat, target.lon], { icon })
    .addTo(map)
    .bindPopup(
      `<div style="
        background:#111827;
        color:#4ade80;
        border:1px solid #166534;
        border-radius:8px;
        padding:10px 14px;
        font-family:monospace;
        font-size:12px;
        min-width:180px;
      ">
        <strong style="font-size:14px;color:#86efac;">${shortName}</strong><br/>
        <span style="color:#6b7280;font-size:11px;">
          ${target.lat >= 0 ? target.lat.toFixed(4) + "°N" : Math.abs(target.lat).toFixed(4) + "°S"}
          &nbsp;&middot;&nbsp;
          ${target.lon >= 0 ? target.lon.toFixed(4) + "°E" : Math.abs(target.lon).toFixed(4) + "°W"}
        </span>
      </div>`,
      { className: "geo-popup", maxWidth: 280 }
    )
    .openPopup();
}

export default function InteractiveMap({ onClose, flyTo }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const searchMarkerRef = useRef<any>(null);

  const flyToRef = useRef(flyTo);
  flyToRef.current = flyTo;

  useEffect(() => {
    // Leaflet must run only on client side
    if (typeof window === "undefined") return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // If we have a flyTo target, start centered on it; otherwise world view
      const initFlyTo = flyToRef.current;
      const map = L.map(mapContainerRef.current!, {
        center: initFlyTo ? [initFlyTo.lat, initFlyTo.lon] : [20, 0],
        zoom: initFlyTo ? 13 : 2,
        minZoom: 2,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: true,
      });

      // Dark CartoDB tile layer – matches the atlas theme
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      // ── Notable cities markers ──────────────────────────────────────
      const cities: [number, number, string, string][] = [
        [44.4268, 26.1025, "București", "🇷🇴 România · 44°25'N 26°06'E"],
        [48.8566, 2.3522, "Paris", "🇫🇷 Franța · 48°51'N 02°21'E"],
        [51.5074, -0.1278, "Londra", "🇬🇧 Marea Britanie · 51°30'N 00°07'W"],
        [40.7128, -74.006, "New York", "🇺🇸 SUA · 40°42'N 74°00'W"],
        [35.6762, 139.6503, "Tokyo", "🇯🇵 Japonia · 35°41'N 139°41'E"],
        [-33.8688, 151.2093, "Sydney", "🇦🇺 Australia · 33°51'S 151°12'E"],
        [-23.5505, -46.6333, "São Paulo", "🇧🇷 Brazilia · 23°32'S 46°38'W"],
        [28.6139, 77.209, "New Delhi", "🇮🇳 India · 28°36'N 77°12'E"],
        [55.7558, 37.6173, "Moscova", "🇷🇺 Rusia · 55°45'N 37°37'E"],
        [39.9042, 116.4074, "Beijing", "🇨🇳 China · 39°54'N 116°24'E"],
        [-34.6037, -58.3816, "Buenos Aires", "🇦🇷 Argentina · 34°36'S 58°22'W"],
        [1.3521, 103.8198, "Singapore", "🇸🇬 Singapore · 01°21'N 103°49'E"],
        [30.0444, 31.2357, "Cairo", "🇪🇬 Egipt · 30°02'N 31°14'E"],
        [-1.2921, 36.8219, "Nairobi", "🇰🇪 Kenya · 01°17'S 36°49'E"],
        [19.4326, -99.1332, "Mexico City", "🇲🇽 Mexic · 19°25'N 99°07'W"],
      ];

      const customIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:10px;height:10px;
          background:#4ade80;
          border:2px solid #22c55e;
          border-radius:50%;
          box-shadow:0 0 6px #4ade80, 0 0 12px #4ade8066;
        "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
        popupAnchor: [0, -10],
      });

      cities.forEach(([lat, lng, name, desc]) => {
        L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<div style="
              background:#111827;
              color:#4ade80;
              border:1px solid #166534;
              border-radius:8px;
              padding:10px 14px;
              font-family:monospace;
              font-size:12px;
              min-width:180px;
            ">
              <strong style="font-size:14px;color:#86efac;">${name}</strong><br/>
              <span style="color:#6b7280;font-size:11px;">${desc}</span>
            </div>`,
            {
              className: "geo-popup",
              maxWidth: 250,
            }
          );
      });

      // ── If opened from GeoSearch, place search marker immediately ──
      if (initFlyTo) {
        searchMarkerRef.current = placeSearchMarker(L, map, initFlyTo);
      }

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Fly to search result when flyTo prop changes after mount
  useEffect(() => {
    if (!flyTo || !mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;

      // Remove previous search marker if any
      if (searchMarkerRef.current) {
        searchMarkerRef.current.remove();
        searchMarkerRef.current = null;
      }

      map.flyTo([flyTo.lat, flyTo.lon], 13, { duration: 1.5 });
      // Place marker after fly animation (~1.6s)
      setTimeout(() => {
        if (!mapInstanceRef.current) return;
        searchMarkerRef.current = placeSearchMarker(L, map, flyTo);
      }, 1600);
    });
  }, [flyTo]);

  return (
    <>
      {/* Popup custom style override */}
      <style>{`
        .geo-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .geo-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .geo-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-control-attribution {
          background: rgba(3,7,18,0.8) !important;
          color: #374151 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #4b5563 !important;
        }
        .leaflet-control-zoom a {
          background: #111827 !important;
          color: #4ade80 !important;
          border-color: #166534 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1f2937 !important;
          color: #86efac !important;
        }
      `}</style>

      {/* Modal backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Modal container */}
        <div className="relative w-full max-w-6xl h-[85vh] bg-gray-950 rounded-2xl border border-green-900/50 overflow-hidden shadow-2xl shadow-green-950/50 flex flex-col">

          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-green-900/40 bg-gray-950/90 backdrop-blur z-10 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-lg">🗺️</span>
              <div>
                <h2 className="text-green-300 font-mono font-bold text-sm tracking-widest uppercase">
                  Hartă Interactivă
                </h2>
                <p className="text-green-800 font-mono text-xs">
                  Proiecție Mercator · WGS84 · Leaflet OSM
                </p>
              </div>
            </div>

            {/* Coords display */}
            <div className="hidden md:flex items-center gap-6 font-mono text-xs">
              <span className="text-green-700">
                Click pe marcatori pentru detalii
              </span>
              <span className="text-green-600 border border-green-900/50 rounded px-2 py-1">
                🌍 15 orașe marcate
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-400 transition-colors text-xl leading-none font-mono ml-4"
              title="Închide (Esc)"
            >
              ✕
            </button>
          </div>

          {/* Map area */}
          <div ref={mapContainerRef} className="flex-1 w-full" />

          {/* Footer bar */}
          <div className="shrink-0 px-5 py-2 border-t border-green-900/30 bg-gray-950/80 flex items-center justify-between font-mono text-xs text-green-900">
            <span>© OpenStreetMap contributors · © CARTO</span>
            <span>Apasă ESC sau click în afara hărții pentru a închide</span>
          </div>
        </div>
      </div>
    </>
  );
}



