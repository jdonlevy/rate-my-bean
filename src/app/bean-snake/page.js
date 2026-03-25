import BeanSnakeGame from "@/components/BeanSnakeGame";

export const dynamic = "force-dynamic";

export default function BeanSnakePage() {
  return (
    <section className="bean-game-shell">
      <BeanSnakeGame />
    </section>
  );
}
