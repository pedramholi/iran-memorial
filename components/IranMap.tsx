"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";

// Iran province center coordinates
const PROVINCE_COORDS: Record<string, [number, number]> = {
  "Tehran": [35.6892, 51.3890],
  "Isfahan": [32.6546, 51.6680],
  "Fars": [29.5918, 52.5837],
  "Khuzestan": [31.3203, 48.6693],
  "Kurdistan": [35.3219, 46.9862],
  "Kermanshah": [34.3142, 47.0650],
  "West Azerbaijan": [37.5513, 45.0000],
  "East Azerbaijan": [38.0667, 46.3000],
  "Razavi Khorasan": [36.2972, 59.6057],
  "Mazandaran": [36.5659, 53.0588],
  "Gilan": [37.2682, 49.5891],
  "Alborz": [35.8325, 50.9915],
  "Sistan and Baluchestan": [29.4963, 60.8629],
  "Lorestan": [33.4340, 48.3564],
  "Hormozgan": [27.1865, 56.2808],
  "Markazi": [34.0954, 49.6983],
  "Hamadan": [34.7981, 48.5146],
  "Zanjan": [36.6736, 48.4787],
  "Qom": [34.6416, 50.8746],
  "Semnan": [35.5769, 53.3953],
  "Yazd": [31.8974, 54.3569],
  "Ardabil": [38.2498, 48.2933],
  "Bushehr": [28.9234, 50.8203],
  "Chaharmahal and Bakhtiari": [32.3256, 50.8645],
  "Ilam": [33.6374, 46.4227],
  "Kohgiluyeh and Boyer-Ahmad": [30.6598, 51.6042],
  "North Khorasan": [37.4712, 57.3315],
  "South Khorasan": [32.8505, 59.2164],
  "Qazvin": [36.2688, 50.0041],
  "Golestan": [37.2502, 55.1376],
  "Kerman": [30.2839, 57.0834],
};

type ProvinceData = { province: string; count: number };

export function IranMap({
  data,
  locale,
}: {
  data: ProvinceData[];
  locale: Locale;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[500px] bg-memorial-900/50 rounded-lg border border-memorial-800/60 flex items-center justify-center">
        <p className="text-memorial-500">Loading map...</p>
      </div>
    );
  }

  return <MapInner data={data} locale={locale} />;
}

function MapInner({ data, locale }: { data: ProvinceData[]; locale: Locale }) {
  const [L, setL] = useState<any>(null);
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [CircleMarker, setCircleMarker] = useState<any>(null);
  const [Tooltip, setTooltip] = useState<any>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    Promise.all([
      import("leaflet"),
      import("react-leaflet"),
    ]).then(([leaflet, rl]) => {
      setL(leaflet.default);
      setMapContainer(() => rl.MapContainer);
      setTileLayer(() => rl.TileLayer);
      setCircleMarker(() => rl.CircleMarker);
      setTooltip(() => rl.Tooltip);
    });

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  if (!MapContainer) {
    return (
      <div className="w-full h-[500px] bg-memorial-900/50 rounded-lg border border-memorial-800/60 flex items-center justify-center">
        <p className="text-memorial-500">Loading map...</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getRadius = (count: number) => {
    const ratio = count / maxCount;
    return 8 + ratio * 30;
  };

  const getColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.5) return "#dc2626"; // blood red
    if (ratio > 0.2) return "#ea580c"; // orange-red
    return "#d97706"; // amber
  };

  return (
    <MapContainer
      center={[32.4279, 53.6880] as [number, number]}
      zoom={5}
      style={{ width: "100%", height: "500px" }}
      className="rounded-lg border border-memorial-800/60"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {data.map((item) => {
        const coords = PROVINCE_COORDS[item.province];
        if (!coords) return null;
        return (
          <CircleMarker
            key={item.province}
            center={coords}
            radius={getRadius(item.count)}
            pathOptions={{
              fillColor: getColor(item.count),
              fillOpacity: 0.6,
              color: getColor(item.count),
              weight: 1,
              opacity: 0.8,
            }}
          >
            <Tooltip>
              <strong>{item.province}</strong>
              <br />
              {item.count.toLocaleString(locale === "fa" ? "fa-IR" : locale === "de" ? "de-DE" : "en-US")} victims
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
