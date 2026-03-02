"use client";

import { useState } from "react";

export default function RatingForm({ beanId, canRate, authDisabled = false }) {
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
      const formData = new FormData();
      formData.append("score", form.score);
      formData.append("notes", form.notes);
      formData.append("pricePaid", form.pricePaid);
      const bagImage = event.currentTarget.bagImage.files?.[0];
      const coffeeImage = event.currentTarget.coffeeImage.files?.[0];
      if (bagImage) formData.append("bagImage", bagImage);
      if (coffeeImage) formData.append("coffeeImage", coffeeImage);

      const res = await fetch(`/api/beans/${beanId}/ratings`, {
        method: "POST",
        body: formData,
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
        {authDisabled ? (
          <p className="muted">Login is disabled in preview.</p>
        ) : (
          <a className="button" href="/api/auth/signin">
            Sign in
          </a>
        )}
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
        <label htmlFor="pricePaid">Price paid (GBP)</label>
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

      <div className="form-row">
        <label htmlFor="bagImage">Bag photo (optional)</label>
        <input
          id="bagImage"
          name="bagImage"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          capture="environment"
        />
      </div>

      <div className="form-row">
        <label htmlFor="coffeeImage">Brew photo (optional)</label>
        <input
          id="coffeeImage"
          name="coffeeImage"
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif"
          capture="environment"
        />
      </div>

      {error ? <p className="muted">{error}</p> : null}

      <button className="button" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add Rating"}
      </button>
    </form>
  );
}
