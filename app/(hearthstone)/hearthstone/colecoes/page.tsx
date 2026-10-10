import type { Metadata } from "next";
import { SetIndex } from "../../../components/hearthstone/setPages";
import JsonLd from "../../../components/jsonLd";
import AdScript from "../../../components/ads/adScript";
import { getSetSummaries } from "../../../lib/hsServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Coleções de Hearthstone",
  description: "Todas as expansões e coleções de Hearthstone, com a lista de cartas, a quantidade por raridade e o custo em Pó Arcano para completar cada uma.",
  path: "/hearthstone/colecoes",
});

export default async function HearthstoneSetsPage() {
  const sets = await getSetSummaries();
  return (
    <>
      <AdScript />
      <SetIndex sets={sets} />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Coleções', '/hearthstone/colecoes']])} />
    </>
  );
}
