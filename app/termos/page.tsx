import type { Metadata } from "next";
import LegalPage from "../components/legalPage";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Termos de uso da Taverna dos Jogos, projeto de fã sobre Pokémon e Hearthstone.",
};

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
