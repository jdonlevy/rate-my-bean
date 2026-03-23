"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthLogin({ disabled, showGoogle = true }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCredentials(event) {
    event.preventDefault();
    if (disabled) return;
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    router.push(res?.url || "/");
  }

  return (
    <div className="auth-grid">
      {showGoogle ? (
        <div className="card auth-card">
          <h3>Sign in with Google</h3>
          <p className="muted">Use your Google account.</p>
          <button
            className="button"
            type="button"
            onClick={() => !disabled && signIn("google")}
            disabled={disabled}
          >
            Continue with Google
          </button>
        </div>
      ) : null}

      <div className="card auth-card">
        <h3>Sign in with email</h3>
        <p className="muted">Use your Rate My Bean account.</p>
        <form className="form" onSubmit={handleCredentials}>
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
              required
              disabled={disabled}
            />
          </div>
          {error ? <p className="muted">{error}</p> : null}
          <button className="button" type="submit" disabled={disabled || loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="muted">
            Need an account? <a className="link" href="/signup">Create one</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
