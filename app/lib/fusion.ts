import fusions from "../data/fusions.json";

export const FUSION_MAX_ID = 251
export const FUSION_COUNT = fusions.length

const SPRITES_URL = 'https://bitbucket.org/infinitefusionsprites/customsprites/raw/main/CustomBattlers/'

export interface Fusion {
    head: number;
    body: number;
    author: string;
    sprite: string;
}

export function getFusion(index: number): Fusion {
    const [head, body, author] = fusions[index % FUSION_COUNT] as [number, number, string]
    return { head, body, author, sprite: `${SPRITES_URL}${head}.${body}.png` }
}
