"use client";

import { useState } from "react";

export default function AccessForm({ nextPath, hasError }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(hasError);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(false);

    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, next: nextPath }),
    });

    if (res.ok) {
      const data = await res.json();
      window.location.href = data?.redirect || "/";
      return;
    }

    setError(true);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="accessCode">Access code</label>
        <input
          id="accessCode"
          name="accessCode"
          type="password"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
        />
      </div>

      {error ? <p className="muted">Invalid access code.</p> : null}

      <button className="button" type="submit">
        Continue
      </button>
    </form>
  );
}
