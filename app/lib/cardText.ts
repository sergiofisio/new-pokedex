import type { Language } from "../i18n/translations";
import { CRAFT_COST, DISENCHANT_VALUE, HS_RARITIES, craftCost, hsLabel, isFreeSet, maxCopies, setName, stripCardText, type HsCard, type HsSet } from "./hearthstone";

const MECHANICS: Record<string, { pt: [string, string]; en: [string, string] }> = {
    BATTLECRY: { pt: ['Grito de Guerra', 'Efeito que acontece quando a carta é jogada da mão.'], en: ['Battlecry', 'An effect that happens when the card is played from your hand.'] },
    DEATHRATTLE: { pt: ['Último Suspiro', 'Efeito que acontece quando o lacaio morre.'], en: ['Deathrattle', 'An effect that happens when the minion dies.'] },
    TAUNT: { pt: ['Provocar', 'Inimigos precisam atacar este lacaio antes de atingir outros alvos.'], en: ['Taunt', 'Enemies must attack this minion before hitting other targets.'] },
    DISCOVER: { pt: ['Descobrir', 'Escolha uma entre três cartas para colocar na mão.'], en: ['Discover', 'Choose one of three cards to add to your hand.'] },
    RUSH: { pt: ['Investida', 'Pode atacar lacaios no turno em que é jogado.'], en: ['Rush', 'Can attack minions on the turn it is played.'] },
    CHARGE: { pt: ['Ataque Furioso', 'Pode atacar qualquer alvo no turno em que é jogado.'], en: ['Charge', 'Can attack any target on the turn it is played.'] },
    LIFESTEAL: { pt: ['Roubar Vida', 'O dano causado também cura o seu herói.'], en: ['Lifesteal', 'Damage dealt also heals your hero.'] },
    DIVINE_SHIELD: { pt: ['Escudo Divino', 'Ignora a primeira instância de dano recebida.'], en: ['Divine Shield', 'The first time it takes damage, ignore it.'] },
    SECRET: { pt: ['Segredo', 'Fica oculto e é revelado quando a condição acontece no turno do oponente.'], en: ['Secret', 'Stays hidden until its condition happens on your opponent’s turn.'] },
    CHOOSE_ONE: { pt: ['Escolha Um', 'Escolha um entre dois efeitos ao jogar a carta.'], en: ['Choose One', 'Pick one of two effects when you play the card.'] },
    STEALTH: { pt: ['Furtividade', 'Não pode ser alvo de ataques nem de efeitos até atacar.'], en: ['Stealth', 'Can’t be attacked or targeted until it attacks.'] },
    COMBO: { pt: ['Combo', 'Bônus se você já tiver jogado outra carta no mesmo turno.'], en: ['Combo', 'A bonus if you already played another card this turn.'] },
    OVERLOAD: { pt: ['Sobrecarga', 'Trava parte da sua mana no próximo turno.'], en: ['Overload', 'Locks some of your mana next turn.'] },
    TRADEABLE: { pt: ['Negociável', 'Pode ser devolvida ao deck por 1 de mana para comprar outra carta.'], en: ['Tradeable', 'Can be shuffled back into your deck for 1 mana to draw another card.'] },
    SPELLPOWER: { pt: ['Dano Mágico', 'Aumenta o dano dos seus feitiços.'], en: ['Spell Damage', 'Increases the damage of your spells.'] },
    SPELLBURST: { pt: ['Surto Mágico', 'Ativa uma vez depois que você lança um feitiço.'], en: ['Spellburst', 'Triggers once after you cast a spell.'] },
    ELUSIVE: { pt: ['Evasivo', 'Não pode ser alvo de feitiços nem de Poderes Heroicos.'], en: ['Elusive', 'Can’t be targeted by spells or Hero Powers.'] },
    REBORN: { pt: ['Renascer', 'Volta à vida com 1 de Vida na primeira vez que morre.'], en: ['Reborn', 'Returns to life with 1 Health the first time it dies.'] },
    OUTCAST: { pt: ['Pária', 'Bônus se a carta estiver na ponta esquerda ou direita da mão.'], en: ['Outcast', 'A bonus if the card is the leftmost or rightmost in your hand.'] },
    CORRUPT: { pt: ['Corromper', 'Melhora se você jogar uma carta de custo maior com ela na mão.'], en: ['Corrupt', 'Upgrades when you play a higher-cost card while holding it.'] },
    QUEST: { pt: ['Missão', 'Começa na mão inicial e dá uma recompensa ao completar o objetivo.'], en: ['Quest', 'Starts in your opening hand and grants a reward once completed.'] },
    WINDFURY: { pt: ['Fúria dos Ventos', 'Pode atacar duas vezes por turno.'], en: ['Windfury', 'Can attack twice each turn.'] },
    INFUSE: { pt: ['Infundir', 'Melhora depois que lacaios aliados morrem com a carta na mão.'], en: ['Infuse', 'Upgrades after friendly minions die while it is in your hand.'] },
    POISONOUS: { pt: ['Venenoso', 'Destrói qualquer lacaio que receber dano dele.'], en: ['Poisonous', 'Destroys any minion damaged by it.'] },
    COLOSSAL: { pt: ['Colossal', 'Entra em campo junto com apêndices extras.'], en: ['Colossal', 'Summons extra appendages alongside it.'] },
    HONORABLE_KILL: { pt: ['Morte Honrosa', 'Bônus ao matar um lacaio causando dano exatamente igual à Vida dele.'], en: ['Honorable Kill', 'A bonus when it kills a minion by dealing exactly lethal damage.'] },
    MAGNETIC: { pt: ['Magnético', 'Pode ser jogado à esquerda de um Mecanoide para se fundir a ele.'], en: ['Magnetic', 'Can be played to the left of a Mech to merge with it.'] },
    DREDGE: { pt: ['Dragar', 'Olhe as 3 últimas cartas do deck e coloque uma no topo.'], en: ['Dredge', 'Look at the bottom 3 cards of your deck and put one on top.'] },
    FORGE: { pt: ['Forjar', 'Pague 2 de mana com a carta na mão para melhorá-la.'], en: ['Forge', 'Pay 2 mana while it is in your hand to upgrade it.'] },
    FRENZY: { pt: ['Frenesi', 'Ativa a primeira vez que o lacaio sobrevive a dano.'], en: ['Frenzy', 'Triggers the first time the minion survives damage.'] },
    MINIATURIZE: { pt: ['Miniaturizar', 'Ao abrir a carta, você ganha também uma versão de 1 de mana.'], en: ['Miniaturize', 'You also get a 1-mana miniature version of the card.'] },
    FREEZE: { pt: ['Congelar', 'O alvo perde o próximo ataque.'], en: ['Freeze', 'The target loses its next attack.'] },
    MANATHIRST: { pt: ['Sede de Mana', 'Bônus se você tiver a quantidade de cristais de mana indicada.'], en: ['Manathirst', 'A bonus if you have the listed number of mana crystals.'] },
    EXCAVATE: { pt: ['Escavar', 'Revela tesouros cada vez melhores a cada escavação.'], en: ['Excavate', 'Digs up increasingly better treasures each time.'] },
    QUICKDRAW: { pt: ['Saque Rápido', 'Bônus se a carta for jogada no mesmo turno em que foi comprada.'], en: ['Quickdraw', 'A bonus if played the same turn it was drawn.'] },
    ECHO: { pt: ['Eco', 'Pode ser jogada repetidamente no mesmo turno.'], en: ['Echo', 'Can be played repeatedly in the same turn.'] },
    OVERKILL: { pt: ['Massacre', 'Bônus ao causar mais dano do que o necessário para matar.'], en: ['Overkill', 'A bonus when it deals more damage than needed to kill.'] },
    TITAN: { pt: ['Titã', 'Usa três habilidades especiais em vez de atacar, uma por turno.'], en: ['Titan', 'Uses three special abilities instead of attacking, one per turn.'] },
    TWINSPELL: { pt: ['Feitiço Gêmeo', 'Ao ser lançado, deixa uma cópia sem esse efeito na mão.'], en: ['Twinspell', 'Leaves a copy without this effect in your hand when cast.'] },
    SIDE_QUEST: { pt: ['Missão Secundária', 'Objetivo curto que dá uma recompensa ao ser concluído.'], en: ['Sidequest', 'A short objective that grants a reward once completed.'] },
    OVERHEAL: { pt: ['Supercura', 'Ativa quando o personagem é curado além da Vida máxima.'], en: ['Overheal', 'Triggers when the character is healed past full Health.'] },
    SILENCE: { pt: ['Silenciar', 'Remove todo o texto e os bônus de um lacaio.'], en: ['Silence', 'Removes all card text and buffs from a minion.'] },
    INSPIRE: { pt: ['Inspirar', 'Ativa depois que você usa o Poder Heroico.'], en: ['Inspire', 'Triggers after you use your Hero Power.'] },
    STARSHIP_PIECE: { pt: ['Peça de Nave', 'Pode ser acoplada a uma Nave Estelar para lançá-la depois.'], en: ['Starship Piece', 'Can be added to a Starship that you launch later.'] },
}

const MECHANIC_TIPS: Record<string, Record<Language, string>> = {
    TAUNT: {
        pt: 'Provocar protege o herói e os lacaios mais frágeis, e é especialmente valioso contra decks agressivos, que precisam gastar ataques para passar.',
        en: 'Taunt shields your hero and frailer minions, and it is especially valuable against aggressive decks, which must spend attacks to get through.',
    },
    RUSH: {
        pt: 'Com Investida, a carta já entra trocando com um lacaio inimigo, o que ajuda a recuperar o controle do tabuleiro no mesmo turno.',
        en: 'With Rush, the card trades with an enemy minion right away, helping you retake the board the same turn.',
    },
    CHARGE: {
        pt: 'Ataque Furioso permite causar dano direto no herói inimigo no mesmo turno, por isso costuma ser guardado para finalizar a partida.',
        en: 'Charge lets you hit the enemy hero the turn it lands, so it is often saved to close out the game.',
    },
    DEATHRATTLE: {
        pt: 'Por ter Último Suspiro, a carta continua gerando valor mesmo quando é destruída; fique atento a efeitos de Silenciar, que cancelam o bônus.',
        en: 'Thanks to its Deathrattle, the card keeps giving value even when destroyed; watch out for Silence effects, which cancel the bonus.',
    },
    BATTLECRY: {
        pt: 'O Grito de Guerra só ativa quando a carta sai da mão, então vale pensar na ordem das jogadas para que o efeito tenha um bom alvo.',
        en: 'The Battlecry only triggers when it is played from hand, so plan the order of your plays so the effect has a good target.',
    },
    DISCOVER: {
        pt: 'Descobrir dá flexibilidade: escolha a opção que resolve o problema da partida atual, e não necessariamente a carta mais forte.',
        en: 'Discover adds flexibility: pick the option that solves the current game’s problem, not necessarily the strongest card.',
    },
    LIFESTEAL: {
        pt: 'Roubar Vida transforma dano em cura, o que ajuda muito a sobreviver contra decks que tentam vencer rápido.',
        en: 'Lifesteal turns damage into healing, which helps a lot against decks trying to win fast.',
    },
    DIVINE_SHIELD: {
        pt: 'O Escudo Divino permite trocar com um lacaio inimigo sem perder vida, então a carta costuma ganhar duas trocas em vez de uma.',
        en: 'Divine Shield lets it trade into an enemy minion without losing health, so it often wins two trades instead of one.',
    },
    STEALTH: {
        pt: 'Com Furtividade, o adversário não consegue removê-la com facilidade antes do primeiro ataque, o que garante pelo menos um golpe.',
        en: 'With Stealth, the opponent can’t easily remove it before its first attack, which guarantees at least one hit.',
    },
    SECRET: {
        pt: 'Segredos funcionam melhor quando o adversário não sabe qual deles está ativo; varie a ordem em que joga para dificultar a leitura.',
        en: 'Secrets work best when the opponent can’t tell which one is active; vary the order you play them to keep them guessing.',
    },
    WINDFURY: {
        pt: 'Com Fúria dos Ventos, cada ponto de Ataque conta em dobro, o que a torna perigosa quando recebe bônus.',
        en: 'With Windfury, every point of Attack counts twice, which makes it dangerous when buffed.',
    },
    REBORN: {
        pt: 'Renascer obriga o adversário a gastar duas respostas para limpá-la do tabuleiro.',
        en: 'Reborn forces the opponent to spend two answers to clear it from the board.',
    },
    POISONOUS: {
        pt: 'Venenoso faz até um lacaio pequeno destruir um gigante, o que torna a carta ótima para trocas favoráveis.',
        en: 'Poisonous lets even a small minion kill a giant, making the card great for favorable trades.',
    },
    TRADEABLE: {
        pt: 'Por ser Negociável, a carta nunca fica parada na mão: se não for a hora dela, troque-a por outra carta.',
        en: 'Being Tradeable, the card never sits dead in hand: if it isn’t the right moment, swap it for another card.',
    },
    ELUSIVE: {
        pt: 'Por ser Evasiva, a carta só pode ser respondida por ataques ou efeitos sem alvo, o que a torna difícil de remover.',
        en: 'Being Elusive, it can only be answered by attacks or untargeted effects, which makes it hard to remove.',
    },
}

export function cardUsage(card: HsCard, language: Language, name: string) {
    const pt = language === 'pt'
    const timing = card.cost <= 2
        ? (pt
            ? `Com custo ${card.cost}, ${name} é uma jogada dos primeiros turnos, quando cada ponto de mana conta. Cartas baratas assim são a base de decks agressivos e ajudam a disputar o tabuleiro desde o início.`
            : `At ${card.cost} mana, ${name} is an early-turn play, when every mana counts. Cheap cards like this are the backbone of aggressive decks and help fight for the board from the start.`)
        : card.cost <= 5
            ? (pt
                ? `Com custo ${card.cost}, ${name} entra no meio da partida, quando os dois jogadores começam a disputar o controle do tabuleiro. Encaixa em decks equilibrados que querem uma curva de mana sem buracos.`
                : `At ${card.cost} mana, ${name} lands in the mid game, when both players start fighting for board control. It fits balanced decks that want a smooth mana curve.`)
            : (pt
                ? `Com custo ${card.cost}, ${name} é uma carta de fim de partida. Decks de controle costumam incluir poucas cartas assim, porque elas precisam ter impacto suficiente para justificar o turno inteiro.`
                : `At ${card.cost} mana, ${name} is a late-game card. Control decks usually run only a few of these, because they must be impactful enough to justify a whole turn.`)
    const tips = card.mechanics.map((mechanic) => MECHANIC_TIPS[mechanic]?.[language]).filter((tip): tip is string => Boolean(tip))
    const neutral = card.classes.includes('NEUTRAL')
        ? (pt
            ? 'Por ser neutra, ela compete com as cartas próprias de cada classe: vale colocá-la num deck quando ela faz algo que a classe não tem.'
            : 'Being neutral, it competes with each class’s own cards: include it when it does something the class lacks.')
        : ''
    return [timing, ...tips, neutral].filter(Boolean)
}

export function cardMechanics(card: HsCard, language: Language) {
    return card.mechanics.flatMap((mechanic) => {
        const entry = MECHANICS[mechanic]?.[language]
        return entry ? [{ name: entry[0], text: entry[1] }] : []
    })
}

const L = {
    pt: {
        minion: 'lacaio', spell: 'feitiço', weapon: 'arma', hero: 'carta de herói', location: 'local',
        neutral: 'neutra, ou seja, pode entrar em decks de qualquer classe',
        classOnly: (cls: string) => `exclusiva da classe ${cls}`,
    },
    en: {
        minion: 'minion', spell: 'spell', weapon: 'weapon', hero: 'hero card', location: 'location',
        neutral: 'neutral, so it fits in a deck of any class',
        classOnly: (cls: string) => `exclusive to the ${cls} class`,
    },
}

const listOf = (items: string[], language: Language) =>
    items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} ${language === 'pt' ? 'e' : 'and'} ${items.at(-1)}`

const rarityWord = (card: HsCard, language: Language) => hsLabel(card.rarity, language).toLowerCase()

export interface CardDescription {
    identity: string[]
    format: string
    collection: string[]
    stats: string | null
}

export function describeCard(card: HsCard, set: HsSet, standard: boolean, reprints: HsSet[], language: Language, name: string): CardDescription {
    const labels = L[language]
    const pt = language === 'pt'
    const kind = labels[card.type.toLowerCase() as keyof typeof labels] as string
    const classes = card.classes.filter((cls) => cls !== 'NEUTRAL').map((cls) => hsLabel(cls, language))
    const classText = classes.length ? labels.classOnly(listOf(classes, language)) : labels.neutral
    const tribes = card.races.filter((race) => race !== 'ALL').map((race) => hsLabel(race, language))

    const identity = [
        pt
            ? `${name} é uma carta do tipo ${hsLabel(card.type, language)}, de raridade ${rarityWord(card, language)}, lançada na coleção ${setName(set, language)}, de ${set.year}. A carta é ${classText}.`
            : `${name} is a ${rarityWord(card, language)} ${kind} released in the ${setName(set, language)} set in ${set.year}. The card is ${classText}.`,
    ]

    const costText = pt ? `Custa ${card.cost} de mana` : `It costs ${card.cost} mana`
    if (card.type === 'MINION' && card.attack !== undefined && card.health !== undefined) {
        identity.push(pt
            ? `${costText} e entra em campo com ${card.attack} de Ataque e ${card.health} de Vida${tribes.length ? `, com o tipo ${listOf(tribes, language)}` : ''}.`
            : `${costText} and enters the board with ${card.attack} Attack and ${card.health} Health${tribes.length ? `, with the ${listOf(tribes, language)} minion type` : ''}.`)
    } else if (card.type === 'WEAPON' && card.attack !== undefined && card.health !== undefined) {
        identity.push(pt
            ? `${costText} e dá ao herói ${card.attack} de Ataque por ${card.health} ${card.health === 1 ? 'ataque' : 'ataques'} (Durabilidade), somando até ${card.attack * card.health} de dano no total.`
            : `${costText} and gives your hero ${card.attack} Attack for ${card.health} ${card.health === 1 ? 'attack' : 'attacks'} (Durability), up to ${card.attack * card.health} total damage.`)
    } else if (card.type === 'HERO' && card.armor !== undefined) {
        identity.push(pt
            ? `${costText}, troca o seu herói e o Poder Heroico e concede ${card.armor} de Armadura.`
            : `${costText}, replaces your hero and Hero Power and grants ${card.armor} Armor.`)
    } else if (card.type === 'LOCATION' && card.health !== undefined) {
        identity.push(pt
            ? `${costText} e fica em campo com ${card.health} ${card.health === 1 ? 'uso' : 'usos'}; cada ativação tem um tempo de recarga de um turno.`
            : `${costText} and stays on the board with ${card.health} ${card.health === 1 ? 'use' : 'uses'}; each activation has a one-turn cooldown.`)
    } else {
        const school = card.spellSchool ? hsLabel(card.spellSchool, language) : null
        identity.push(pt
            ? `${costText}${school ? ` e pertence à escola de magia ${school}, o que importa para cartas que contam ou melhoram feitiços dessa escola` : ''}.`
            : `${costText}${school ? ` and belongs to the ${school} spell school, which matters for cards that count or empower spells of that school` : ''}.`)
    }

    const reprintNames = reprints.map((other) => setName(other, language))
    const format = standard
        ? (pt
            ? 'A coleção faz parte do formato Padrão atual, então a carta pode ser usada tanto no Padrão quanto no Livre.'
            : 'Its set is part of the current Standard format, so the card is legal in both Standard and Wild.')
        : (pt
            ? 'A coleção já saiu do formato Padrão, então hoje a carta só é válida no formato Livre.'
            : 'Its set has rotated out of Standard, so today the card is only legal in Wild.')
    const formatText = reprintNames.length
        ? `${format} ${pt ? `Ela também aparece em: ${listOf(reprintNames, language)}.` : `It also appears in: ${listOf(reprintNames, language)}.`}`
        : format

    const copies = maxCopies(card)
    const collection = [
        pt
            ? `Um deck pode ter até ${copies} ${copies === 1 ? 'cópia' : 'cópias'} desta carta${card.rarity === 'LEGENDARY' ? ', como acontece com toda lendária' : ''}.`
            : `A deck can hold up to ${copies} ${copies === 1 ? 'copy' : 'copies'} of this card${card.rarity === 'LEGENDARY' ? ', like every legendary' : ''}.`,
    ]
    if (card.bundled) {
        collection.push(pt
            ? 'Ela vem junto de outra carta (pacote de lendária Fábula) e não pode ser criada separadamente.'
            : 'It comes bundled with another card (a Fabled legendary package) and can’t be crafted on its own.')
    } else if (card.rarity === 'FREE') {
        collection.push(pt
            ? 'Por ser uma carta básica, todo jogador recebe de graça: não pode ser criada nem desencantada.'
            : 'As a free card, every player gets it at no cost: it can’t be crafted or disenchanted.')
    } else if (card.free) {
        collection.push(pt
            ? 'Ela faz parte da coleção Básica, liberada de graça para todos os jogadores, então não precisa ser criada e não pode ser desencantada.'
            : 'It is part of the Core set, unlocked for free for every player, so it doesn’t need to be crafted and can’t be disenchanted.')
    } else {
        const craft = CRAFT_COST[card.rarity]
        const dust = DISENCHANT_VALUE[card.rarity]
        collection.push(pt
            ? `Criar uma cópia custa ${craft} de Pó Arcano, e desencantar devolve ${dust}. A versão dourada custa mais para criar e devolve mais pó ao ser desencantada.`
            : `Crafting a copy costs ${craft} Arcane Dust, and disenchanting it returns ${dust}. The golden version costs more to craft and returns more dust.`)
        if (copies > 1) {
            collection.push(pt
                ? `Completar o par para o deck custa ${craft * copies} de pó.`
                : `Completing the playset for a deck costs ${craft * copies} dust.`)
        }
    }

    let stats: string | null = null
    if (card.type === 'MINION' && card.attack !== undefined && card.health !== undefined) {
        const expected = card.cost * 2 + 1
        const total = card.attack + card.health
        const diff = total - expected
        const intro = pt
            ? `Uma regra prática usada por jogadores é o "teste do lacaio sem texto": um lacaio costuma ter cerca de 2 pontos de atributo por mana, mais 1 (aqui, ${expected}). ${name} tem ${total} pontos (${card.attack}/${card.health}).`
            : `A rule of thumb players use is the "vanilla test": a minion usually has about 2 stat points per mana, plus 1 (here, ${expected}). ${name} has ${total} points (${card.attack}/${card.health}).`
        const verdict = diff > 0
            ? (pt
                ? ' Isso está acima da média, o que normalmente significa que o texto traz alguma desvantagem ou condição.'
                : ' That is above the curve, which usually means the card text carries a drawback or condition.')
            : diff === 0
                ? (pt
                    ? ' Os atributos estão na média, então qualquer efeito extra é lucro.'
                    : ' The stats are on curve, so any extra effect is pure upside.')
                : (pt
                    ? ` Faltam ${-diff} ${-diff === 1 ? 'ponto' : 'pontos'} em relação à média: o valor da carta está no efeito, não no corpo.`
                    : ` It is ${-diff} ${-diff === 1 ? 'point' : 'points'} below the curve: its value lies in the effect, not the body.`)
        stats = intro + verdict
    }

    return { identity, format: formatText, collection, stats }
}

export type SetCard = Pick<HsCard, 'dbfId' | 'id' | 'name' | 'cost' | 'rarity' | 'classes' | 'type' | 'bundled' | 'free'> & { slug: string }

export function describeSet(set: HsSet, cards: SetCard[], language: Language) {
    const pt = language === 'pt'
    const counts = HS_RARITIES.map((rarity) => [rarity, cards.filter((card) => card.rarity === rarity).length] as const).filter(([, n]) => n > 0)
    const plural = (word: string, n: number) => !pt || n === 1 ? word : word.endsWith('m') ? `${word.slice(0, -1)}ns` : `${word}s`
    const countText = listOf(counts.map(([rarity, n]) => `${n} ${plural(hsLabel(rarity, language).toLowerCase(), n)}`), language)
    const dust = cards.reduce((sum, card) => sum + craftCost(card) * maxCopies(card), 0)
    const legendaries = cards.filter((card) => card.rarity === 'LEGENDARY' && craftCost(card) > 0).length
    const name = setName(set, language)
    const locale = pt ? 'pt-BR' : 'en-US'

    return [
        pt
            ? `${name} foi lançada em ${set.year} e reúne ${cards.length} cartas colecionáveis: ${countText}.`
            : `${name} was released in ${set.year} and has ${cards.length} collectible cards: ${countText}.`,
        set.standard
            ? (pt ? 'A coleção está no formato Padrão atual, então as cartas valem nos dois formatos.' : 'The set is in the current Standard format, so its cards are legal in both formats.')
            : (pt ? 'A coleção já saiu do Padrão: as cartas só podem ser usadas no formato Livre.' : 'The set has rotated out of Standard: its cards can only be used in Wild.'),
        dust > 0
            ? (pt
                ? `Criar a coleção inteira do zero (duas cópias de cada carta e uma de cada lendária) custaria ${dust.toLocaleString(locale)} de Pó Arcano${legendaries ? `, dos quais ${(legendaries * CRAFT_COST.LEGENDARY).toLocaleString(locale)} só nas ${legendaries} lendárias` : ''}. Por isso vale abrir pacotes da coleção primeiro e usar o pó só para as cartas que faltarem.`
                : `Crafting the whole set from scratch (two copies of each card and one of each legendary) would cost ${dust.toLocaleString(locale)} Arcane Dust${legendaries ? `, ${(legendaries * CRAFT_COST.LEGENDARY).toLocaleString(locale)} of it on the ${legendaries} legendaries alone` : ''}. That is why opening packs first and crafting only the missing cards is the better deal.`)
            : isFreeSet(set)
                ? (pt
                    ? 'Todas as cartas desta coleção são liberadas de graça para os jogadores, então ela serve de base para montar os primeiros decks sem gastar Pó Arcano.'
                    : 'Every card in this set is unlocked for free, so it is the foundation for building your first decks without spending Arcane Dust.')
                : (pt ? 'As cartas desta coleção não podem ser criadas com Pó Arcano.' : 'The cards in this set can’t be crafted with Arcane Dust.'),
    ]
}

export function cardMetaDescription(card: HsCard, set: HsSet, text: string) {
    const kind = hsLabel(card.type, 'pt').toLowerCase()
    const plain = stripCardText(text).replace(/\s+/g, ' ').trim()
    const base = `${card.name[0]} (${card.name[1]}): ${kind} ${hsLabel(card.rarity, 'pt').toLowerCase()} de ${card.cost} de mana da coleção ${set.name[0]}.`
    return plain ? `${base} ${plain}`.slice(0, 300) : base
}
