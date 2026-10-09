import type { Metadata } from "next";
import ProfileEditor from "../components/profile/profileEditor";

export const metadata: Metadata = {
  title: "Meu perfil",
};

export default function ProfilePage() {
  return <ProfileEditor />;
}
