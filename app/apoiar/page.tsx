import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import DonatePage from "../components/donate";

export const metadata: Metadata = pageMetadata({
  title: "Apoie o projeto",
  description: "Ajude a manter a Taverna dos Jogos no ar com uma doação via Pix ou Ko-fi.",
  path: "/apoiar",
});

export default function SupportPage() {
  return <DonatePage />;
}
