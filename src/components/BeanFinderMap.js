"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
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

export default function BeanFinderMap({
  center,
  onMapReady,
  onBounds,
  roasteries,
  onRoasteryClick,
  hoveredId,
  onRoasteryHover,
}) {
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
          position={[roastery.latitude, roastery.longitude]}
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
