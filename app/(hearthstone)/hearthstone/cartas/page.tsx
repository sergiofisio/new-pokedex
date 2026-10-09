import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import HsLibrary from "../../../components/hearthstone/library";
import HsPageHeader from "../../../components/hearthstone/pageHeader";
import PageGuide from "../../../components/pageGuide";
import JsonLd from "../../../components/jsonLd";
import { breadcrumbJsonLd } from "../../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cartas de Hearthstone",
  description: "Pesquise todas as cartas colecionáveis de Hearthstone por classe, custo, raridade, tipo, coleção e formato Padrão ou Livre, em português e inglês.",
  path: "/hearthstone/cartas",
});

export default async function HearthstoneCardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { classe } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <HsPageHeader title="hsLibrary" text="hsLibraryDesc" />
      <HsLibrary initialClass={typeof classe === 'string' ? classe : ''} />
      <PageGuide tone="tavern" title="guideCardsTitle" paragraphs={['guideCardsP1', 'guideCardsP2']} />
      <JsonLd data={breadcrumbJsonLd([['Hearthstone', '/hearthstone'], ['Cartas', '/hearthstone/cartas']])} />
    </div>
  );
}
