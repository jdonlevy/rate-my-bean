"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const BeanFinderMap = dynamic(() => import("./BeanFinderMap"), { ssr: false });

export default function BeanFinder() {
  const router = useRouter();
  const [roasteries, setRoasteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const center = useMemo(() => [20, 0], []);

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
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (!res.ok) return;
      const data = await res.json();
      setResults(data || []);
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

  async function fetchRoasteries(bounds) {
    if (!bounds) return;
    setLoading(true);
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();
    try {
      const res = await fetch(
        `/api/roasteries/search?south=${south}&west=${west}&north=${north}&east=${east}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setRoasteries(data.roasteries || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchSubmit(event) {
    event.preventDefault();
    if (!query || !mapRef) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&limit=5`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return;
    const data = await res.json();
    setResults(data || []);
    if (data?.[0]) {
      mapRef.setView([Number(data[0].lat), Number(data[0].lon)], 12);
      setTimeout(() => fetchRoasteries(mapRef.getBounds()), 600);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation || !mapRef) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.setView([pos.coords.latitude, pos.coords.longitude], 12);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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
                  className="finder-result"
                  onClick={() => {
                    if (!mapRef) return;
                    mapRef.setView([Number(result.lat), Number(result.lon)], 12);
                    setResults([]);
                    setTimeout(() => fetchRoasteries(mapRef.getBounds()), 600);
                  }}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          ) : null}
          {loading ? <p className="muted">Loading roasteries…</p> : null}
          <div className="finder-list">
            <h3>Nearby roasteries</h3>
            {roasteries.length === 0 ? (
              <p className="muted">Move the map to load roasteries.</p>
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
        <BeanFinderMap
          center={center}
          onMapReady={setMapRef}
          onBounds={fetchRoasteries}
          roasteries={roasteries}
          onRoasteryClick={(id) => router.push(`/roasters/${id}`)}
          hoveredId={hoveredId}
          onRoasteryHover={setHoveredId}
        />
      </div>
    </section>
  );
}
