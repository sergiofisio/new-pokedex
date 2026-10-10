import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { LanguageProvider } from "./context/languageContext";
import { AuthProvider } from "./context/authContext";
import MotionProvider from "./components/motionProvider";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./lib/site";
import { ADSENSE_CLIENT } from "./lib/ads";
import { OG_IMAGE, SITE_KEYWORDS, websiteJsonLd } from "./lib/seo";
import JsonLd from "./components/jsonLd";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const GOOGLE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
const BING_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  category: 'games',
  openGraph: { title: SITE_NAME, description: SITE_DESCRIPTION, siteName: SITE_NAME, locale: 'pt_BR', type: 'website', images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image', title: SITE_NAME, description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
  ...((GOOGLE_VERIFICATION || BING_VERIFICATION) && {
    verification: {
      ...(GOOGLE_VERIFICATION && { google: GOOGLE_VERIFICATION }),
      ...(BING_VERIFICATION && { other: { 'msvalidate.01': BING_VERIFICATION } }),
    },
  }),
  description: SITE_DESCRIPTION,
  ...(ADSENSE_CLIENT && { other: { 'google-adsense-account': ADSENSE_CLIENT } }),
};

const themeScript = `
  const theme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: white)').matches;
  if (theme === 'dark' || (!theme && prefersDark)) document.documentElement.classList.add('dark');
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-black dark:text-white transition-colors">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={websiteJsonLd} />
        <MotionProvider>
          <LanguageProvider>
            <AuthProvider>
              <Header />
              <main className="flex flex-1 w-full">{children}</main>
              <Footer />
            </AuthProvider>
          </LanguageProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
