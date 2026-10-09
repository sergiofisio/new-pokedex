import type { Metadata } from "next";
import DecksPage from "../../../components/hearthstone/decksPage";
import HsPageHeader from "../../../components/hearthstone/pageHeader";

export const metadata: Metadata = {
  title: "Deckbuilder de Hearthstone",
  description: "Monte decks de Hearthstone, importe e compartilhe códigos e veja quanto pó falta para os decks de referência com base na sua coleção.",
};

export default async function HearthstoneDecksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { deck } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <HsPageHeader title="hsDecks" text="hsDecksDesc" />
      <DecksPage initialCode={typeof deck === 'string' ? deck : undefined} />
    </div>
  );
}
