import { auth } from "@/auth";
import { getBeanById, getRatingsForBean } from "@/lib/db";
import RatingForm from "./RatingForm";

export default async function BeanDetailPage({ params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const bean = Number.isInteger(id) ? getBeanById(id) : null;
  const session = await auth();

  if (!bean) {
    return (
      <section className="hero-card">
        <h1>Bean not found</h1>
        <p className="muted">Try going back to the list and adding one.</p>
      </section>
    );
  }

  const ratings = getRatingsForBean(id);

  return (
    <section className="split">
      <div className="hero-card">
        <span className="pill">Bean detail</span>
        <h1>{bean.name}</h1>
        <p className="muted">
          {bean.origin_country}
          {bean.origin_region ? ` · ${bean.origin_region}` : ""}
        </p>
        <p className="rating">
          {bean.avg_score ? Number(bean.avg_score).toFixed(1) : "—"}★
        </p>
        <p className="muted">{bean.rating_count} ratings</p>

        <div className="grid">
          <div className="card">
            <h3>Roaster</h3>
            <p>{bean.roaster || "—"}</p>
          </div>
          <div className="card">
            <h3>Process</h3>
            <p>{bean.process || "—"}</p>
          </div>
          <div className="card">
            <h3>Roast level</h3>
            <p>{bean.roast_level || "—"}</p>
          </div>
          <div className="card">
            <h3>Price (USD)</h3>
            <p>{bean.price_usd ? `$${bean.price_usd}` : "—"}</p>
          </div>
        </div>

        <div className="card">
          <h3>Flavor notes</h3>
          <p>{bean.flavor_notes || "—"}</p>
        </div>
      </div>

      <div className="hero-card">
        <h2>Add a rating</h2>
        <RatingForm beanId={id} canRate={Boolean(session?.user)} />
        <div className="card">
          <h3>Recent ratings</h3>
          {ratings.length === 0 ? (
            <p className="muted">No ratings yet.</p>
          ) : (
            <div className="form">
              {ratings.map((rating) => (
                <div className="card" key={rating.id}>
                  <p className="rating">{rating.score}★</p>
                  <p className="muted">
                    {rating.price_paid ? `$${rating.price_paid}` : "No price"}
                  </p>
                  <p>{rating.notes || "No notes"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
