import type { Metadata } from "next";
import HomePage from "../../pages/home";

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Todos os 1025 Pokémon das 9 gerações, com evoluções, golpes, gritos e fundos de cada região.",
};

export default function PokemonPage() {
  return (
    <div className="flex flex-1 font-sans">
      <HomePage />
    </div>
  );
}
