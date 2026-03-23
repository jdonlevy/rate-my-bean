import BeanFinder from "@/components/BeanFinder";
import DailyQuiz from "@/components/DailyQuiz";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  return (
    <div className="home">
      <div className="home-layout">
        <div className="home-main">
          <BeanFinder />
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
        <DailyQuiz isLoggedIn={Boolean(session?.user)} />
      </div>
    </div>
  );
}
