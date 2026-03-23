"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AuthSignup({ disabled }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to create account.");
      }
      await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="card auth-card">
      <h3>Create a Rate My Bean account</h3>
      <p className="muted">Use email and password.</p>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="name">Name (optional)</label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
            disabled={disabled}
          />
        </div>
        <div className="form-row">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            required
            disabled={disabled}
          />
        </div>
        {error ? <p className="muted">{error}</p> : null}
        <button className="button" type="submit" disabled={disabled || loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
