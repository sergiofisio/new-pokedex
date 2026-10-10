import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PokemonProfileView from "../../../components/pokemonProfile";
import AdScript from "../../../components/ads/adScript";
import JsonLd from "../../../components/jsonLd";
import { getPokemonProfile } from "../../../lib/pokemonServer";
import { pokemonMetaDescription } from "../../../lib/pokemonText";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "../../../lib/seo";
import { getOfficialArtwork } from "../../../lib/sprites";

type Props = { params: Promise<{ nome: string }> };

export const revalidate = 2592000;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { nome } = await params;
  const profile = await getPokemonProfile(nome);
  if (!profile) return {};
  const metadata = pageMetadata({
    title: `${profile.name} (#${profile.id}): tipos, fraquezas e evoluções`,
    description: pokemonMetaDescription(profile),
    path: `/pokemon/${profile.slug}`,
  });
  const image = { url: getOfficialArtwork(profile.id), width: 475, height: 475, alt: profile.name };
  return { ...metadata, openGraph: { ...metadata.openGraph, images: [image] }, twitter: { ...metadata.twitter, card: 'summary', images: [image.url] } };
}

export default async function PokemonDetailPage({ params }: Props) {
  const { nome } = await params;
  const profile = await getPokemonProfile(nome);
  if (!profile) notFound();
  return (
    <div className="flex w-full flex-1 bg-zinc-100 dark:bg-zinc-950">
      <AdScript />
      <PokemonProfileView profile={profile} />
      <JsonLd data={breadcrumbJsonLd([['Pokédex', '/pokemon'], [profile.name, `/pokemon/${profile.slug}`]])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${profile.name} na Pokédex`,
          url: absoluteUrl(`/pokemon/${profile.slug}`),
          description: pokemonMetaDescription(profile),
          primaryImageOfPage: getOfficialArtwork(profile.id),
          inLanguage: 'pt-BR',
        }}
      />
    </div>
  );
}
