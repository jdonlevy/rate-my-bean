import { getBeans, getStats, getTopRegions } from "@/lib/db";

export default async function Home() {
  const beans = await getBeans();
  const topRegions = await getTopRegions(3);
  const stats = await getStats();

  return (
    <div className="home">
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
          <a className="link" href="/leaderboard">
            View full leaderboard →
          </a>
        </div>
      </section>

      <section className="stats">
        <div className="stat-card">
          <p className="stat-label">Beans Logged</p>
          <p className="stat-value">{stats.beanCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Ratings</p>
          <p className="stat-value">{stats.ratingCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Average Score</p>
          <p className="stat-value">{Number(stats.avgScore).toFixed(1)}★</p>
        </div>
      </section>

      <div className="section-divider" role="presentation" />

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
      </section>
    </div>
  );
}
