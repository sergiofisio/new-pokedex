import ThemeToggle from "../themeToggle";
import LanguageToggle from "../languageToggle";
import Pokeball from "../pokeball";

export default function Header() {
  return (
    <header className="w-full border-b-4 border-red-900 bg-red-600 px-4 text-white shadow-md dark:bg-red-800">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-black tracking-tight">
          <Pokeball />
          Pokédex
        </h1>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
