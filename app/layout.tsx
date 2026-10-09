import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { LanguageProvider } from "./context/languageContext";
import { AuthProvider } from "./context/authContext";
import MotionProvider from "./components/motionProvider";
import AdScript from "./components/ads/adScript";
import { SITE_DESCRIPTION, SITE_NAME } from "./lib/site";
import { ADSENSE_CLIENT } from "./lib/ads";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AdScript />
      </head>
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-black dark:text-white transition-colors">
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
