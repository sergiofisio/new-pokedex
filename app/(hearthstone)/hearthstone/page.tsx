import type { Metadata } from "next";
import HsHome from "../../components/hearthstone/home";

export const metadata: Metadata = {
  title: "Hearthstone",
  description: "Biblioteca de cartas de Hearthstone, Hearthdle diário e deckbuilder com base na sua coleção.",
};

export default function HearthstonePage() {
  return <HsHome />;
}
