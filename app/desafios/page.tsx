import type { Metadata } from "next";
import ChallengeHub from "../components/challenge/hub";

export const metadata: Metadata = {
  title: "Desafios",
  description: "Desafios diários de Pokémon e Hearthstone: silhueta, grito, fusão, ginásio, Hearthdle e muito mais.",
};

export default function ChallengesPage() {
  return <ChallengeHub />;
}
