import AuthSignup from "@/components/AuthSignup";

export default function SignupPage() {
  return (
    <section className="hero-card">
      <h1>Create account</h1>
      <p className="muted">Create a Rate My Bean account.</p>
      <AuthSignup disabled={false} />
      <p className="muted">
        Already have an account? <a className="link" href="/login">Sign in</a>.
      </p>
    </section>
  );
}
