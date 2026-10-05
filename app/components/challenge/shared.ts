import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchAllSpecies, fetchChallengeData, getSpeciesId } from "../../lib/pokeapi";
import { prettify } from "../../i18n/translations";

const loadAllSpecies = () => fetchAllSpecies()
const loadChallengeData = (key: string) => fetchChallengeData(Number(key))

export const useSpeciesList = () => useAsyncData('all-species', loadAllSpecies)

export const useChallengeData = (id: number) => useAsyncData(String(id), loadChallengeData)

export function useSpeciesName() {
    const species = useSpeciesList()
    return (id: number) => {
        const found = species?.status === 'success'
            ? species.data.find(({ url }) => getSpeciesId(url) === id)
            : undefined
        return found ? prettify(found.name) : `#${id}`
    }
}

export const CARD = 'rounded-3xl bg-white/90 shadow-xl backdrop-blur-sm dark:bg-zinc-900/90'
