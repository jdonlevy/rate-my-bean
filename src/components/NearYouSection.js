"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "rmb_location";
const DEFAULT_RADIUS_KM = 10;

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)}km away`;
}

export default function NearYouSection() {
  const [state, setState] = useState("idle"); // idle | loading | loaded | empty | denied
  const [beans, setBeans] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { lat, lng } = JSON.parse(saved);
        fetchBeans(lat, lng);
      }
    } catch {}
  }, []);

  async function fetchBeans(lat, lng) {
    setState("loading");
    try {
      const res = await fetch(
        `/api/beans/near?lat=${lat}&lng=${lng}&radius=${DEFAULT_RADIUS_KM}`
      );
      const data = await res.json();
      setBeans(data.beans || []);
      setState(data.beans?.length > 0 ? "loaded" : "empty");
    } catch {
      setState("idle");
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setState("denied");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
        } catch {}
        fetchBeans(coords.lat, coords.lng);
      },
      () => setState("denied"),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function resetLocation() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setState("idle");
    setBeans([]);
  }

  if (state === "denied") return null;

  if (state === "idle") {
    return (
      <section className="hero-card near-you-prompt">
        <div>
          <span className="pill">Personalised</span>
          <h2>Beans near you</h2>
          <p className="muted">
            Find top-rated beans from roasteries in your area.
          </p>
        </div>
        <button className="button" onClick={requestLocation}>
          Find beans near me
        </button>
      </section>
    );
  }

  if (state === "loading") {
    return (
      <section className="hero-card near-you-loading">
        <span className="pill">Near you</span>
        <h2>Finding beans near you…</h2>
        <p className="muted">Looking for roasteries in your area.</p>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section className="hero-card">
        <span className="pill">Near you</span>
        <h2>No beans found nearby</h2>
        <p className="muted">
          No roasteries in your area yet.{" "}
          <a className="link" href="/beans/new">Add one!</a>
        </p>
        <button className="button secondary small" onClick={resetLocation}>
          Search a different area
        </button>
      </section>
    );
  }

  return (
    <section className="hero-card">
      <div className="split-header">
        <div>
          <span className="pill">Near you</span>
          <h2>Beans near you</h2>
          <p className="muted">Top-rated beans from roasteries in your area.</p>
        </div>
        <button className="button secondary small" onClick={resetLocation}>
          Change location
        </button>
      </div>
      <div className="grid">
        {beans.map((bean) => (
          <a className="card" key={bean.id} href={`/beans/${bean.id}`}>
            <div>
              <h3>{bean.name}</h3>
              <p className="muted">{bean.roastery_name || "Roastery"}</p>
              {bean.distance_km != null && (
                <p className="muted distance">{formatDistance(bean.distance_km)}</p>
              )}
            </div>
            <div>
              <p className="rating">
                {Number.isFinite(Number(bean.avg_score))
                  ? Number(bean.avg_score).toFixed(1)
                  : "0.0"}
                ★
              </p>
              <p className="muted">{bean.rating_count} ratings</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
