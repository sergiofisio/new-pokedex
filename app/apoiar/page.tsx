import type { Metadata } from "next";
import DonatePage from "../components/donate";

export const metadata: Metadata = {
  title: "Apoie o projeto",
  description: "Ajude a manter a Pokédex no ar com uma doação via Pix ou Ko-fi.",
};

export default function SupportPage() {
  return <DonatePage />;
}
