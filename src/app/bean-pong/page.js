import BeanPongGame from "@/components/BeanPongGame";

export const dynamic = "force-dynamic";

export default function BeanPongPage() {
  return (
    <section className="bean-game-shell">
      <BeanPongGame />
    </section>
  );
}
