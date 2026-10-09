import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./site";

export const OG_IMAGE = { url: '/opengraph-image.png', width: 1200, height: 630, alt: SITE_NAME }

export const SITE_KEYWORDS = [
  'Pokédex', 'Pokémon', 'Pokedle', 'quem é esse Pokémon', 'desafio diário Pokémon',
  'Hearthstone', 'Hearthdle', 'cartas de Hearthstone', 'deckbuilder Hearthstone', 'deck codes Hearthstone',
  'jogo de adivinhação', 'desafio diário', 'Taverna dos Jogos',
]

interface PageSeo {
  title?: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

export function pageMetadata({ title, description, path, noIndex }: PageSeo): Metadata {
  const ogTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: { title: ogTitle, description, url: path, siteName: SITE_NAME, locale: 'pt_BR', type: 'website', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [OG_IMAGE.url] },
    ...(noIndex && { robots: { index: false, follow: true } }),
  }
}

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString()

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: ['pt-BR', 'en'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl('/brand/icon-1024.png'),
    },
  ],
}

export function breadcrumbJsonLd(items: [name: string, path: string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}

export function gameJsonLd({ name, description, path }: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

export function faqJsonLd(entries: [question: string, answer: string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}
