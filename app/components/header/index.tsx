import Link from "next/link";
import ThemeToggle from "../themeToggle";
import LanguageToggle from "../languageToggle";
import MainNav from "../mainNav";
import Pokeball from "../pokeball";
import UserMenu from "../userMenu";

export default function Header() {
  return (
    <header className="w-full border-b-4 border-red-900 bg-red-600 px-4 text-white shadow-md dark:bg-red-800">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight">
          <Link href="/" className="flex items-center gap-3">
            <Pokeball />
            <span className="max-sm:sr-only">Pokédex</span>
          </Link>
        </h1>
        <div className="flex items-center gap-2">
          <MainNav />
          <LanguageToggle />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
