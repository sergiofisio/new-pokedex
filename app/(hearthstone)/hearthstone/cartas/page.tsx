import type { Metadata } from "next";
import HsLibrary from "../../../components/hearthstone/library";
import HsPageHeader from "../../../components/hearthstone/pageHeader";

export const metadata: Metadata = {
  title: "Cartas de Hearthstone",
  description: "Pesquise todas as cartas colecionáveis de Hearthstone por classe, custo, raridade, tipo e coleção.",
};

export default async function HearthstoneCardsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { classe } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <HsPageHeader title="hsLibrary" text="hsLibraryDesc" />
      <HsLibrary initialClass={typeof classe === 'string' ? classe : ''} />
    </div>
  );
}
