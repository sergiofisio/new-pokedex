import type { Metadata } from "next";
import { pageMetadata } from "../../lib/seo";
import HsHome from "../../components/hearthstone/home";
import AdScript from "../../components/ads/adScript";

export const metadata: Metadata = pageMetadata({
  title: "Hearthstone",
  description: "Taverna Hearthstone: biblioteca com todas as cartas, Hearthdle diário e deckbuilder que calcula o pó que falta com base na sua coleção.",
  path: "/hearthstone",
});

export default function HearthstonePage() {
  return (
    <>
      <AdScript />
      <HsHome />
    </>
  );
}
