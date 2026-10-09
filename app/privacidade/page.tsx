import type { Metadata } from "next";
import LegalPage from "../components/legalPage";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Quais dados a PokéTaverna coleta, como usa cookies e anúncios e quais são os seus direitos pela LGPD.",
};

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
