import { STAT_NAMES, TYPE_NAMES, prettify, type Language } from "../i18n/translations";
import { getEvolutionStages } from "./evolution";
import type { PokemonProfile } from "./pokemonServer";
import { POKEMON_TYPES } from "./pokeapi";
import { attackMultiplier, getDefensiveMatchups, getOffensiveTargets } from "./typeChart";

export const REGIONS = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea']

const EGG_GROUPS_PT: Record<string, string> = {
    monster: 'Monstro', water1: 'Água 1', water2: 'Água 2', water3: 'Água 3', bug: 'Inseto', flying: 'Voador',
    ground: 'Campo', fairy: 'Fada', plant: 'Planta', humanshape: 'Humanoide', mineral: 'Mineral',
    indeterminate: 'Amorfo', ditto: 'Ditto', dragon: 'Dragão', 'no-eggs': 'Não pode procriar',
}

const GROWTH_PT: Record<string, string> = {
    slow: 'lento', medium: 'médio', fast: 'rápido', 'medium-slow': 'médio-lento',
    'slow-then-very-fast': 'errático', 'fast-then-very-slow': 'flutuante',
}

const GROWTH_EN: Record<string, string> = {
    'slow-then-very-fast': 'erratic', 'fast-then-very-slow': 'fluctuating',
}

export const typeLabel = (type: string, language: Language) => TYPE_NAMES[language][type] ?? prettify(type)
export const statLabel = (stat: string, language: Language) => STAT_NAMES[language][stat] ?? prettify(stat)
export const eggGroupLabel = (group: string, language: Language) =>
    language === 'pt' ? EGG_GROUPS_PT[group] ?? prettify(group) : prettify(group.replace(/(\d)$/, ' $1'))
export const growthLabel = (rate: string, language: Language) =>
    (language === 'pt' ? GROWTH_PT[rate] : GROWTH_EN[rate]) ?? prettify(rate).toLowerCase()

export function joinList(items: string[], language: Language) {
    if (items.length <= 1) return items.join('')
    const last = items.at(-1)
    return `${items.slice(0, -1).join(', ')} ${language === 'pt' ? 'e' : 'and'} ${last}`
}

const metres = (height: number, language: Language) => (height / 10).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: 1 })
const kilos = (weight: number, language: Language) => (weight / 10).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: 1 })

export const formatHeight = (height: number, language: Language) => `${metres(height, language)} m`
export const formatWeight = (weight: number, language: Language) => `${kilos(weight, language)} kg`

export const statTotal = (profile: PokemonProfile) => profile.stats.reduce((sum, { value }) => sum + value, 0)

export function genderSplit(genderRate: number) {
    if (genderRate < 0) return null
    const female = genderRate * 12.5
    return { female, male: 100 - female }
}

function identityParagraph(profile: PokemonProfile, language: Language) {
    const types = joinList(profile.types.map((type) => typeLabel(type, language)), language)
    const region = REGIONS[profile.generation - 1]
    const special = profile.mythical ? 'mythical' : profile.legendary ? 'legendary' : profile.baby ? 'baby' : null
    const height = formatHeight(profile.height, language)
    const weight = formatWeight(profile.weight, language)

    if (language === 'pt') {
        const kind = profile.types.length > 1 ? `dos tipos ${types}` : `do tipo ${types}`
        const extra = {
            mythical: ' É um Pokémon mítico, normalmente distribuído só em eventos especiais.',
            legendary: ' É um Pokémon lendário, com apenas um exemplar por jogo na maioria das gerações.',
            baby: ' É um Pokémon bebê, que só aparece chocando ovos.',
        }
        const size = profile.height <= 5 ? 'É um Pokémon pequeno' : profile.height >= 20 ? 'É um Pokémon de grande porte' : 'Tem porte médio'
        return [
            `${profile.name} é o Pokémon nº ${profile.id} da Pokédex Nacional, ${kind}. Foi apresentado na ${profile.generation}ª geração, na região de ${region}.` +
            (profile.genus ? ` A Pokédex em inglês o classifica como “${profile.genus}”.` : '') +
            (special ? extra[special] : ''),
            `${size}: mede ${height} e pesa ${weight}.`,
        ]
    }

    const kind = `${types}-type`
    const extra = {
        mythical: ' It is a Mythical Pokémon, usually distributed only through special events.',
        legendary: ' It is a Legendary Pokémon, with a single encounter per game in most generations.',
        baby: ' It is a Baby Pokémon, obtainable only by hatching eggs.',
    }
    const size = profile.height <= 5 ? 'It is a small Pokémon' : profile.height >= 20 ? 'It is a large Pokémon' : 'It is medium-sized'
    return [
        `${profile.name} is a ${kind} Pokémon, number ${profile.id} in the National Pokédex. It was introduced in Generation ${profile.generation}, in the ${region} region.` +
        (profile.genus ? ` The Pokédex classifies it as the “${profile.genus}”.` : '') +
        (special ? extra[special] : ''),
        `${size}: ${height} tall and ${weight} in weight.`,
    ]
}

function statsParagraph(profile: PokemonProfile, language: Language) {
    const total = statTotal(profile)
    const sorted = [...profile.stats].sort((a, b) => b.value - a.value)
    const best = sorted[0]
    const worst = sorted.at(-1)!
    const stat = (name: string) => profile.stats.find((entry) => entry.name === name)?.value ?? 0
    const physical = stat('attack')
    const special = stat('special-attack')
    const speed = stat('speed')
    const bulk = stat('hp') + stat('defense') + stat('special-defense')

    if (language === 'pt') {
        const tier = total < 300 ? 'um total baixo, comum em Pokémon de estágio inicial'
            : total < 450 ? 'um total intermediário'
            : total < 580 ? 'um total alto, de Pokémon totalmente evoluído'
            : 'um total de nível lendário'
        const role = physical - special >= 20 ? 'Tende a ser um atacante físico, já que o Ataque supera o Ataque Especial.'
            : special - physical >= 20 ? 'Tende a ser um atacante especial, já que o Ataque Especial supera o Ataque.'
            : 'Ataque e Ataque Especial são equilibrados, o que permite usar golpes físicos e especiais.'
        const pace = speed >= 100 ? ' Com Velocidade alta, costuma agir antes do adversário.'
            : speed <= 50 ? ' Por ser lento, tende a funcionar melhor em times que controlam a ordem dos turnos ou aguentam o primeiro golpe.'
            : ''
        const tank = bulk >= 300 ? ' A soma de PS, Defesa e Defesa Especial o torna resistente a golpes dos dois tipos.' : ''
        return `Os atributos base de ${profile.name} somam ${total}, ${tier}. O ponto mais forte é ${statLabel(best.name, language)} (${best.value}) e o mais fraco é ${statLabel(worst.name, language)} (${worst.value}). ${role}${pace}${tank}`
    }

    const tier = total < 300 ? 'a low total, common for first-stage Pokémon'
        : total < 450 ? 'a middling total'
        : total < 580 ? 'a high total, typical of fully evolved Pokémon'
        : 'a legendary-tier total'
    const role = physical - special >= 20 ? 'It leans towards physical attacks, since Attack outclasses Special Attack.'
        : special - physical >= 20 ? 'It leans towards special attacks, since Special Attack outclasses Attack.'
        : 'Attack and Special Attack are balanced, so it can run both physical and special moves.'
    const pace = speed >= 100 ? ' Its high Speed usually lets it move first.'
        : speed <= 50 ? ' Being slow, it works best on teams that control turn order or can take the first hit.'
        : ''
    const tank = bulk >= 300 ? ' Its combined HP, Defense and Special Defense make it sturdy against both kinds of attacks.' : ''
    return `${profile.name}'s base stats add up to ${total}, ${tier}. Its best stat is ${statLabel(best.name, language)} (${best.value}) and its weakest is ${statLabel(worst.name, language)} (${worst.value}). ${role}${pace}${tank}`
}

function matchupParagraph(profile: PokemonProfile, language: Language) {
    const matchups = getDefensiveMatchups(profile.types)
    const list = (types: string[]) => joinList(types.map((type) => typeLabel(type, language)), language)
    const attackers = [...matchups.quadruple, ...matchups.double]
    const strongAgainst = [...new Set(profile.types.flatMap((type) => getOffensiveTargets(type).strong))]
    const parts: string[] = []

    if (language === 'pt') {
        const ofType = (types: string[]) => `${types.length > 1 ? 'dos tipos' : 'do tipo'} ${list(types)}`
        if (matchups.quadruple.length) parts.push(`Leva dano quádruplo de golpes ${ofType(matchups.quadruple)}.`)
        if (matchups.double.length) parts.push(`Recebe dano dobrado de golpes ${ofType(matchups.double)}.`)
        if (matchups.half.length || matchups.quarter.length) parts.push(`Resiste a golpes ${ofType([...matchups.quarter, ...matchups.half])}.`)
        if (matchups.immune.length) parts.push(`É imune a golpes ${ofType(matchups.immune)}.`)
        if (attackers.length) parts.push(`Para enfrentá-lo, prefira Pokémon com golpes ${ofType(attackers.slice(0, 3))}.`)
        if (strongAgainst.length) parts.push(`Com golpes do próprio tipo (que recebem o bônus STAB de 50%), acerta em cheio Pokémon ${ofType(strongAgainst)}.`)
        return `Em batalha: ${parts.join(' ')}`
    }

    if (matchups.quadruple.length) parts.push(`It takes quadruple damage from ${list(matchups.quadruple)} moves.`)
    if (matchups.double.length) parts.push(`It takes double damage from ${list(matchups.double)} moves.`)
    if (matchups.half.length || matchups.quarter.length) parts.push(`It resists ${list([...matchups.quarter, ...matchups.half])} moves.`)
    if (matchups.immune.length) parts.push(`It is immune to ${list(matchups.immune)} moves.`)
    if (attackers.length) parts.push(`To beat it, bring Pokémon with ${list(attackers.slice(0, 3))} moves.`)
    if (strongAgainst.length) parts.push(`With same-type moves (which get the 50% STAB bonus), it hits ${list(strongAgainst)} Pokémon super effectively.`)
    return `In battle: ${parts.join(' ')}`
}

function evolutionParagraph(profile: PokemonProfile, language: Language) {
    const stages = getEvolutionStages(profile.chain)
    const names = stages.map((stage) => stage.map(({ species }) => prettify(species.name)))
    const stageIndex = stages.findIndex((stage) => stage.some(({ species }) => species.name === profile.slug))
    const total = names.flat().length
    const line = names.map((stage) => stage.join(' / ')).join(' → ')

    if (language === 'pt') {
        if (total === 1) return `${profile.name} não evolui e não faz parte de nenhuma linha evolutiva.`
        const branch = stages.some((stage) => stage.length > 1) ? ' A linha tem ramificações, então a evolução escolhida depende do método usado.' : ''
        const final = stageIndex === stages.length - 1 ? ' É a forma final da linha.' : ''
        return `${profile.name} é o estágio ${stageIndex + 1} de ${stages.length} de uma linha evolutiva com ${total} Pokémon: ${line}.${branch}${final}`
    }
    if (total === 1) return `${profile.name} does not evolve and is not part of any evolutionary line.`
    const branch = stages.some((stage) => stage.length > 1) ? ' The line branches, so the evolution you get depends on the method used.' : ''
    const final = stageIndex === stages.length - 1 ? ' It is the final form of the line.' : ''
    return `${profile.name} is stage ${stageIndex + 1} of ${stages.length} in an evolutionary line of ${total} Pokémon: ${line}.${branch}${final}`
}

function trainingParagraph(profile: PokemonProfile, language: Language) {
    const abilities = profile.abilities.filter(({ hidden }) => !hidden).map(({ name }) => prettify(name))
    const hidden = profile.abilities.find(({ hidden }) => hidden)
    const gender = genderSplit(profile.genderRate)
    const groups = joinList(profile.eggGroups.map((group) => eggGroupLabel(group, language)), language)
    const capture = profile.captureRate <= 3 ? 'veryHard' : profile.captureRate <= 45 ? 'hard' : profile.captureRate >= 190 ? 'easy' : 'medium'

    if (language === 'pt') {
        const captureText = { veryHard: 'quase impossível de capturar sem uma Master Ball', hard: 'difícil de capturar', medium: 'de captura moderada', easy: 'fácil de capturar' }[capture]
        const sentences = [
            `Pode ter a${abilities.length > 1 ? 's habilidades' : ' habilidade'} ${joinList(abilities, language)}${hidden ? `, além da habilidade oculta ${prettify(hidden.name)}` : ''}.`,
            `Ao longo dos jogos, pode aprender ${profile.moveCount} golpes diferentes.`,
            `A taxa de captura é ${profile.captureRate} (de 255), o que o torna ${captureText}.`,
            gender ? `Na natureza, ${gender.male.toLocaleString('pt-BR')}% são machos e ${gender.female.toLocaleString('pt-BR')}% são fêmeas.` : 'Não tem gênero.',
            profile.eggGroups.length ? `Grupo de ovos: ${groups}.` : '',
            profile.growthRate ? `O crescimento de nível é ${growthLabel(profile.growthRate, language)}.` : '',
        ]
        return sentences.filter(Boolean).join(' ')
    }

    const captureText = { veryHard: 'nearly impossible to catch without a Master Ball', hard: 'hard to catch', medium: 'moderately easy to catch', easy: 'easy to catch' }[capture]
    const sentences = [
        `It can have the abilit${abilities.length > 1 ? 'ies' : 'y'} ${joinList(abilities, language)}${hidden ? `, plus the hidden ability ${prettify(hidden.name)}` : ''}.`,
        `Across the games, it can learn ${profile.moveCount} different moves.`,
        `Its catch rate is ${profile.captureRate} (out of 255), which makes it ${captureText}.`,
        gender ? `In the wild, ${gender.male}% are male and ${gender.female}% are female.` : 'It is genderless.',
        profile.eggGroups.length ? `Egg group: ${groups}.` : '',
        profile.growthRate ? `It has a ${growthLabel(profile.growthRate, language)} growth rate.` : '',
    ]
    return sentences.filter(Boolean).join(' ')
}

function teamParagraph(profile: PokemonProfile, language: Language) {
    const matchups = getDefensiveMatchups(profile.types)
    const threats = [...matchups.quadruple, ...matchups.double]
    const list = (types: string[]) => joinList(types.map((type) => typeLabel(type, language)), language)
    const partners = POKEMON_TYPES
        .map((type) => ({ type, covered: threats.filter((threat) => attackMultiplier(threat, type) <= 0.5) }))
        .filter(({ covered }) => covered.length > 0)
        .sort((a, b) => b.covered.length - a.covered.length)
        .slice(0, 3)
    const walls = POKEMON_TYPES.filter((defender) => profile.types.every((type) => attackMultiplier(type, defender) <= 0.5))
    const pt = language === 'pt'
    const sentences: string[] = []

    if (partners.length) {
        const covered = [...new Set(partners.flatMap(({ covered }) => covered))]
        sentences.push(pt
            ? `Para montar uma equipe com ${profile.name}, vale levar parceiros que cubram as fraquezas dele: Pokémon ${partners.length > 1 ? 'dos tipos' : 'do tipo'} ${list(partners.map(({ type }) => type))} resistem a golpes ${covered.length > 1 ? 'dos tipos' : 'do tipo'} ${list(covered)}, e podem entrar em campo quando o adversário tentar explorar essa fraqueza.`
            : `When building a team around ${profile.name}, bring partners that cover its weaknesses: ${list(partners.map(({ type }) => type))} Pokémon resist ${list(covered)} moves and can switch in when the opponent tries to exploit that weakness.`)
    } else {
        sentences.push(pt
            ? `${profile.name} não tem fraquezas de tipo, o que o torna uma peça fácil de encaixar em quase qualquer equipe.`
            : `${profile.name} has no type weaknesses, which makes it easy to fit into almost any team.`)
    }

    if (walls.length) {
        sentences.push(pt
            ? `Por outro lado, Pokémon ${walls.length > 1 ? 'dos tipos' : 'do tipo'} ${list(walls)} resistem aos golpes do próprio tipo de ${profile.name}, então ele precisa de golpes de outros tipos ou de um colega de equipe que dê conta desses adversários.`
            : `On the other hand, ${list(walls)} Pokémon resist ${profile.name}'s same-type moves, so it needs coverage moves or a teammate that can handle those opponents.`)
    }

    return sentences.join(' ')
}

export interface PokemonText {
    identity: string[];
    stats: string;
    matchups: string;
    team: string;
    evolution: string;
    training: string;
}

export function describePokemon(profile: PokemonProfile, language: Language): PokemonText {
    return {
        identity: identityParagraph(profile, language),
        stats: statsParagraph(profile, language),
        matchups: matchupParagraph(profile, language),
        team: teamParagraph(profile, language),
        evolution: evolutionParagraph(profile, language),
        training: trainingParagraph(profile, language),
    }
}

export function pokemonMetaDescription(profile: PokemonProfile) {
    const types = joinList(profile.types.map((type) => typeLabel(type, 'pt')), 'pt')
    const weak = getDefensiveMatchups(profile.types)
    const weaknesses = [...weak.quadruple, ...weak.double].map((type) => typeLabel(type, 'pt'))
    return `${profile.name} (nº ${profile.id}), Pokémon do tipo ${types} da ${profile.generation}ª geração: atributos base (total ${statTotal(profile)}), fraquezas${weaknesses.length ? ` (${joinList(weaknesses, 'pt')})` : ''}, evoluções, habilidades e dicas de batalha.`
}
