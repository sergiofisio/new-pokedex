import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import HsCardProfile from "../../../../components/hearthstone/cardProfile";
import JsonLd from "../../../../components/jsonLd";
import AdScript from "../../../../components/ads/adScript";
import { cardMetaDescription } from "../../../../lib/cardText";
import { cardRender, setSlug } from "../../../../lib/hearthstone";
import { getCardPage } from "../../../../lib/hsServer";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "../../../../lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 604800;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lookup = await getCardPage(slug);
  if (lookup.status !== 'found') return {};
  const { card, set, texts } = lookup.data;
  const description = cardMetaDescription(card, set, texts.pt[0]);
  const metadata = pageMetadata({
    title: `${card.name[0]}: carta de Hearthstone`,
    description,
    path: `/hearthstone/cartas/${lookup.data.slug}`,
  });
  const image = { url: cardRender(card, 'pt', 512), width: 512, height: 776, alt: card.name[0] };
  return { ...metadata, openGraph: { ...metadata.openGraph, images: [image] }, twitter: { ...metadata.twitter, card: 'summary', images: [image.url] } };
}

export default async function HearthstoneCardPage({ params }: Props) {
  const { slug } = await params;
  const lookup = await getCardPage(slug);
  if (lookup.status === 'redirect') permanentRedirect(`/hearthstone/cartas/${lookup.slug}`);
  if (lookup.status === 'missing') notFound();
  const { card, set, texts } = lookup.data;
  const path = `/hearthstone/cartas/${lookup.data.slug}`;
  return (
    <>
      <AdScript />
      <HsCardProfile page={lookup.data} />
      <JsonLd
        data={breadcrumbJsonLd([
          ['Hearthstone', '/hearthstone'],
          ['Cartas', '/hearthstone/cartas'],
          [set.name[0], `/hearthstone/colecoes/${setSlug(set)}`],
          [card.name[0], path],
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${card.name[0]} (${card.name[1]})`,
          url: absoluteUrl(path),
          description: cardMetaDescription(card, set, texts.pt[0]),
          primaryImageOfPage: cardRender(card, 'pt', 512),
          inLanguage: 'pt-BR',
        }}
      />
    </>
  );
}
