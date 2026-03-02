import { getTopRegions } from "@/lib/db";

export default function LeaderboardPage() {
  const topRegions = getTopRegions(50);

  return (
    <section className="hero-card">
      <h1>Leaderboard</h1>
      <p className="muted">
        Regions ranked by average score (ties broken by rating count).
      </p>
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
    </section>
  );
}
