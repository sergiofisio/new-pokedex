'use client'
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { usePokedex } from "../../context/pokedexContext";
import { useLanguage } from "../../context/languageContext";
import { getSpeciesId, type Species } from "../../lib/pokeapi";
import { getMainSprite } from "../../lib/sprites";
import { TYPE_COLORS } from "../../lib/typeColors";

interface PokemonCardProps {
    pokemon: Species;
    onSelect: (speciesId: number) => void;
    eager?: boolean;
}

export default function PokemonCard({ pokemon, onSelect, eager = false }: PokemonCardProps) {
    const { pokemon: pokemonCache, loadPokemon } = usePokedex()
    const { t, typeName } = useLanguage()
    const speciesId = getSpeciesId(pokemon.url)
    const pokemonData = pokemonCache[speciesId]

    useEffect(()=>{
        if (!pokemonData) loadPokemon(speciesId)
    },[pokemonData, speciesId, loadPokemon])

    if (!pokemonData) {
    return <div aria-hidden="true" className="h-full min-h-56 w-full rounded-2xl bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800" />
  }

    const mainType = pokemonData.types[0]?.type.name ?? ''
    const mainSprite = getMainSprite(pokemonData)
    const colors = TYPE_COLORS[mainType]

  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { y: 0, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.15)' },
        hover: { y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' },
        tap: { y: -2, scale: 0.97 },
      }}
      className={`${colors?.card ?? ''} ${colors?.text ?? ''} relative flex h-full w-full flex-col gap-2 rounded-2xl p-3 ring-1 ring-black/10 focus-within:ring-4 focus-within:ring-red-500`}
    >
      <span className="absolute right-3 top-3 z-10 rounded-full bg-black/25 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
        #{String(speciesId).padStart(4, '0')}
      </span>
      {mainSprite && (
        <div className="w-full aspect-square overflow-hidden rounded-xl bg-white/40">
          <motion.div
            variants={{ rest: { scale: 1, rotate: 0 }, hover: { scale: 1.12, rotate: -4 } }}
            className="size-full"
          >
            <Image
              src={mainSprite}
              alt={t('illustrationOf', { name: pokemonData.name })}
              width={100}
              height={100}
              className="w-full aspect-square object-contain drop-shadow-xl drop-shadow-black/50"
              loading={eager ? 'eager' : 'lazy'}
            />
          </motion.div>
        </div>
      )}
      <h2 className="truncate text-center text-base font-black uppercase" title={pokemonData.name}>
        <button
          type="button"
          onClick={() => onSelect(speciesId)}
          className="uppercase cursor-pointer focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
        >
          {pokemonData.name}
        </button>
      </h2>

      <ul aria-label={t('types')} className="mt-auto flex flex-wrap justify-center gap-1.5">
      {pokemonData.types.map(({type})=>(
        <li
          key={type.name}
          className={`${TYPE_COLORS[type.name]?.card ?? ''} ${TYPE_COLORS[type.name]?.text ?? ''} rounded-full border border-white/60 px-2.5 py-0.5 text-[10px] font-black uppercase shadow-sm`}
        >
            {typeName(type.name)}
        </li>
      ))}
      </ul>
    </motion.article>
  );
}
