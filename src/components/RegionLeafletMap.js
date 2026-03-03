"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const pinIcon = L.divIcon({
  className: "map-pin",
  html: "<span></span>",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function RegionLeafletMap({ pins }) {
  return (
    <MapContainer
      center={[12, 0]}
      zoom={2}
      minZoom={1.5}
      scrollWheelZoom={false}
      className="leaflet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin, index) => (
        <Marker key={`${pin.country}-${pin.region || "all"}-${index}`} position={[pin.lat, pin.lng]} icon={pinIcon}>
          <Popup>
            <strong>{pin.country}</strong>
            {pin.region ? ` · ${pin.region}` : ""}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
