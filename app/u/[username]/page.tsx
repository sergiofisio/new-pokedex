import type { Metadata } from "next";
import PublicProfile from "../../components/profile/publicProfile";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${decodeURIComponent(username)}` };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  return <PublicProfile username={decodeURIComponent(username)} />;
}
