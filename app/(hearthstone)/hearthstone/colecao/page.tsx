import type { Metadata } from "next";
import { pageMetadata } from "../../../lib/seo";
import CollectionPage from "../../../components/hearthstone/collectionPage";
import HsPageHeader from "../../../components/hearthstone/pageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Minha coleção de Hearthstone",
  description: "Marque as cartas de Hearthstone que você tem para o deckbuilder calcular o pó que falta e sugerir cartas substitutas.",
  path: "/hearthstone/colecao",
});

export default function HearthstoneCollectionPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8">
      <HsPageHeader title="collectionTitle" text="collectionSubtitle" />
      <CollectionPage />
    </div>
  );
}
