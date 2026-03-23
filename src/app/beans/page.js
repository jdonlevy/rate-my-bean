import BeansList from "@/components/BeansList";
import { getBeans } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BeansPage({ searchParams }) {
  const beans = await getBeans();
  const initialFilters = {
    search: searchParams?.search || "",
    country: searchParams?.country || "",
    region: searchParams?.region || "",
    blend: searchParams?.blend || "",
    process: searchParams?.process || "",
    roast: searchParams?.roast || "",
    minPrice: searchParams?.minPrice || "",
    maxPrice: searchParams?.maxPrice || "",
    minRating: searchParams?.minRating || "",
  };

  return (
    <section className="hero-card">
      <h1>All beans</h1>
      <p className="muted">
        Filter by origin, roast, or process, then expand any row for full details.
      </p>
      <BeansList beans={beans} initialFilters={initialFilters} />
    </section>
  );
}
