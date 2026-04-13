import { auth } from "@/auth";
import AuthLogin from "@/components/AuthLogin";

export default async function LoginPage() {
  const session = await auth();
  const isPreview = process.env.VERCEL_ENV === "preview";

  if (session?.user) {
    const firstName = session.user.name
      ? session.user.name.split(" ")[0]
      : null;

    return (
      <section className="hero-card welcome-card">
        <div className="welcome-back">
          <span className="welcome-icon">☕</span>
          <div>
            <h1>Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
            <p className="muted">Signed in as {session.user.email}</p>
          </div>
        </div>
        <div className="cta-row">
          <a className="button" href="/">Go to Discover</a>
          <a className="button secondary" href="/api/auth/signout">Sign out</a>
        </div>
      </section>
    );
  }

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
