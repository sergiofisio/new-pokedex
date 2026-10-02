import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { PokedexProvider } from "./context/pokedexContext";
import { LanguageProvider } from "./context/languageContext";
import MotionProvider from "./components/motionProvider";
import IntroPokeball from "./components/introPokeball";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pokedex",
  description: "Pokedex is a web application that allows you to search for Pokémon by name or number.",
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
      </head>
      <body className="min-h-full flex flex-col bg-white text-black dark:bg-black dark:text-white transition-colors">
        <MotionProvider>
          <LanguageProvider>
            <PokedexProvider>
              <Header />
              <main className="flex flex-1 w-full">{children}</main>
              <Footer />
              <IntroPokeball />
            </PokedexProvider>
          </LanguageProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
