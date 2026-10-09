import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import ProfileEditor from "../components/profile/profileEditor";

export const metadata: Metadata = pageMetadata({
  title: "Meu perfil",
  description: "Edite o seu perfil na Taverna dos Jogos.",
  path: "/perfil",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileEditor />;
}
