import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import HomePage from "../../pages/home";
import PageGuide from "../../components/pageGuide";

export const metadata: Metadata = pageMetadata({
  title: "Pokédex",
  description: "Pokédex completa com os 1025 Pokémon das 9 gerações: tipos, estatísticas, evoluções, golpes, descrições e gritos, com os cenários de cada região.",
  path: "/pokemon",
});

export default function PokemonPage() {
  return (
    <div className="flex flex-1 font-sans">
      <HomePage>
        <PageGuide title="guidePokemonTitle" paragraphs={['guidePokemonP1', 'guidePokemonP2']} />
      </HomePage>
    </div>
  );
}
