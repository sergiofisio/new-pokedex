import type { Metadata } from "next";
import AdScript from "../components/ads/adScript";
import GuideArticle from "../components/guideArticle";
import JsonLd from "../components/jsonLd";
import { ABOUT } from "../lib/guides";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import { SITE_NAME } from "../lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Sobre",
  description: ABOUT.pt.description,
  path: "/sobre",
});

export default function AboutPage() {
  return (
    <>
      <AdScript />
      <GuideArticle content={ABOUT} breadcrumb={false} />
      <JsonLd data={breadcrumbJsonLd([['Sobre', '/sobre']])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: ABOUT.pt.title,
          url: absoluteUrl('/sobre'),
          inLanguage: 'pt-BR',
          about: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/'), founder: { '@type': 'Person', name: 'Sergio Bastos Jr' } },
        }}
      />
    </>
  );
}
