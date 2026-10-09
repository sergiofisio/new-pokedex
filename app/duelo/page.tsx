import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import DuelLobby from "../components/duel/lobby";

export const metadata: Metadata = pageMetadata({
  title: "Duelo",
  description: "Desafie um amigo em duelos online de Pokémon e Hearthstone: a mesma série de rodadas para os dois, e quem fizer mais pontos vence.",
  path: "/duelo",
});

export default function DuelPage() {
  return <DuelLobby />;
}
