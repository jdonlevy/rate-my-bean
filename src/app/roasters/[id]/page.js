import { auth } from "@/auth";
import { getBeansByRoasteryId, getRoasteryById } from "@/lib/db";
import RoasteryBeansList from "@/components/RoasteryBeansList";

export const dynamic = "force-dynamic";

export default async function RoasteryPage({ params }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  const session = await auth();
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
        <RoasteryBeansList
          beans={beans}
          roasteryId={roastery.id}
          canReport={Boolean(session?.user)}
        />
      </div>
    </section>
  );
}
