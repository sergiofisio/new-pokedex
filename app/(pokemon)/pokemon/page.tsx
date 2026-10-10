import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import HomePage from "../../pages/home";
import PageGuide from "../../components/pageGuide";
import PokedexIndex from "../../components/pokedexIndex";
import { getPokemonList } from "../../lib/pokemonServer";
import AdScript from "../../components/ads/adScript";

export const revalidate = 2592000;

export const metadata: Metadata = pageMetadata({
  title: "Pokédex",
  description: "Pokédex completa com os 1025 Pokémon das 9 gerações: tipos, estatísticas, evoluções, golpes, descrições e gritos, com os cenários de cada região.",
  path: "/pokemon",
});

export default async function PokemonPage() {
  const list = await getPokemonList().catch(() => []);
  return (
    <div className="flex flex-1 font-sans">
      <AdScript />
      <HomePage>
        <div className="flex flex-col gap-6">
          <PageGuide title="guidePokemonTitle" paragraphs={['guidePokemonP1', 'guidePokemonP2']} />
          {list.length > 0 && <PokedexIndex list={list} />}
        </div>
      </HomePage>
    </div>
  );
}
