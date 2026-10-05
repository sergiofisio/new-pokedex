import { notFound } from "next/navigation";
import ChallengeGame from "../../components/challenge/game";
import { CHALLENGE_MODES, isChallengeMode } from "../../lib/challenge";

export const dynamicParams = false;

export function generateStaticParams() {
  return CHALLENGE_MODES.map((modo) => ({ modo }));
}

export default async function ChallengeModePage({ params }: { params: Promise<{ modo: string }> }) {
  const { modo } = await params;
  if (!isChallengeMode(modo)) notFound();
  return <ChallengeGame mode={modo} />;
}
