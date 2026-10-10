import type { Metadata } from "next";
import { pageMetadata, faqJsonLd } from "../lib/seo";
import ChallengeHub from "../components/challenge/hub";
import PageGuide from "../components/pageGuide";
import JsonLd from "../components/jsonLd";
import AdScript from "../components/ads/adScript";
import { MESSAGES, type MessageKey } from "../i18n/translations";

export const metadata: Metadata = pageMetadata({
  title: "Desafios diários de Pokémon e Hearthstone",
  description: "Desafios diários no estilo Wordle: adivinhe o Pokémon pela silhueta, grito, descrição, zoom ou fusão, ou a carta de Hearthstone no Hearthdle.",
  path: "/desafios",
});

const FAQ: [MessageKey, MessageKey][] = [
  ['faqDailyQ', 'faqDailyA'],
  ['faqModesQ', 'faqModesA'],
  ['faqHearthdleQ', 'faqHearthdleA'],
  ['faqRandomQ', 'faqRandomA'],
  ['faqDuelQ', 'faqDuelA'],
  ['faqAccountQ', 'faqAccountA'],
];

export default function ChallengesPage() {
  return (
    <ChallengeHub>
      <AdScript />
      <PageGuide title="guideChallengesTitle" faq={FAQ} />
      <JsonLd data={faqJsonLd(FAQ.map(([question, answer]) => [MESSAGES.pt[question], MESSAGES.pt[answer]]))} />
    </ChallengeHub>
  );
}
