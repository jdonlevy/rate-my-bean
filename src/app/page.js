import HomeMap from "@/components/HomeMap";
import { getBeans, getStats, getTopRegions } from "@/lib/db";

export const dynamic = "force-dynamic";

const COUNTRY_COORDS = {
  Brazil: { lat: -10, lng: -55 },
  Colombia: { lat: 4, lng: -74 },
  Guatemala: { lat: 15.5, lng: -90.2 },
  "Costa Rica": { lat: 9.8, lng: -84.2 },
  Honduras: { lat: 15.2, lng: -86.4 },
  "El Salvador": { lat: 13.8, lng: -88.9 },
  Nicaragua: { lat: 12.8, lng: -85.1 },
  Mexico: { lat: 23.6, lng: -102.5 },
  Peru: { lat: -9.2, lng: -75 },
  Ethiopia: { lat: 9.1, lng: 40.5 },
  Kenya: { lat: 0.2, lng: 37.9 },
  Rwanda: { lat: -1.9, lng: 29.9 },
  Burundi: { lat: -3.4, lng: 29.9 },
  Indonesia: { lat: -2.5, lng: 118 },
  "Papua New Guinea": { lat: -6.3, lng: 147 },
  "United Kingdom": { lat: 54, lng: -2 },
};

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function offsetForRegion(country, region) {
  if (!region) return { lat: 0, lng: 0 };
  const seed = hashString(`${country}:${region}`);
  const angle = ((seed % 360) * Math.PI) / 180;
  const radius = 0.6 + ((seed >> 8) % 18) / 10;
  return {
    lat: Math.sin(angle) * radius,
    lng: Math.cos(angle) * radius * 1.4,
  };
}

export default async function Home() {
  const beans = await getBeans();
  const topRegions = await getTopRegions(3);
  const stats = await getStats();
  const pins = Array.from(
    new Map(
      beans
        .map((bean) => {
          const coord = COUNTRY_COORDS[bean.origin_country];
          if (!coord) return null;
          const offset = offsetForRegion(bean.origin_country, bean.origin_region);
          return [
            `${bean.origin_country}-${bean.origin_region || "all"}`,
            {
              country: bean.origin_country,
              region: bean.origin_region,
              lat: coord.lat + offset.lat,
              lng: coord.lng + offset.lng,
            },
          ];
        })
        .filter(Boolean)
    ).values()
  );

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-card map-card">
          <div className="map-header">
            <span className="pill">Origin map</span>
            <h1>Global bean origins.</h1>
            <p>
              Explore where top-rated beans are coming from, in real time.
            </p>
          </div>
          <HomeMap pins={pins} />
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
        <h2>All Blends</h2>
        {beans.length === 0 ? (
          <p className="muted">No beans yet. Add your first one.</p>
        ) : (
          <div className="grid">
            {beans.map((bean) => (
              <a className="card" href={`/beans/${bean.id}`} key={bean.id}>
                <div>
                  <h3>{bean.name}</h3>
                  {bean.reviewer_name ? (
                    <p className="muted">Reviewed by {bean.reviewer_name}</p>
                  ) : null}
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
