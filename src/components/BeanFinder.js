"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BeanFinderMap = dynamic(() => import("./BeanFinderMap"), { ssr: false });

export default function BeanFinder() {
  const router = useRouter();
  const [roasteries, setRoasteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeResultId, setActiveResultId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    website: "",
    address: "",
    city: "",
    region: "",
    country: "",
    latitude: "",
    longitude: "",
  });
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [mapRef, setMapRef] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [status, setStatus] = useState("Zoom in to search London roasteries.");
  const [mapBounds, setMapBounds] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const inFlight = useRef(false);
  const lastBoundsKey = useRef("");
  const lastBoundsAt = useRef(0);
  const debounceTimer = useRef(null);
  const suppressBoundsUntil = useRef(0);

  const center = useMemo(() => [51.5074, -0.1278], []);

  const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const boundsFromRadius = (lat, lon, radiusMeters) => {
    const latDelta = radiusMeters / 111000;
    const lonDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));
    return {
      south: lat - latDelta,
      north: lat + latDelta,
      west: lon - lonDelta,
      east: lon + lonDelta,
    };
  };

  useEffect(() => {
    if (!mapRef) return;
    mapRef.invalidateSize();
    const handleResize = () => mapRef.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mapRef]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
        query
      )}&limit=5`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) return;
      const data = await res.json();
      setResults(data || []);
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  function boundsKey(bounds) {
    const south = bounds.getSouth().toFixed(3);
    const west = bounds.getWest().toFixed(3);
    const north = bounds.getNorth().toFixed(3);
    const east = bounds.getEast().toFixed(3);
    return `${south},${west},${north},${east}`;
  }

  const fetchRoasteries = useCallback(async (bounds, zoomLevel) => {
    if (zoomLevel != null && zoomLevel < 9) {
      setRoasteries([]);
      setStatus("Zoom in to search London roasteries.");
      return;
    }
    if (!bounds) return;
    const key = boundsKey(bounds);
    const now = Date.now();
    if (key === lastBoundsKey.current && now - lastBoundsAt.current < 30000) {
      return;
    }
    if (inFlight.current) return;
    setLoading(true);
    setStatus("Loading roasteries…");
    inFlight.current = true;
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();
    try {
      const res = await fetch(
        `/api/roasteries/search?south=${south}&west=${west}&north=${north}&east=${east}&city=London&country=United%20Kingdom&debug=1`
      );
      if (!res.ok) {
        setStatus("Could not load roasteries.");
        return;
      }
      const data = await res.json();
      const next = data.roasteries || [];
      setRoasteries(next);
      if (!next.length) {
        setStatus("No seeded London roasteries found in this area.");
      }
    } finally {
      lastBoundsKey.current = key;
      lastBoundsAt.current = Date.now();
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  const fetchRoasteriesByCenter = useCallback(async (lat, lon) => {
    if (inFlight.current) return;
    suppressBoundsUntil.current = Date.now() + 2000;
    setLoading(true);
    setStatus("Loading London roasteries…");
    inFlight.current = true;
    try {
      const res = await fetch(
        `/api/roasteries/search?lat=${lat}&lon=${lon}&radius=20000&city=London&country=United%20Kingdom&debug=1`
      );
      if (!res.ok) {
        setStatus("Could not load roasteries.");
        return;
      }
      const data = await res.json();
      const next = data.roasteries || [];
      setRoasteries(next);
      if (!next.length) {
        setStatus("No seeded London roasteries found in this area.");
      }
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  async function handleSearchSubmit(event) {
    event.preventDefault();
    if (!query || !mapRef) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
      query
    )}&limit=5`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return;
    const data = await res.json();
    setResults(data || []);
    setActiveResultId(null);
    setSelectedLocation(null);
    if (data?.[0]) {
      const first = data[0];
      const lat = Number(first.lat);
      const lon = Number(first.lon);
      const bbox = first.boundingbox?.map(Number);
      if (bbox?.length === 4) {
        const south = bbox[0];
        const north = bbox[1];
        const west = bbox[2];
        const east = bbox[3];
        mapRef.fitBounds(
          [
            [south, west],
            [north, east],
          ],
          { padding: [40, 40] }
        );
        fetchRoasteriesByCenter(lat, lon);
      } else {
        mapRef.flyTo([lat, lon], 12, { duration: 0.6 });
        setTimeout(() => fetchRoasteriesByCenter(lat, lon), 650);
      }
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation || !mapRef) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        mapRef.setView([lat, lon], 12);
        fetchRoasteriesByCenter(lat, lon);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function applySelectedLocation(result) {
    if (!result) return;
    const lat = Number(result.lat);
    const lon = Number(result.lon);
    const address = result.address || {};
    setSelectedLocation(result);
    setAddForm((prev) => ({
      ...prev,
      address:
        address.road && address.house_number
          ? `${address.road} ${address.house_number}`.trim()
          : address.road || prev.address || "",
      city: address.city || address.town || address.village || prev.city || "",
      region: address.state || address.county || prev.region || "",
      country: address.country || prev.country || "",
      latitude: Number.isFinite(lat) ? String(lat) : prev.latitude,
      longitude: Number.isFinite(lon) ? String(lon) : prev.longitude,
    }));
  }

  async function handleAddRoastery(event) {
    event.preventDefault();
    setAddError("");
    setAddSuccess("");
    const payload = {
      name: addForm.name.trim(),
      website: addForm.website.trim(),
      address: addForm.address.trim(),
      city: addForm.city.trim(),
      region: addForm.region.trim(),
      country: addForm.country.trim(),
      latitude: Number(addForm.latitude),
      longitude: Number(addForm.longitude),
    };
    if (!payload.name || !Number.isFinite(payload.latitude) || !Number.isFinite(payload.longitude)) {
      setAddError("Name, latitude, and longitude are required.");
      return;
    }
    const res = await fetch("/api/roasteries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setAddError("Could not add roastery.");
      return;
    }
    const data = await res.json();
    if (data?.roastery) {
      setRoasteries((prev) => {
        const exists = prev.some((item) => item.id === data.roastery.id);
        return exists ? prev : [data.roastery, ...prev];
      });
      setAddSuccess("Roastery added.");
      setShowAddForm(false);
      setAddForm({
        name: "",
        website: "",
        address: "",
        city: "",
        region: "",
        country: "",
        latitude: "",
        longitude: "",
      });
    }
  }

  const handleBounds = useCallback((bounds, zoomLevel) => {
    if (!bounds) return;
    setMapBounds(bounds);
    setMapZoom(zoomLevel ?? null);
    if (zoomLevel != null && zoomLevel < 9) {
      setStatus("Zoom in to search London roasteries.");
    } else if (zoomLevel != null) {
      setStatus("Ready to search London roasteries.");
    }
  }, []);

  return (
    <section className="finder-hero">
      <div className="finder-overlay">
        <div className="finder-card">
          <span className="pill">Bean Finder</span>
          <h1>Find local coffee roasteries near you.</h1>
          <p>
            Search by city or area to discover roasteries selling fresh beans.
          </p>
          <form className="finder-search" onSubmit={handleSearchSubmit}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a location"
            />
            <button className="button" type="submit">Search</button>
            <button className="button secondary" type="button" onClick={handleUseLocation}>
              Use my location
            </button>
          </form>
          {results.length > 0 ? (
            <div className="finder-results">
              {results.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onMouseEnter={() => setActiveResultId(result.place_id)}
                  onMouseLeave={() => setActiveResultId(null)}
                  className={
                    activeResultId === result.place_id
                      ? "finder-result active"
                      : "finder-result"
                  }
                  onClick={() => {
                    if (!mapRef) return;
                    const lat = Number(result.lat);
                    const lon = Number(result.lon);
                    const bbox = result.boundingbox?.map(Number);
                    if (bbox?.length === 4) {
                      const south = bbox[0];
                      const north = bbox[1];
                      const west = bbox[2];
                      const east = bbox[3];
                      mapRef.fitBounds(
                        [
                          [south, west],
                          [north, east],
                        ],
                        { padding: [40, 40] }
                      );
                    } else {
                      mapRef.flyTo([lat, lon], 12, { duration: 0.6 });
                    }
                    applySelectedLocation(result);
                    setResults([]);
                    setTimeout(() => fetchRoasteriesByCenter(lat, lon), 650);
                  }}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          ) : null}
          <div className="finder-add">
            <div className="split-header">
              <h3>Missing a roastery?</h3>
              <button
                className="button secondary"
                type="button"
                onClick={() => setShowAddForm((prev) => !prev)}
              >
                {showAddForm ? "Hide form" : "Add roastery"}
              </button>
            </div>
            {showAddForm ? (
              <form className="finder-add-form" onSubmit={handleAddRoastery}>
                {addError ? <p className="error">{addError}</p> : null}
                {addSuccess ? <p className="success">{addSuccess}</p> : null}
                {selectedLocation ? (
                  <p className="muted">
                    Using location: {selectedLocation.display_name}
                  </p>
                ) : null}
                <div className="grid">
                  <input
                    value={addForm.name}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="Roastery name"
                  />
                  <input
                    value={addForm.website}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, website: event.target.value }))
                    }
                    placeholder="Website (optional)"
                  />
                  <input
                    value={addForm.address}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                    placeholder="Street address (optional)"
                  />
                  <input
                    value={addForm.city}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, city: event.target.value }))
                    }
                    placeholder="City"
                  />
                  <input
                    value={addForm.region}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, region: event.target.value }))
                    }
                    placeholder="Region / State"
                  />
                  <input
                    value={addForm.country}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, country: event.target.value }))
                    }
                    placeholder="Country"
                  />
                  <input
                    value={addForm.latitude}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, latitude: event.target.value }))
                    }
                    placeholder="Latitude"
                  />
                  <input
                    value={addForm.longitude}
                    onChange={(event) =>
                      setAddForm((prev) => ({ ...prev, longitude: event.target.value }))
                    }
                    placeholder="Longitude"
                  />
                </div>
                <div className="actions">
                  <button className="button" type="submit">
                    Save roastery
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => applySelectedLocation(selectedLocation)}
                    disabled={!selectedLocation}
                  >
                    Use selected location
                  </button>
                </div>
              </form>
            ) : null}
          </div>
          {loading ? <p className="muted">Loading roasteries…</p> : null}
          <div className="finder-list">
            <h3>Nearby roasteries</h3>
            {roasteries.length === 0 ? (
              <p className="muted">{status}</p>
            ) : (
              <ul>
                {roasteries.slice(0, 8).map((roastery) => (
                  <li key={roastery.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/roasters/${roastery.id}`)}
                      onMouseEnter={() => setHoveredId(roastery.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <span>{roastery.name}</span>
                      <span className="muted">
                        {[roastery.city, roastery.region]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <div className="finder-map">
        <div className="map-shell">
          <div className="map-header">
            <div>
              <span className="pill">Explore</span>
              <h2>Global Roastery Map</h2>
              <p className="muted">Zoom in, then search the map area for roasteries.</p>
            </div>
            <button
              className="button secondary"
              type="button"
              disabled={!mapBounds || mapZoom == null || mapZoom < 9 || loading}
              onClick={() => {
                if (!mapBounds || mapZoom == null || mapZoom < 9) {
                  setStatus("Zoom in to search this area.");
                  return;
                }
                fetchRoasteries(mapBounds, mapZoom);
              }}
            >
              {mapZoom != null && mapZoom < 9 ? "Zoom in to search" : "Search area"}
            </button>
          </div>
          <div className="map-frame">
            <BeanFinderMap
              center={center}
              onMapReady={setMapRef}
              onBounds={handleBounds}
              roasteries={roasteries}
              onRoasteryClick={(id) => router.push(`/roasters/${id}`)}
              hoveredId={hoveredId}
              onRoasteryHover={setHoveredId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
