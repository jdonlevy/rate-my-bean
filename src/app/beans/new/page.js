import { auth } from "@/auth";
import { getBeanFieldSuggestions } from "@/lib/db";
import NewBeanForm from "./NewBeanForm";

export default async function NewBeanPage() {
  const session = await auth();
  const suggestions = await getBeanFieldSuggestions();

  return (
    <section className="hero-card">
      <h1>Add a Bean</h1>
      <p className="muted">
        Start with the essentials. You can add more details later.
      </p>

      {session?.user ? (
        <NewBeanForm suggestions={suggestions} />
      ) : (
        <div className="card">
          <p className="muted">Sign in to add a bean.</p>
          <a className="button" href="/api/auth/signin">
            Sign in
          </a>
        </div>
      )}
    </section>
  );
}
