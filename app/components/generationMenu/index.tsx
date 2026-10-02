'use client'

import { useId, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";

const COMMONS_FILE_URL = 'https://commons.wikimedia.org/wiki/File:'

export const GENERATIONS = [
  {
    id: 1, label: 'I', region: 'Kanto',
    background: { src: '/regions/kanto.webp', author: 'Romain Guy', license: 'CC0', file: 'Mount_Fuji_at_sunset,_March_2025.jpg' },
  },
  {
    id: 2, label: 'II', region: 'Johto',
    background: { src: '/regions/johto.webp', author: 'Basile Morin', license: 'CC BY-SA 4.0', file: 'Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day,_Kyoto,_Japan.jpg' },
  },
  {
    id: 3, label: 'III', region: 'Hoenn',
    background: { src: '/regions/hoenn.webp', author: 'Jakub Hałun', license: 'CC BY-SA 4.0', file: 'Sakurajima_coast_20100721_4141.jpg' },
  },
  {
    id: 4, label: 'IV', region: 'Sinnoh',
    background: { src: '/regions/sinnoh.webp', author: 'OKJaguar', license: 'CC BY-SA 4.0', file: 'Shirahige_Falls,_Biei_River,_Hokkaido,_Japan.jpg' },
  },
  {
    id: 5, label: 'V', region: 'Unova',
    background: { src: '/regions/unova.webp', author: 'King of Hearts', license: 'CC BY-SA 3.0', file: 'Lower_Manhattan_from_Jersey_City_November_2014_panorama_2.jpg' },
  },
  {
    id: 6, label: 'VI', region: 'Kalos',
    background: { src: '/regions/kalos.webp', author: 'Jorge Royan', license: 'CC BY-SA 3.0', file: 'Paris_-_The_Eiffel_Tower_in_spring_-_2307.jpg' },
  },
  {
    id: 7, label: 'VII', region: 'Alola',
    background: { src: '/regions/alola.webp', author: 'Frank Schulenburg', license: 'CC BY-SA 4.0', file: 'Waikiki_Beach_(2024)-L1004709.jpg' },
  },
  {
    id: 8, label: 'VIII', region: 'Galar',
    background: { src: '/regions/galar.webp', author: 'Michal Klajban', license: 'CC BY-SA 4.0', file: 'A_small_loch_in_the_saddle_between_Beinn_an_Dothaidh_and_Beinn_Dorain,_Scotland_01.jpg' },
  },
  {
    id: 9, label: 'IX', region: 'Paldea',
    background: { src: '/regions/paldea.webp', author: 'Trougnouf (Benoit Brummer)', license: 'CC BY 4.0', file: 'The_village_of_Pampaneira_viewed_from_Plaza_Vieja_in_Capileira_(DSCF5824).jpg' },
  },
]

export const getBackgroundSourceUrl = (file: string) => `${COMMONS_FILE_URL}${encodeURIComponent(file)}`

interface GenerationMenuProps {
  selected: number;
  onSelect: (generation: number) => void;
}

const SMOOTH = 'motion-safe:duration-500 motion-safe:ease-in-out'

export default function GenerationMenu({ selected, onSelect }: GenerationMenuProps) {
  const { t } = useLanguage()
  const [collapsed, setCollapsed] = useState(false)
  const listId = useId()
  const toggleLabel = t(collapsed ? 'expandMenu' : 'collapseMenu')

  return (
    <nav
      aria-label={t('generations')}
      className={`flex shrink-0 flex-col bg-red-600 p-4 text-white shadow-xl dark:bg-red-800 lg:sticky lg:top-0 lg:h-dvh lg:self-start lg:overflow-x-hidden lg:overflow-y-auto lg:rounded-r-3xl motion-safe:transition-[width] ${SMOOTH} ${collapsed ? 'lg:w-[6.5rem]' : 'lg:w-60'}`}
    >
      <div aria-hidden="true" className="mb-3 flex items-start gap-2">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className="size-12 shrink-0 rounded-full border-4 border-white bg-sky-400 shadow-inner shadow-sky-900"
        />
        {['bg-red-400', 'bg-yellow-300', 'bg-green-400'].map((color, index) => (
          <motion.span
            key={color}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: collapsed ? 0 : 1, y: 0 }}
            transition={{ delay: collapsed ? 0 : 0.1 + index * 0.08 }}
            className={`size-3 shrink-0 rounded-full border border-black/30 ${color}`}
          />
        ))}
      </div>

      <motion.button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
        aria-controls={listId}
        aria-label={toggleLabel}
        title={toggleLabel}
        whileTap={{ scale: 0.95 }}
        className="mb-3 flex w-full items-center justify-center overflow-hidden whitespace-nowrap rounded-lg border-2 border-red-950 bg-red-800 py-1.5 text-xs font-black uppercase shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3)] hover:bg-red-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <motion.span aria-hidden="true" animate={{ rotate: collapsed ? 180 : 0 }} className="hidden lg:block">◀</motion.span>
        <motion.span aria-hidden="true" animate={{ rotate: collapsed ? -90 : 90 }} className="lg:hidden">◀</motion.span>
        <span
          aria-hidden="true"
          className={`overflow-hidden motion-safe:transition-[max-width,opacity,padding] ${SMOOTH} ${collapsed ? 'pl-2 lg:max-w-0 lg:pl-0 lg:opacity-0' : 'max-w-24 pl-2'}`}
        >
          {t(collapsed ? 'menuExpand' : 'menuCollapse')}
        </span>
      </motion.button>

      <div
        className={`grid motion-safe:transition-[grid-template-rows,opacity,visibility] ${SMOOTH} lg:block ${collapsed ? 'max-lg:invisible max-lg:grid-rows-[0fr] max-lg:opacity-0' : 'grid-rows-[1fr]'}`}
      >
        <ul id={listId} className="flex min-h-0 gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {GENERATIONS.map((generation, index) => {
            const isSelected = generation.id === selected
            const fullName = `GEN ${generation.label} · ${generation.region}`
            return (
              <motion.li
                key={generation.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                className="shrink-0"
              >
                <motion.button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(generation.id)}
                  aria-label={collapsed ? fullName : undefined}
                  title={collapsed ? fullName : undefined}
                  whileHover={collapsed ? { scale: 1.05 } : { x: 4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex w-full items-center overflow-hidden whitespace-nowrap rounded-lg border-2 border-zinc-900 bg-zinc-900 px-3 py-2 font-mono transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isSelected ? 'text-zinc-900' : 'text-green-300 hover:bg-zinc-800'
                  }`}
                >
                  {isSelected && (
                    <motion.span layoutId="generation-indicator" className="absolute inset-0 bg-green-300" />
                  )}
                  <span className={`relative text-center font-bold motion-safe:transition-[flex-grow] ${SMOOTH} ${collapsed ? 'lg:grow' : 'grow-0'}`}>
                    <span className={`inline-block overflow-hidden align-bottom motion-safe:transition-[max-width,opacity] ${SMOOTH} ${collapsed ? 'lg:max-w-0 lg:opacity-0' : 'max-w-12'}`}>
                      GEN&nbsp;
                    </span>
                    {generation.label}
                  </span>
                  <span
                    className={`relative ml-auto overflow-hidden text-xs uppercase motion-safe:transition-[max-width,opacity,margin,padding] ${SMOOTH} ${collapsed ? 'lg:ml-0 lg:max-w-0 lg:opacity-0' : 'max-w-24 pl-3'}`}
                  >
                    {generation.region}
                  </span>
                </motion.button>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
