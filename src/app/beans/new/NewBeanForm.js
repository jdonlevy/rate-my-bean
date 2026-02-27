"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const initialState = {
  name: "",
  roaster: "",
  originCountry: "",
  originRegion: "",
  blend: false,
  process: "",
  roastLevel: "",
  priceUsd: "",
  flavorNotes: "",
};

export default function NewBeanForm() {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/beans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to save bean.");
      }

      const data = await res.json();
      router.push(`/beans/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="name">Bean name *</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={updateField}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="roaster">Roaster</label>
        <input
          id="roaster"
          name="roaster"
          value={form.roaster}
          onChange={updateField}
        />
      </div>

      <div className="form-row">
        <label htmlFor="originCountry">Origin country *</label>
        <input
          id="originCountry"
          name="originCountry"
          value={form.originCountry}
          onChange={updateField}
          required
        />
      </div>

      <div className="form-row">
        <label htmlFor="originRegion">Origin region</label>
        <input
          id="originRegion"
          name="originRegion"
          value={form.originRegion}
          onChange={updateField}
        />
      </div>

      <div className="form-row">
        <label htmlFor="blend">Blend?</label>
        <select
          id="blend"
          name="blend"
          value={form.blend ? "true" : "false"}
          onChange={(event) =>
            updateField({
              target: {
                name: "blend",
                value: event.target.value === "true",
                type: "checkbox",
                checked: event.target.value === "true",
              },
            })
          }
        >
          <option value="false">Single origin</option>
          <option value="true">Blend</option>
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="process">Process</label>
        <input
          id="process"
          name="process"
          value={form.process}
          onChange={updateField}
        />
      </div>

      <div className="form-row">
        <label htmlFor="roastLevel">Roast level</label>
        <input
          id="roastLevel"
          name="roastLevel"
          value={form.roastLevel}
          onChange={updateField}
        />
      </div>

      <div className="form-row">
        <label htmlFor="priceUsd">Price (GBP)</label>
        <input
          id="priceUsd"
          name="priceUsd"
          value={form.priceUsd}
          onChange={updateField}
          type="number"
          step="0.01"
          min="0"
        />
      </div>

      <div className="form-row">
        <label htmlFor="flavorNotes">Flavor notes</label>
        <textarea
          id="flavorNotes"
          name="flavorNotes"
          value={form.flavorNotes}
          onChange={updateField}
          rows={4}
        />
      </div>

      {error ? <p className="muted">{error}</p> : null}

      <button className="button" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Bean"}
      </button>
    </form>
  );
}
