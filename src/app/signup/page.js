import AuthSignup from "@/components/AuthSignup";

export default function SignupPage() {
  const isPreview = process.env.VERCEL_ENV === "preview";

  return (
    <section className="hero-card">
      <h1>Create account</h1>
      <p className="muted">Create a Rate My Bean account.</p>
      {isPreview ? (
        <p className="muted">Sign up is disabled in preview.</p>
      ) : null}
      <AuthSignup disabled={isPreview} />
      <p className="muted">
        Already have an account? <a className="link" href="/login">Sign in</a>.
      </p>
    </section>
  );
}
