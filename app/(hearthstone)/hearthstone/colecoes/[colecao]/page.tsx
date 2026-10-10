import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SetDetail } from "../../../../components/hearthstone/setPages";
import { describeSet } from "../../../../lib/cardText";
import JsonLd from "../../../../components/jsonLd";
import AdScript from "../../../../components/ads/adScript";
import { getSetPage, getSetSummaries } from "../../../../lib/hsServer";
import { breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ colecao: string }> };

export async function generateStaticParams() {
  const sets = await getSetSummaries();
  return sets.map(({ slug }) => ({ colecao: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { colecao } = await params;
  const page = await getSetPage(colecao);
  if (!page) return {};
  return pageMetadata({
    title: `${page.set.name[0]}: cartas da coleção de Hearthstone`,
    description: describeSet(page.set, page.cards, 'pt').slice(0, 2).join(' '),
    path: `/hearthstone/colecoes/${page.slug}`,
  });
}

export default async function HearthstoneSetPage({ params }: Props) {
  const { colecao } = await params;
  const page = await getSetPage(colecao);
  if (!page) notFound();
  return (
    <>
      <AdScript />
      <SetDetail set={page.set} cards={page.cards} />
      <JsonLd
        data={breadcrumbJsonLd([
          ['Hearthstone', '/hearthstone'],
          ['Coleções', '/hearthstone/colecoes'],
          [page.set.name[0], `/hearthstone/colecoes/${page.slug}`],
        ])}
      />
    </>
  );
}
