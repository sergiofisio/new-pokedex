import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChallengeGame from "../../components/challenge/game";
import PageGuide from "../../components/pageGuide";
import JsonLd from "../../components/jsonLd";
import { MODE_META } from "../../components/challenge/modes";
import { CHALLENGE_MODES, getModeWorld, isChallengeMode, supportsDaily, type ChallengeMode } from "../../lib/challenge";
import { breadcrumbJsonLd, gameJsonLd, pageMetadata } from "../../lib/seo";
import { MESSAGES, type MessageKey } from "../../i18n/translations";

type Props = { params: Promise<{ modo: string }> };

export const dynamicParams = false;

const HOW_TO: Record<ChallengeMode, MessageKey> = {
  silhueta: 'howtoSilhueta',
  descricao: 'howtoDescricao',
  zoom: 'howtoZoom',
  som: 'howtoSom',
  fusao: 'howtoFusao',
  ginasio: 'howtoGinasio',
  infinito: 'howtoInfinito',
  'hs-atributos': 'howtoHsAtributos',
  'hs-arte': 'howtoHsArte',
  'hs-texto': 'howtoHsTexto',
};

const modeTitle = (mode: ChallengeMode) => {
  const title = MESSAGES.pt[MODE_META[mode].title]
  if (getModeWorld(mode) === 'pokemon') return `${title} · Desafio Pokémon`
  return title.includes('Hearthdle') ? title : `${title} · Hearthdle`
}

export function generateStaticParams() {
  return CHALLENGE_MODES.map((modo) => ({ modo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { modo } = await params;
  if (!isChallengeMode(modo)) return {};
  return pageMetadata({
    title: modeTitle(modo),
    description: `${MESSAGES.pt[MODE_META[modo].description]} ${MESSAGES.pt[HOW_TO[modo]]}`.slice(0, 300),
    path: `/desafios/${modo}`,
  });
}

export default async function ChallengeModePage({ params }: Props) {
  const { modo } = await params;
  if (!isChallengeMode(modo)) notFound();
  const name = MESSAGES.pt[MODE_META[modo].title];
  const paragraphs: MessageKey[] = supportsDaily(modo) ? [HOW_TO[modo], 'howtoDaily'] : [HOW_TO[modo]];
  return (
    <ChallengeGame mode={modo}>
      <PageGuide title="guideHowToPlay" titleVars={{ mode: MODE_META[modo].title }} paragraphs={paragraphs} />
      <JsonLd data={gameJsonLd({ name: modeTitle(modo), description: MESSAGES.pt[HOW_TO[modo]], path: `/desafios/${modo}` })} />
      <JsonLd data={breadcrumbJsonLd([['Desafios', '/desafios'], [name, `/desafios/${modo}`]])} />
    </ChallengeGame>
  );
}
