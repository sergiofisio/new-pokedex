import { writeFileSync } from 'node:fs'

const API_URL = 'https://pokeapi.co/api/v2/'

const GYMS = [
    ['kanto', 1, 'Pewter', 'Brock', 'rock', 'Boulder', [74, 95]],
    ['kanto', 1, 'Cerulean', 'Misty', 'water', 'Cascade', [120, 121]],
    ['kanto', 1, 'Vermilion', 'Lt. Surge', 'electric', 'Thunder', [100, 25, 26]],
    ['kanto', 1, 'Celadon', 'Erika', 'grass', 'Rainbow', [71, 114, 45]],
    ['kanto', 1, 'Fuchsia', 'Koga', 'poison', 'Soul', [109, 89, 110]],
    ['kanto', 1, 'Saffron', 'Sabrina', 'psychic', 'Marsh', [64, 122, 49, 65]],
    ['kanto', 1, 'Cinnabar', 'Blaine', 'fire', 'Volcano', [58, 77, 78, 59]],
    ['kanto', 1, 'Viridian', 'Giovanni', 'ground', 'Earth', [111, 51, 31, 34, 112]],
    ['johto', 2, 'Violet', 'Falkner', 'flying', 'Zephyr', [16, 17]],
    ['johto', 2, 'Azalea', 'Bugsy', 'bug', 'Hive', [11, 14, 123]],
    ['johto', 2, 'Goldenrod', 'Whitney', 'normal', 'Plain', [35, 241]],
    ['johto', 2, 'Ecruteak', 'Morty', 'ghost', 'Fog', [92, 93, 94]],
    ['johto', 2, 'Cianwood', 'Chuck', 'fighting', 'Storm', [57, 62]],
    ['johto', 2, 'Olivine', 'Jasmine', 'steel', 'Mineral', [81, 208]],
    ['johto', 2, 'Mahogany', 'Pryce', 'ice', 'Glacier', [86, 87, 221]],
    ['johto', 2, 'Blackthorn', 'Clair', 'dragon', 'Rising', [148, 230]],
    ['hoenn', 3, 'Rustboro', 'Roxanne', 'rock', 'Stone', [74, 299]],
    ['hoenn', 3, 'Dewford', 'Brawly', 'fighting', 'Knuckle', [66, 296]],
    ['hoenn', 3, 'Mauville', 'Wattson', 'electric', 'Dynamo', [81, 100, 82]],
    ['hoenn', 3, 'Lavaridge', 'Flannery', 'fire', 'Heat', [218, 324]],
    ['hoenn', 3, 'Petalburg', 'Norman', 'normal', 'Balance', [289, 288]],
    ['hoenn', 3, 'Fortree', 'Winona', 'flying', 'Feather', [277, 279, 227, 334]],
    ['hoenn', 3, 'Mossdeep', 'Tate & Liza', 'psychic', 'Mind', [337, 338]],
    ['hoenn', 3, 'Sootopolis', 'Wallace', 'water', 'Rain', [370, 340, 364, 119, 350]],
    ['sinnoh', 4, 'Oreburgh', 'Roark', 'rock', 'Coal', [74, 95, 408]],
    ['sinnoh', 4, 'Eterna', 'Gardenia', 'grass', 'Forest', [420, 387, 407]],
    ['sinnoh', 4, 'Veilstone', 'Maylene', 'fighting', 'Cobble', [307, 67, 448]],
    ['sinnoh', 4, 'Pastoria', 'Crasher Wake', 'water', 'Fen', [130, 195, 419]],
    ['sinnoh', 4, 'Hearthome', 'Fantina', 'ghost', 'Relic', [426, 94, 429]],
    ['sinnoh', 4, 'Canalave', 'Byron', 'steel', 'Mine', [436, 208, 411]],
    ['sinnoh', 4, 'Snowpoint', 'Candice', 'ice', 'Icicle', [215, 221, 460, 478]],
    ['sinnoh', 4, 'Sunyshore', 'Volkner', 'electric', 'Beacon', [26, 424, 224, 405]],
    ['unova', 5, 'Striaton', 'Cilan', 'grass', 'Trio', [506, 511]],
    ['unova', 5, 'Nacrene', 'Lenora', 'normal', 'Basic', [507, 505]],
    ['unova', 5, 'Castelia', 'Burgh', 'bug', 'Insect', [544, 557, 542]],
    ['unova', 5, 'Nimbasa', 'Elesa', 'electric', 'Bolt', [587, 523]],
    ['unova', 5, 'Driftveil', 'Clay', 'ground', 'Quake', [552, 536, 530]],
    ['unova', 5, 'Mistralton', 'Skyla', 'flying', 'Jet', [528, 521, 581]],
    ['unova', 5, 'Icirrus', 'Brycen', 'ice', 'Freeze', [583, 615, 614]],
    ['unova', 5, 'Opelucid', 'Drayden', 'dragon', 'Legend', [611, 621, 612]],
    ['kalos', 6, 'Santalune', 'Viola', 'bug', 'Bug', [283, 666]],
    ['kalos', 6, 'Cyllage', 'Grant', 'rock', 'Cliff', [698, 696]],
    ['kalos', 6, 'Shalour', 'Korrina', 'fighting', 'Rumble', [619, 67, 701]],
    ['kalos', 6, 'Coumarine', 'Ramos', 'grass', 'Plant', [189, 70, 673]],
    ['kalos', 6, 'Lumiose', 'Clemont', 'electric', 'Voltage', [587, 82, 695]],
    ['kalos', 6, 'Laverre', 'Valerie', 'fairy', 'Fairy', [303, 122, 700]],
    ['kalos', 6, 'Anistar', 'Olympia', 'psychic', 'Psychic', [561, 199, 678]],
    ['kalos', 6, 'Snowbelle', 'Wulfric', 'ice', 'Iceberg', [460, 615, 713]],
    ['galar', 8, 'Turffield', 'Milo', 'grass', 'Grass', [829, 830]],
    ['galar', 8, 'Hulbury', 'Nessa', 'water', 'Water', [118, 846, 834]],
    ['galar', 8, 'Motostoke', 'Kabu', 'fire', 'Fire', [38, 59, 851]],
    ['galar', 8, 'Stow-on-Side', 'Bea', 'fighting', 'Fighting', [237, 675, 865, 68]],
    ['galar', 8, 'Ballonlea', 'Opal', 'fairy', 'Fairy', [110, 303, 468, 869]],
    ['galar', 8, 'Circhester', 'Gordie', 'rock', 'Rock', [689, 213, 874, 839]],
    ['galar', 8, 'Spikemuth', 'Piers', 'dark', 'Dark', [560, 687, 435, 862]],
    ['galar', 8, 'Hammerlocke', 'Raihan', 'dragon', 'Dragon', [330, 526, 844, 884]],
    ['paldea', 9, 'Cortondo', 'Katy', 'bug', 'Bug', [919, 917, 216]],
    ['paldea', 9, 'Artazon', 'Brassius', 'grass', 'Grass', [548, 928, 185]],
    ['paldea', 9, 'Levincia', 'Iono', 'electric', 'Electric', [940, 939, 404, 429]],
    ['paldea', 9, 'Cascarrafa', 'Kofu', 'water', 'Water', [976, 961, 740]],
    ['paldea', 9, 'Medali', 'Larry', 'normal', 'Normal', [775, 982, 398]],
    ['paldea', 9, 'Montenevera', 'Ryme', 'ghost', 'Ghost', [354, 778, 972, 849]],
    ['paldea', 9, 'Alfornada', 'Tulip', 'psychic', 'Psychic', [981, 282, 956, 671]],
    ['paldea', 9, 'Glaseado', 'Grusha', 'ice', 'Ice', [873, 614, 975, 334]],
]

const GENERATION_RANGES = { 1: [1, 151], 2: [152, 251], 3: [252, 386], 4: [387, 493], 5: [494, 649], 6: [650, 721], 8: [810, 905], 9: [906, 1025] }
const EXTRA = 6

function hash(text) {
    let value = 0x811c9dc5
    for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 0x01000193) >>> 0
    return value
}

const seededSort = (items, seed) => [...items].sort((a, b) => hash(`${seed}:${a}`) - hash(`${seed}:${b}`))

const pokemon = new Map()
async function getPokemon(id) {
    if (!pokemon.has(id)) {
        const data = await (await fetch(`${API_URL}pokemon/${id}/`)).json()
        pokemon.set(id, { name: data.name, types: data.types.sort((a, b) => a.slot - b.slot).map(({ type }) => type.name) })
    }
    return pokemon.get(id)
}

const typeMembers = new Map()
async function getTypeMembers(type) {
    if (!typeMembers.has(type)) {
        const data = await (await fetch(`${API_URL}type/${type}/`)).json()
        typeMembers.set(type, data.pokemon.map(({ pokemon }) => Number(pokemon.url.split('/').filter(Boolean).at(-1))))
    }
    return typeMembers.get(type)
}

const withTypes = async (list) => Promise.all(list.map(async (id) => ({ id, types: (await getPokemon(id)).types })))

const gyms = []
for (const [index, [region, generation, city, leader, type, badge, team]] of GYMS.entries()) {
    const [first, last] = GENERATION_RANGES[generation]
    const inGeneration = (id) => id >= first && id <= last
    const allOnType = (await getTypeMembers(type)).filter((id) => id <= last && !team.includes(id))
    const onType = new Set(allOnType.filter(inGeneration))
    const fillers = [
        ...seededSort([...onType], `fill:${leader}`),
        ...seededSort(allOnType.filter((id) => !onType.has(id)), `fill-old:${leader}`),
    ].slice(0, EXTRA)

    const outsiders = []
    for (const id of seededSort(Array.from({ length: last - first + 1 }, (_, offset) => first + offset), `out:${leader}`)) {
        if (outsiders.length === EXTRA) break
        if (!onType.has(id) && !(await getPokemon(id)).types.includes(type)) outsiders.push(id)
    }

    gyms.push({
        id: index,
        region,
        generation,
        city,
        leader,
        type,
        badge,
        team: await withTypes(team),
        fillers: await withTypes(fillers),
        outsiders: await withTypes(outsiders),
    })
}

writeFileSync(new URL('../app/data/gyms.json', import.meta.url), JSON.stringify(gyms))

for (const gym of gyms) {
    const members = gym.team.map(({ id, types }) => `${pokemon.get(id).name}${types.includes(gym.type) ? '' : '*'}`)
    console.log(`${gym.leader} (${gym.type}): ${members.join(', ')}`)
}
console.log(`\n${gyms.length} ginásios gravados. * = fora do tipo do ginásio`)
