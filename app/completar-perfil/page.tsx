import type { Metadata } from "next";
import CompleteProfile from "../components/auth/completeProfile";

export const metadata: Metadata = {
  title: "Completar perfil",
};

export default function CompleteProfilePage() {
  return <CompleteProfile />;
}
