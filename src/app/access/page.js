import AccessForm from "./AccessForm";

export default async function AccessPage({ searchParams }) {
  const resolved = await searchParams;
  const next = resolved?.next || "/";
  const error = resolved?.error === "1";

  return (
    <section className="hero-card">
      <h1>Enter Access Code</h1>
      <p className="muted">
        This is a private dev environment. Enter the shared access code to
        continue.
      </p>
      <AccessForm nextPath={next} hasError={error} />
    </section>
  );
}
