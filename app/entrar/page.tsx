import type { Metadata } from "next";
import AuthPage from "../components/auth/authPage";

export const metadata: Metadata = {
  title: "Entrar · Pokedex",
};

export default function SignInPage() {
  return <AuthPage />;
}
