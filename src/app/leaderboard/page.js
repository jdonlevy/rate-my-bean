import { getTopRegions } from "@/lib/db";

export default async function LeaderboardPage() {
  const topRegions = await getTopRegions(50);

  return (
    <section className="hero-card">
      <h1>Leaderboard</h1>
      <p className="muted">
        Regions ranked by average score (ties broken by rating count).
      </p>
      {topRegions.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">★</p>
          <h3>No ratings yet</h3>
          <p className="muted">
            Add a bean and rate it to appear on the leaderboard.
          </p>
          <div className="cta-row">
            <a className="button" href="/beans/new">Add a bean</a>
            <a className="button secondary" href="/beans">Browse beans</a>
          </div>
        </div>
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
    </section>
  );
}
