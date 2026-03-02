import RegionMap from "@/components/RegionMap";
import { getBeanFieldSuggestions } from "@/lib/db";

const COUNTRY_COORDS = {
  Brazil: { x: 35, y: 64 },
  Colombia: { x: 26, y: 46 },
  Guatemala: { x: 22, y: 44 },
  "Costa Rica": { x: 23.5, y: 48 },
  Honduras: { x: 23, y: 45 },
  "El Salvador": { x: 24, y: 46.5 },
  Nicaragua: { x: 24.5, y: 48.5 },
  Mexico: { x: 17, y: 40 },
  Peru: { x: 30, y: 63 },
  Ethiopia: { x: 62, y: 56 },
  Kenya: { x: 60, y: 58 },
  Rwanda: { x: 58, y: 60 },
  Burundi: { x: 58.5, y: 61.5 },
  Indonesia: { x: 79, y: 72 },
  "Papua New Guinea": { x: 86, y: 74 },
};

export default async function RegionsPage() {
  const suggestions = await getBeanFieldSuggestions();
  const pins = (suggestions?.beans || [])
    .map((bean) => {
      const coord = COUNTRY_COORDS[bean.origin_country];
      if (!coord) return null;
      return {
        country: bean.origin_country,
        region: bean.origin_region,
        x: coord.x,
        y: coord.y,
      };
    })
    .filter(Boolean);

  return (
    <section className="hero-card">
      <h1>Origin Regions</h1>
      <p className="muted">
        Explore where blends come from. Pins reflect all origins in your
        collection.
      </p>
      <RegionMap pins={pins} />
    </section>
  );
}
