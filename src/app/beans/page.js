import BeansList from "@/components/BeansList";
import { getBeans } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BeansPage() {
  const beans = await getBeans();

  return (
    <section className="hero-card">
      <h1>All beans</h1>
      <p className="muted">
        Filter by origin, roast, or process, then expand any row for full details.
      </p>
      <BeansList beans={beans} />
    </section>
  );
}
