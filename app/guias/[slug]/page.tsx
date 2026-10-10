import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuideArticle from "../../components/guideArticle";
import JsonLd from "../../components/jsonLd";
import AdScript from "../../components/ads/adScript";
import TypeChartTable from "../../components/typeChartTable";
import { GUIDES, getGuide } from "../../lib/guides";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import { SITE_NAME } from "../../lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const { title, description } = guide.content.pt;
  return pageMetadata({ title, description, path: `/guias/${guide.slug}` });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const { title, description } = guide.content.pt;
  const path = `/guias/${guide.slug}`;
  return (
    <>
      <AdScript />
      <GuideArticle content={guide.content} updated={guide.updated}>
        {guide.slug === 'tabela-de-tipos' && <TypeChartTable />}
      </GuideArticle>
      <JsonLd data={breadcrumbJsonLd([['Guias', '/guias'], [title, path]])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title,
          description,
          url: absoluteUrl(path),
          inLanguage: 'pt-BR',
          dateModified: guide.updated,
          author: { '@type': 'Person', name: 'Sergio Bastos Jr' },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
        }}
      />
    </>
  );
}
