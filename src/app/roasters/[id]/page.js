import { getBeansByRoasteryId, getRoasteryById } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RoasteryPage({ params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const roastery = Number.isInteger(id) ? await getRoasteryById(id) : null;

  if (!roastery) {
    return (
      <section className="hero-card">
        <h1>Roastery not found</h1>
        <p className="muted">Try searching for a roastery on the map.</p>
      </section>
    );
  }

  const beans = await getBeansByRoasteryId(id);

  return (
    <section className="hero-card">
      <div className="split-header">
        <div>
          <span className="pill">Roastery</span>
          <h1>{roastery.name}</h1>
          <p className="muted">
            {[roastery.city, roastery.region, roastery.country]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {roastery.address ? <p className="muted">{roastery.address}</p> : null}
          {roastery.website ? (
            <a className="link" href={roastery.website} target="_blank" rel="noreferrer">
              Visit roastery website
            </a>
          ) : null}
        </div>
        <a className="button" href={`/beans/new?roasteryId=${roastery.id}`}>
          Add a bean
        </a>
      </div>

      <div className="section-divider" role="presentation" />

      <div className="card">
        <h2>Beans at this roastery</h2>
        {beans.length === 0 ? (
          <p className="muted">No beans yet. Add the first one.</p>
        ) : (
          <div className="grid">
            {beans.map((bean) => (
              <a className="card" href={`/beans/${bean.id}`} key={bean.id}>
                <div>
                  <h3>{bean.name}</h3>
                  <p className="muted">
                    {bean.origin_country}
                    {bean.origin_region ? ` · ${bean.origin_region}` : ""}
                  </p>
                </div>
                <div>
                  <p className="rating">
                    {Number.isFinite(Number(bean.avg_score))
                      ? Number(bean.avg_score).toFixed(1)
                      : "0.0"}
                    ★
                  </p>
                  <p className="muted">{bean.rating_count} ratings</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
