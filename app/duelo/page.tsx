import type { Metadata } from "next";
import DuelLobby from "../components/duel/lobby";

export const metadata: Metadata = {
  title: "Duelo · Pokedex",
  description: "Desafie outro treinador: a mesma série de desafios, quem fizer mais pontos vence.",
};

export default function DuelPage() {
  return <DuelLobby />;
}
