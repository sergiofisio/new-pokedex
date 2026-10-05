import gyms from "../data/gyms.json";
import { seededFraction, seededShuffle } from "./seed";

interface GymMember {
    id: number;
    types: string[];
}

export interface Gym {
    id: number;
    region: string;
    generation: number;
    city: string;
    leader: string;
    type: string;
    badge: string;
    team: GymMember[];
    fillers: GymMember[];
    outsiders: GymMember[];
}

export interface GymRound {
    gym: Gym;
    options: number[];
    intruder: number;
    types: Record<number, string[]>;
}

const GYMS = gyms as Gym[]
const MEMBERS = 4

export const GYM_COUNT = GYMS.length

export function buildGymRound(index: number): GymRound {
    const gym = GYMS[index % GYM_COUNT]
    const members = gym.team.filter(({ types }) => types.includes(gym.type))
    const chosen = [...members, ...gym.fillers].slice(0, MEMBERS)
    const intruder = gym.outsiders[Math.floor(seededFraction(`gym-intruder:${gym.id}`) * gym.outsiders.length)]

    return {
        gym,
        options: seededShuffle([...chosen, intruder].map(({ id }) => id), `gym-order:${gym.id}`),
        intruder: intruder.id,
        types: Object.fromEntries([...chosen, intruder].map(({ id, types }) => [id, types])),
    }
}
