"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

const pinIcon = L.divIcon({
  className: "map-pin",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function BoundsWatcher({ onBounds }) {
  useMapEvents({
    moveend: (event) => {
      const map = event.target;
      const bounds = map.getBounds();
      onBounds(bounds);
    },
  });
  return null;
}

export default function BeanFinderMap({ center, onMapReady, onBounds, roasteries, onRoasteryClick }) {
  return (
    <MapContainer
      center={center}
      zoom={2}
      minZoom={2}
      scrollWheelZoom
      className="leaflet-map"
      style={{ height: "100%", width: "100%" }}
      whenCreated={onMapReady}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsWatcher onBounds={onBounds} />
      {roasteries.map((roastery) => (
        <Marker
          key={roastery.id}
          position={[roastery.latitude, roastery.longitude]}
          icon={pinIcon}
          eventHandlers={{
            click: () => onRoasteryClick(roastery.id),
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
