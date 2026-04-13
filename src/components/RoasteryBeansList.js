"use client";

import { useState } from "react";

export default function RoasteryBeansList({ beans, roasteryId, canReport }) {
  const [items, setItems] = useState(beans || []);
  const [savingId, setSavingId] = useState(null);

  async function handleSeen(beanId) {
    if (!roasteryId || savingId || !canReport) return;
    setSavingId(beanId);
    try {
      const res = await fetch("/api/availability/bean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beanId, roasteryId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setItems((prev) =>
        prev.map((bean) =>
          bean.id === beanId ? { ...bean, last_seen: data.lastSeen } : bean
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  if (!items.length) {
    return <p className="muted">No beans yet. Add the first one.</p>;
  }

  return (
    <div className="grid">
      {items.map((bean) => (
        <div className="card" key={bean.id}>
          <div className="split-header">
            <div>
              <h3>{bean.name}</h3>
              <p className="muted">
                {bean.origin_country}
                {bean.origin_region ? ` · ${bean.origin_region}` : ""}
              </p>
            </div>
            <div className="rating">
              {Number.isFinite(Number(bean.avg_score))
                ? Number(bean.avg_score).toFixed(1)
                : "0.0"}
              ★
            </div>
          </div>
          <p className="muted">{bean.rating_count} ratings</p>
          <div className="split-header">
            <p className="muted">
              {bean.last_seen ? `Seen: ${bean.last_seen}` : "Not seen yet"}
            </p>
            <button
              className="button secondary"
              type="button"
              disabled={savingId === bean.id || !canReport}
              onClick={() => handleSeen(bean.id)}
            >
              {!canReport ? "Sign in to report" : savingId === bean.id ? "Saving…" : "Seen today"}
            </button>
          </div>
          <a className="link" href={`/beans/${bean.id}`}>
            View bean →
          </a>
        </div>
      ))}
    </div>
  );
}
