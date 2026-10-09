import type { Metadata } from "next";
import { pageMetadata } from "./lib/seo";
import { SITE_DESCRIPTION } from "./lib/site";
import WorldHub from "./components/worldHub";
import PageGuide from "./components/pageGuide";

export const metadata: Metadata = pageMetadata({ description: SITE_DESCRIPTION, path: "/" });

export default function Home() {
  return (
    <WorldHub>
      <PageGuide tone="dark" title="guideHomeTitle" paragraphs={['guideHomeP1', 'guideHomeP2', 'guideHomeP3']} />
    </WorldHub>
  );
}
