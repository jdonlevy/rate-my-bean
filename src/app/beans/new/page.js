import { auth } from "@/auth";
import { getBeanFieldSuggestions } from "@/lib/db";
import NewBeanForm from "./NewBeanForm";

export default async function NewBeanPage({ searchParams }) {
  const session = await auth();
  const suggestions = JSON.parse(
    JSON.stringify(await getBeanFieldSuggestions())
  );
  const isPreview = process.env.VERCEL_ENV === "preview";
  const initialRoasteryId = searchParams?.roasteryId || "";

  return (
    <section className="hero-card">
      <h1>Add a Bean</h1>
      <p className="muted">
        Start with the essentials. You can add more details later.
      </p>

      {session?.user || isPreview ? (
        <NewBeanForm
          suggestions={suggestions}
          initialRoasteryId={initialRoasteryId}
          userName={session?.user?.name || session?.user?.email || ""}
        />
      ) : (
        <div className="empty-state">
          <p className="empty-state-icon">🫘</p>
          <h3>Sign in to add a bean</h3>
          <p className="muted">You need an account to submit beans to the catalogue.</p>
          <div className="cta-row">
            <a className="button" href="/login">Sign in</a>
            <a className="button secondary" href="/signup">Create account</a>
          </div>
        </div>
      )}
    </section>
  );
}
