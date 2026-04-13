import BeanFinder from "@/components/BeanFinder";
import DailyQuiz from "@/components/DailyQuiz";
import { auth } from "@/auth";
import { getTopBeansByCity } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const topBeans = await getTopBeansByCity("London", 6);
  return (
    <div className="home">
      <BeanFinder />
      <section className="hero-card">
        <div className="split-header">
          <div>
            <span className="pill">London picks</span>
            <h2>Top beans in London</h2>
            <p className="muted">
              Highest rated beans from London roasteries.
            </p>
          </div>
          <a className="button secondary" href="/beans">
            View all beans
          </a>
        </div>
        {topBeans.length ? (
          <div className="grid">
            {topBeans.map((bean) => (
              <a className="card" key={bean.id} href={`/beans/${bean.id}`}>
                <div>
                  <h3>{bean.name}</h3>
                  <p className="muted">{bean.roastery_name || "Roastery"}</p>
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
        ) : (
          <p className="muted">No rated beans yet. Be the first to add one.</p>
        )}
      </section>
      {session?.user ? (
        <section className="quiz-section">
          <div className="section-divider" role="presentation" />
          <DailyQuiz isLoggedIn />
        </section>
      ) : null}
      <section className="hero-card finder-footer">
        <h2>Already found your beans?</h2>
        <p className="muted">
          Browse the community ratings or add a new bean for a roastery.
        </p>
        <div className="cta-row">
          <a className="button" href="/beans">View beans</a>
          <a className="button secondary" href="/beans/new">Add a bean</a>
        </div>
      </section>
    </div>
  );
}
