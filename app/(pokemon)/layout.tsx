import type { ReactNode } from "react";
import { PokedexProvider } from "../context/pokedexContext";
import IntroPokeball from "../components/introPokeball";

export default function PokemonLayout({ children }: { children: ReactNode }) {
  return (
    <PokedexProvider>
      {children}
      <IntroPokeball />
    </PokedexProvider>
  );
}
