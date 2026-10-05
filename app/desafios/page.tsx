import type { Metadata } from "next";
import ChallengeHub from "../components/challenge/hub";

export const metadata: Metadata = {
  title: "Desafios · Pokedex",
  description: "Adivinhe o Pokémon do dia pela silhueta, pela descrição, pelo zoom ou comparando atributos.",
};

export default function ChallengesPage() {
  return <ChallengeHub />;
}
