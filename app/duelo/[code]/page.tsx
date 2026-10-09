import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DuelRoom from "../../components/duel/room";
import { isDuelCode, normalizeCode } from "../../lib/duel";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: `Duelo ${normalizeCode(code)}`, robots: { index: false, follow: false } };
}

export default async function DuelRoomPage({ params }: Props) {
  const code = normalizeCode((await params).code);
  if (!isDuelCode(code)) notFound();
  return <DuelRoom code={code} />;
}
