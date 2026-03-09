import AuthLogin from "@/components/AuthLogin";

export default function LoginPage() {
  const isPreview = process.env.VERCEL_ENV === "preview";

  return (
    <section className="hero-card">
      <h1>Sign in</h1>
      <p className="muted">
        Use Google or your Rate My Bean account to continue.
      </p>
      <AuthLogin disabled={false} showGoogle={!isPreview} />
      <p className="muted">
        No account yet? <a className="link" href="/signup">Create one</a>.
      </p>
    </section>
  );
}
