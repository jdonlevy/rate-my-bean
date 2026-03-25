import BeanFinder from "@/components/BeanFinder";
import DailyQuiz from "@/components/DailyQuiz";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  return (
    <div className="home">
      <section className="hero-card game-highlight">
        <div>
          <span className="pill">New Bean Game</span>
          <h2>Bean Snake Arcade</h2>
          <p className="muted">
            Play the bean‑powered version of snake. Collect beans, grow longer,
            and climb the leaderboard.
          </p>
        </div>
        <a className="button" href="/bean-snake">Play Bean Snake</a>
      </section>
      <BeanFinder />
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
