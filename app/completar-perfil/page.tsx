import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import CompleteProfile from "../components/auth/completeProfile";

export const metadata: Metadata = pageMetadata({
  title: "Completar perfil",
  description: "Complete o seu perfil na Taverna dos Jogos.",
  path: "/completar-perfil",
  noIndex: true,
});

export default function CompleteProfilePage() {
  return <CompleteProfile />;
}
