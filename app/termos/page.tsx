import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import LegalPage from "../components/legalPage";

export const metadata: Metadata = pageMetadata({
  title: "Termos de uso",
  description: "Termos de uso da Taverna dos Jogos, projeto de fã sobre Pokémon e Hearthstone.",
  path: "/termos",
});

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
