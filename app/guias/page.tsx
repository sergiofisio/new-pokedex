import type { Metadata } from "next";
import { GuideIndex } from "../components/guideArticle";
import JsonLd from "../components/jsonLd";
import AdScript from "../components/ads/adScript";
import { GUIDES } from "../lib/guides";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Guias",
  description: "Guias de Pokémon e Hearthstone: tabela de tipos, como reconhecer Pokémon nos desafios, como gastar Pó Arcano e como montar um deck.",
  path: "/guias",
});

export default function GuidesPage() {
  return (
    <>
      <AdScript />
      <GuideIndex guides={GUIDES} />
      <JsonLd data={breadcrumbJsonLd([['Guias', '/guias']])} />
    </>
  );
}
