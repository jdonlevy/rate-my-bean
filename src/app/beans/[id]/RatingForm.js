"use client";

import { useState } from "react";

export default function RatingForm({ beanId, canRate }) {
  const [form, setForm] = useState({
    score: "5",
    notes: "",
    pricePaid: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/beans/${beanId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to add rating.");
      }

      setForm({ score: "5", notes: "", pricePaid: "" });
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!canRate) {
    return (
      <div className="card">
        <p className="muted">Sign in to add a rating.</p>
        <a className="button" href="/api/auth/signin">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="score">Score (1-5)</label>
        <select id="score" name="score" value={form.score} onChange={updateField}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="pricePaid">Price paid (USD)</label>
        <input
          id="pricePaid"
          name="pricePaid"
          value={form.pricePaid}
          onChange={updateField}
          type="number"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="notes">Tasting notes</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={form.notes}
          onChange={updateField}
          required
        />
      </div>

      {error ? <p className="muted">{error}</p> : null}

      <button className="button" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add Rating"}
      </button>
    </form>
  );
}
