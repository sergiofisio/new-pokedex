import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import AuthPage from "../components/auth/authPage";

export const metadata: Metadata = pageMetadata({
  title: "Entrar",
  description: "Entre na Taverna dos Jogos para salvar o progresso e duelar com amigos.",
  path: "/entrar",
  noIndex: true,
});

export default function SignInPage() {
  return <AuthPage />;
}
