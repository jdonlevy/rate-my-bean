"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

const baseIcon = L.divIcon({
  className: "map-pin",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const activeIcon = L.divIcon({
  className: "map-pin map-pin--active",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function BoundsWatcher({ onBounds }) {
  useMapEvents({
    moveend: (event) => {
      const map = event.target;
      const bounds = map.getBounds();
      onBounds(bounds, map.getZoom());
    },
  });
  return null;
}

function MapReady({ onMapReady, onBounds }) {
  const map = useMap();
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    onMapReady?.(map);
    onBounds?.(map.getBounds(), map.getZoom());
  }, [map, onBounds, onMapReady]);
  return null;
}

function hashSeed(value) {
  const str = String(value ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function jitterCoord(lat, lon, seed) {
  const hash = hashSeed(seed);
  const rand1 = Math.sin(hash) * 10000;
  const rand2 = Math.cos(hash) * 10000;
  const offsetLat = ((rand1 % 1) - 0.5) * 0.03;
  const offsetLon = ((rand2 % 1) - 0.5) * 0.03;
  return [lat + offsetLat, lon + offsetLon];
}

export default function BeanFinderMap({
  center,
  onMapReady,
  onBounds,
  roasteries,
  onRoasteryClick,
  hoveredId,
  onRoasteryHover,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <MapContainer
      center={center}
      zoom={2}
      minZoom={2}
      scrollWheelZoom
      className="leaflet-map"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsWatcher onBounds={onBounds} />
      <MapReady onMapReady={onMapReady} onBounds={onBounds} />
      {roasteries.map((roastery) => (
        <Marker
          key={roastery.id}
          position={jitterCoord(
            roastery.latitude,
            roastery.longitude,
            `${roastery.id}:${roastery.address || roastery.name}`
          )}
          icon={roastery.id === hoveredId ? activeIcon : baseIcon}
          eventHandlers={{
            click: () => onRoasteryClick(roastery.id),
            mouseover: () => onRoasteryHover?.(roastery.id),
            mouseout: () => onRoasteryHover?.(null),
          }}
        >
          <Popup>
            <strong>{roastery.name}</strong>
            <br />
            {[roastery.city, roastery.region, roastery.country]
              .filter(Boolean)
              .join(" · ")}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
