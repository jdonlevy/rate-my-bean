import { getBeans, getTopRegions } from "@/lib/db";

export default function Home() {
  const beans = getBeans();
  const topRegions = getTopRegions(5);

  return (
    <>
      <section className="hero">
        <div className="hero-card">
          <span className="pill">Local MVP</span>
          <h1>Rate coffee beans like a pro.</h1>
          <p>
            Track beans, blends, origins, and flavor notes. Compare ratings and
            see which regions deliver the best value.
          </p>
        </div>
        <div className="hero-card">
          <h2>Top Regions</h2>
          {topRegions.length === 0 ? (
            <p className="muted">No ratings yet. Add a bean and a rating.</p>
          ) : (
            <div className="grid">
              {topRegions.map((region) => (
                <div className="card" key={`${region.origin_country}-${region.origin_region}`}>
                  <h3>
                    {region.origin_country}
                    {region.origin_region ? ` · ${region.origin_region}` : ""}
                  </h3>
                  <p className="rating">{Number(region.avg_score).toFixed(1)}★</p>
                  <p className="muted">{region.rating_count} ratings</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2>All Beans</h2>
        {beans.length === 0 ? (
          <p className="muted">No beans yet. Add your first one.</p>
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
                    {bean.avg_score ? Number(bean.avg_score).toFixed(1) : "—"}★
                  </p>
                  <p className="muted">{bean.rating_count} ratings</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
