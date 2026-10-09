import type { Metadata } from "next";
import { pageMetadata } from "../lib/seo";
import LegalPage from "../components/legalPage";

export const metadata: Metadata = pageMetadata({
  title: "Política de privacidade",
  description: "Quais dados a Taverna dos Jogos coleta, como usa cookies e anúncios e quais são os seus direitos pela LGPD.",
  path: "/privacidade",
});

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
