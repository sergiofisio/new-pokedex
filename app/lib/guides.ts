import type { Language } from "../i18n/translations";

export type GuideSection = { title: string; paragraphs: string[] }
export type GuideContent = { title: string; description: string; intro: string; sections: GuideSection[] }
export type GuideWorld = 'pokemon' | 'hearthstone'

export interface Guide {
    slug: string
    world: GuideWorld
    updated: string
    content: Record<Language, GuideContent>
}

export const GUIDES: Guide[] = [
    {
        slug: 'tabela-de-tipos',
        world: 'pokemon',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Tabela de tipos Pokémon: fraquezas, resistências e imunidades',
                description: 'Tabela completa dos 18 tipos Pokémon com fraquezas, resistências e imunidades, explicação dos multiplicadores de dano e um resumo de cada tipo.',
                intro: 'Saber qual tipo vence qual é a habilidade mais útil em qualquer jogo de Pokémon. Esta página reúne a tabela completa dos 18 tipos, explica como os multiplicadores se combinam nos Pokémon de dois tipos e resume, tipo por tipo, contra quem cada um é forte e de quem ele precisa fugir.',
                sections: [
                    {
                        title: 'Como ler a tabela',
                        paragraphs: [
                            'Cada linha é o tipo do golpe que ataca, e cada coluna é o tipo do Pokémon que recebe o golpe. O número na interseção é o multiplicador de dano: 2× significa "super efetivo", ½× significa "pouco efetivo" e 0× significa que o alvo é imune. Casas vazias valem 1×, o dano normal.',
                            'Um detalhe que confunde muita gente: o que importa é o tipo do golpe, não o tipo do Pokémon que ataca. Um Charizard usando Terremoto causa dano do tipo Terra, e a tabela deve ser lida na linha de Terra.',
                        ],
                    },
                    {
                        title: 'Pokémon de dois tipos',
                        paragraphs: [
                            'Quando o alvo tem dois tipos, os multiplicadores são multiplicados entre si. Uma fraqueza dupla vira 4× (Gelo contra Garchomp, que é Dragão e Terra), uma resistência dupla vira ¼× e uma fraqueza somada a uma resistência se anula em 1×.',
                            'Basta uma imunidade para zerar tudo: Terremoto não acerta um Pokémon Voador mesmo que o outro tipo dele seja fraco a Terra. Por isso combinações como Água e Terra (Swampert) são tão valorizadas: o tipo Terra apaga a fraqueza a Elétrico que o tipo Água teria, e sobra só uma fraqueza, 4× a Planta.',
                        ],
                    },
                    {
                        title: 'Bônus de mesmo tipo (STAB)',
                        paragraphs: [
                            'Além da tabela, golpes do mesmo tipo do Pokémon que ataca recebem 1,5× de dano, o chamado STAB. Um Pikachu usando Choque do Trovão bate mais forte do que um Pokémon Normal usando o mesmo golpe. Na prática, a melhor jogada costuma ser o golpe que junta STAB e vantagem de tipo: 1,5 × 2 = 3× o dano base.',
                        ],
                    },
                    {
                        title: 'Exceções que vale lembrar',
                        paragraphs: [
                            'Algumas habilidades mudam a tabela. Levitar deixa o Pokémon imune a golpes de Terra, Absorver Água transforma golpes de Água em cura e Pele Seca deixa o Pokémon fraco a Fogo. Objetos como o Balão também dão imunidade temporária a Terra.',
                            'A tabela também mudou com o tempo. O tipo Fada só surgiu na sexta geração, e na primeira geração os golpes Fantasma não afetavam Pokémon Psíquicos por causa de um erro de programação. Esta página segue a tabela atual, válida da sexta geração em diante.',
                        ],
                    },
                    {
                        title: 'Dicas rápidas para batalhas',
                        paragraphs: [
                            'Tenha na equipe tipos que se cobrem: Fogo, Água e Planta formam um triângulo em que cada um resiste ao que vence o outro. Aço é o tipo com mais resistências, e Fada é a melhor resposta a Dragão. Antes de trocar de Pokémon, olhe o que o adversário pode usar contra ele, e não só o que ele pode usar contra o adversário.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Pokémon type chart: weaknesses, resistances and immunities',
                description: 'The full chart of all 18 Pokémon types with weaknesses, resistances and immunities, how damage multipliers work and a summary of each type.',
                intro: 'Knowing which type beats which is the most useful skill in any Pokémon game. This page has the full chart of the 18 types, explains how multipliers stack on dual-type Pokémon and sums up, type by type, what each one beats and what it should avoid.',
                sections: [
                    {
                        title: 'How to read the chart',
                        paragraphs: [
                            'Each row is the type of the attacking move, and each column is the type of the Pokémon taking the hit. The number where they meet is the damage multiplier: 2× is "super effective", ½× is "not very effective" and 0× means the target is immune. Empty cells are 1×, normal damage.',
                            'A common mix-up: what matters is the move’s type, not the attacker’s type. A Charizard using Earthquake deals Ground-type damage, so read the Ground row.',
                        ],
                    },
                    {
                        title: 'Dual-type Pokémon',
                        paragraphs: [
                            'When the target has two types, the multipliers are multiplied together. A double weakness becomes 4× (Ice against Garchomp, a Dragon and Ground type), a double resistance becomes ¼× and a weakness plus a resistance cancel out to 1×.',
                            'A single immunity zeroes everything: Earthquake won’t hit a Flying Pokémon even if its other type is weak to Ground. That is why combos like Water and Ground (Swampert) are so valued: Ground erases the Electric weakness that Water would have, leaving just one weakness, 4× to Grass.',
                        ],
                    },
                    {
                        title: 'Same-type attack bonus (STAB)',
                        paragraphs: [
                            'On top of the chart, moves that share a type with the attacker deal 1.5× damage, known as STAB. A Pikachu using Thunderbolt hits harder than a Normal Pokémon using the same move. In practice, the best play is usually the move that combines STAB and type advantage: 1.5 × 2 = 3× base damage.',
                        ],
                    },
                    {
                        title: 'Exceptions worth remembering',
                        paragraphs: [
                            'Some abilities change the chart. Levitate makes a Pokémon immune to Ground moves, Water Absorb turns Water moves into healing and Dry Skin makes a Pokémon weak to Fire. Items like the Air Balloon also grant temporary Ground immunity.',
                            'The chart has changed over time too. The Fairy type only arrived in the sixth generation, and in the first generation Ghost moves didn’t affect Psychic Pokémon because of a programming bug. This page follows the current chart, valid from the sixth generation onward.',
                        ],
                    },
                    {
                        title: 'Quick battle tips',
                        paragraphs: [
                            'Build a team whose types cover each other: Fire, Water and Grass form a triangle where each resists what beats another. Steel has the most resistances, and Fairy is the best answer to Dragon. Before switching, check what the opponent can throw at your Pokémon, not only what it can throw at the opponent.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'como-reconhecer-pokemon',
        world: 'pokemon',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Como reconhecer Pokémon pela silhueta, pelo grito e pela descrição',
                description: 'Dicas para acertar mais nos desafios de Pokémon: como ler silhuetas, descrições da Pokédex, gritos, zoom, fusões e o modo Ginásio.',
                intro: 'Os desafios diários da Taverna dos Jogos testam quantos dos 1025 Pokémon você consegue reconhecer com pouca informação. Ninguém decora todos, mas algumas estratégias ajudam muito a reduzir as opções e acertar com menos tentativas.',
                sections: [
                    {
                        title: 'Silhueta: comece pela forma geral',
                        paragraphs: [
                            'Antes de procurar detalhes, olhe a postura. Quadrúpedes, bípedes, serpentes, peixes e aves formam grupos bem diferentes, e só isso já descarta centenas de nomes. Depois procure as partes que mais saltam da sombra: orelhas longas, caudas com formato próprio, chifres, asas ou apêndices.',
                            'Lembre que a silhueta não mostra cor nem tamanho real. Um Pokémon minúsculo e um enorme podem ocupar a tela inteira. Desconfie também das evoluções: muitas linhas evolutivas mantêm a mesma silhueta básica e mudam só em detalhes como o tamanho da cauda ou o número de pontas.',
                        ],
                    },
                    {
                        title: 'Descrição: procure as palavras-chave',
                        paragraphs: [
                            'As descrições da Pokédex costumam citar o habitat, a dieta ou o comportamento. Palavras como "vulcão", "mar profundo", "floresta" ou "cavernas" apontam para o tipo. Menções a eletricidade, veneno, psíquico ou fantasmas são pistas ainda mais diretas.',
                            'Fique atento a números e comparações. Textos que falam de "pesar como uma montanha" ou "voar mais rápido que um jato" quase sempre são de Pokémon grandes ou lendários. E se a descrição falar de evolução ("quando evolui...", "na forma anterior..."), o alvo provavelmente faz parte de uma linha de três estágios.',
                        ],
                    },
                    {
                        title: 'Zoom: identifique a textura',
                        paragraphs: [
                            'No modo Zoom, a imagem começa bem ampliada e vai se revelando a cada erro. Nas primeiras tentativas você vê só cores e texturas, então pense em combinações: amarelo com marrom, azul com branco, verde com vermelho. Escamas, pelos, pedra e metal também ajudam a chutar o tipo.',
                            'Use os erros a seu favor. Cada tentativa errada mostra mais da imagem, então um chute que pelo menos tenha a cor certa já ajuda a confirmar ou descartar uma família inteira.',
                        ],
                    },
                    {
                        title: 'Grito: ouça o ritmo, não só o som',
                        paragraphs: [
                            'Os gritos das primeiras gerações são sons sintetizados curtos e às vezes parecidos entre si, enquanto os das gerações recentes são mais longos e detalhados. Só pela qualidade do áudio já dá para ter uma ideia da geração do Pokémon.',
                            'Muitos Pokémon da série animada falam o próprio nome, mas os gritos dos jogos são outra coisa. Repare no ritmo, no número de sílabas e se o som sobe ou desce no final. Pokémon grandes costumam ter gritos graves; os pequenos, agudos.',
                        ],
                    },
                    {
                        title: 'Fusão e Ginásio',
                        paragraphs: [
                            'Na Fusão, a imagem mistura dois Pokémon: um costuma dar a forma do corpo e o outro, as cores e o rosto. Tente separar essas duas camadas e acertar primeiro a mais óbvia. O formato da cabeça e o padrão das cores raramente vêm do mesmo Pokémon.',
                            'No Ginásio, você precisa achar o Pokémon que não pertence ao grupo. Comece pelo tipo do líder e procure quem não combina; se todos parecerem do mesmo tipo, compare a geração, a região ou o estágio evolutivo.',
                        ],
                    },
                    {
                        title: 'Treine com a Pokédex',
                        paragraphs: [
                            'A melhor forma de melhorar é explorar a Pokédex por geração. Abra a página de cada Pokémon, veja a arte oficial, os tipos e a linha evolutiva, e ouça o grito. Depois de passar por uma região inteira, os desafios daquela geração ficam bem mais fáceis.',
                        ],
                    },
                ],
            },
            en: {
                title: 'How to recognize Pokémon by silhouette, cry and description',
                description: 'Tips to win more Pokémon challenges: reading silhouettes, Pokédex entries, cries, zoomed images, fusions and the Gym mode.',
                intro: 'The daily challenges at Taverna dos Jogos test how many of the 1025 Pokémon you can recognize from very little information. Nobody memorizes them all, but a few strategies help a lot to narrow the options and get it right in fewer tries.',
                sections: [
                    {
                        title: 'Silhouette: start with the overall shape',
                        paragraphs: [
                            'Before hunting for details, look at the posture. Quadrupeds, bipeds, serpents, fish and birds are very different groups, and that alone rules out hundreds of names. Then look for the parts that stand out most: long ears, distinctive tails, horns, wings or appendages.',
                            'Remember that a silhouette shows neither color nor real size. A tiny Pokémon and a huge one can both fill the screen. Watch out for evolutions too: many lines keep the same basic silhouette and only change details like tail size or the number of spikes.',
                        ],
                    },
                    {
                        title: 'Description: look for keywords',
                        paragraphs: [
                            'Pokédex entries usually mention habitat, diet or behavior. Words like "volcano", "deep sea", "forest" or "caves" point to a type. Mentions of electricity, poison, psychic powers or ghosts are even more direct clues.',
                            'Pay attention to numbers and comparisons. Entries about "weighing as much as a mountain" or "flying faster than a jet" are almost always about large or legendary Pokémon. And if the entry talks about evolution ("when it evolves...", "in its previous form..."), the target is probably part of a three-stage line.',
                        ],
                    },
                    {
                        title: 'Zoom: identify the texture',
                        paragraphs: [
                            'In Zoom mode, the image starts heavily zoomed in and is revealed with each miss. On the first tries you only see colors and textures, so think in combinations: yellow and brown, blue and white, green and red. Scales, fur, stone and metal also hint at the type.',
                            'Use your misses. Each wrong guess reveals more of the image, so a guess with at least the right colors helps confirm or rule out a whole family.',
                        ],
                    },
                    {
                        title: 'Cry: listen to the rhythm, not just the sound',
                        paragraphs: [
                            'Cries from the early generations are short synthesized sounds that can be alike, while recent ones are longer and more detailed. The audio quality alone hints at the generation.',
                            'Many Pokémon in the anime say their own name, but game cries are something else. Notice the rhythm, the number of syllables and whether the sound rises or falls at the end. Big Pokémon tend to have deep cries; small ones, high-pitched cries.',
                        ],
                    },
                    {
                        title: 'Fusion and Gym',
                        paragraphs: [
                            'In Fusion, the image blends two Pokémon: one usually provides the body shape and the other the colors and face. Try to separate those two layers and guess the more obvious one first. The head shape and the color pattern rarely come from the same Pokémon.',
                            'In Gym, you need to find the Pokémon that doesn’t belong. Start with the leader’s type and look for the odd one out; if they all seem to share a type, compare generation, region or evolution stage.',
                        ],
                    },
                    {
                        title: 'Practice with the Pokédex',
                        paragraphs: [
                            'The best way to improve is to browse the Pokédex by generation. Open each Pokémon’s page, look at the official art, types and evolution line, and listen to the cry. After going through a whole region, that generation’s challenges get much easier.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'po-arcano-e-deck-barato',
        world: 'hearthstone',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Pó Arcano no Hearthstone: como gastar bem e montar um deck barato',
                description: 'Quanto custa criar cada carta, quando desencantar, como aproveitar pacotes e como montar um deck competitivo gastando pouco Pó Arcano.',
                intro: 'O Pó Arcano é o recurso que transforma cartas que você não usa em cartas que você quer. Como ele é lento de juntar, cada criação conta. Este guia explica os custos, quando vale desencantar e como montar um deck forte sem gastar uma fortuna.',
                sections: [
                    {
                        title: 'Quanto custa cada carta',
                        paragraphs: [
                            'Criar uma carta comum custa 40 de pó, uma rara custa 100, uma épica 400 e uma lendária 1.600. Ao desencantar, você recebe bem menos: 5, 20, 100 e 400, respectivamente. Ou seja, desencantar devolve só um quarto (ou menos) do valor de criação.',
                            'As versões douradas custam mais: 400, 800, 1.600 e 3.200 para criar, e devolvem 50, 100, 400 e 1.600 ao desencantar. Uma carta dourada repetida é uma das melhores fontes de pó, porque vale o mesmo que criar a versão comum em muitos casos.',
                        ],
                    },
                    {
                        title: 'Quando desencantar',
                        paragraphs: [
                            'Desencante sem medo as cópias extras: o jogo só deixa usar duas de cada carta e uma de cada lendária, e há um botão para desencantar todas as cópias excedentes de uma vez. Depois disso, pense duas vezes antes de desfazer cartas que você pode querer no futuro.',
                            'Fique de olho nas mudanças de balanceamento. Quando a Blizzard enfraquece uma carta, por um tempo ela pode ser desencantada pelo valor total de criação. É a melhor hora para trocar cartas que perderam força por pó cheio.',
                            'No fim de cada ano, as coleções mais antigas saem do formato Padrão. Se você só joga Padrão, cartas que vão rotacionar são boas candidatas a desencantar, mas lembre que elas continuam válidas no Livre.',
                        ],
                    },
                    {
                        title: 'Pacotes antes de pó',
                        paragraphs: [
                            'Em geral, abrir pacotes da coleção mais recente rende mais do que criar carta por carta. O jogo tem proteção contra repetidas: você não recebe uma lendária que já tem antes de completar todas as daquela coleção, e o mesmo vale para as demais raridades. Há também uma garantia de lendária nos primeiros pacotes de cada coleção nova e, depois, pelo menos uma a cada 40 pacotes.',
                            'O caminho mais eficiente costuma ser: abrir os pacotes que você ganhou, desencantar o excedente e só então criar as cartas que faltam para o deck que você quer.',
                        ],
                    },
                    {
                        title: 'Como montar um deck barato',
                        paragraphs: [
                            'Decks agressivos são os mais baratos e costumam ser muito eficientes na escalada de ranque. Eles usam lacaios de custo baixo, que geralmente são comuns e raros, e vencem antes que as lendárias caras do oponente façam diferença.',
                            'Comece pela coleção Básica, que é gratuita para todos e está sempre no Padrão. Ela tem cartas sólidas de todas as classes. Depois, gaste o pó nas cartas que aparecem em vários decks da mesma classe: elas continuam úteis mesmo se você mudar de estratégia.',
                            'Evite criar uma lendária só porque ela é forte em um único deck. Prefira lendárias neutras ou que aparecem em várias listas do meta. A biblioteca de cartas e a página de cada carta mostram em quais decks ela aparece, o que ajuda a decidir.',
                        ],
                    },
                    {
                        title: 'Use a ferramenta de coleção',
                        paragraphs: [
                            'Na Taverna dos Jogos você pode marcar as cartas que tem e ver quanto pó falta para montar cada deck do meta. Assim dá para escolher o deck mais próximo da sua coleção atual, em vez de começar do zero.',
                        ],
                    },
                ],
            },
            en: {
                title: 'Arcane Dust in Hearthstone: spending it well and building a cheap deck',
                description: 'How much each card costs to craft, when to disenchant, how to make the most of packs and how to build a competitive deck on a budget.',
                intro: 'Arcane Dust turns cards you don’t use into cards you want. Since it is slow to collect, every craft matters. This guide covers the costs, when it is worth disenchanting and how to build a strong deck without spending a fortune.',
                sections: [
                    {
                        title: 'How much each card costs',
                        paragraphs: [
                            'Crafting a common costs 40 dust, a rare 100, an epic 400 and a legendary 1,600. Disenchanting gives back far less: 5, 20, 100 and 400 respectively. In other words, disenchanting returns a quarter (or less) of the crafting cost.',
                            'Golden versions cost more: 400, 800, 1,600 and 3,200 to craft, and they return 50, 100, 400 and 1,600 when disenchanted. A duplicate golden card is one of the best sources of dust.',
                        ],
                    },
                    {
                        title: 'When to disenchant',
                        paragraphs: [
                            'Disenchant extra copies freely: you can only use two of each card and one of each legendary, and there is a button to disenchant every surplus copy at once. After that, think twice before dusting cards you may want later.',
                            'Watch for balance changes. When Blizzard nerfs a card, it can be disenchanted for its full crafting cost for a while. That is the best time to turn weakened cards into full dust.',
                            'Each year the oldest sets rotate out of Standard. If you only play Standard, rotating cards are good candidates for disenchanting, but remember they stay legal in Wild.',
                        ],
                    },
                    {
                        title: 'Packs before dust',
                        paragraphs: [
                            'In general, opening packs of the latest set gives more value than crafting card by card. The game has duplicate protection: you won’t get a legendary you already own before completing all of that set’s legendaries, and the same applies to the other rarities. There is also a guaranteed legendary within the first packs of each new set and, after that, at least one every 40 packs.',
                            'The most efficient path is usually: open the packs you earned, disenchant the surplus and only then craft the cards missing from the deck you want.',
                        ],
                    },
                    {
                        title: 'How to build a cheap deck',
                        paragraphs: [
                            'Aggressive decks are the cheapest and are often very effective for climbing the ladder. They use low-cost minions, usually commons and rares, and win before the opponent’s expensive legendaries make a difference.',
                            'Start with the Core set, which is free for everyone and always in Standard. It has solid cards for every class. Then spend dust on cards that show up in several decks of the same class: they stay useful even if you change strategy.',
                            'Avoid crafting a legendary just because it is strong in a single deck. Favor neutral legendaries or ones that appear in several meta lists. The card library and each card page show which decks it appears in, which helps you decide.',
                        ],
                    },
                    {
                        title: 'Use the collection tool',
                        paragraphs: [
                            'At Taverna dos Jogos you can mark the cards you own and see how much dust you need for each meta deck. That way you can pick the deck closest to your current collection instead of starting from scratch.',
                        ],
                    },
                ],
            },
        },
    },
    {
        slug: 'como-montar-deck-hearthstone',
        world: 'hearthstone',
        updated: '2026-10-09',
        content: {
            pt: {
                title: 'Como montar um deck de Hearthstone do zero',
                description: 'Regras básicas, curva de mana, compra de cartas, condição de vitória e mulligan: o passo a passo para montar e ajustar o seu próprio deck de Hearthstone.',
                intro: 'Copiar um deck pronto é o jeito mais rápido de começar, mas entender por que cada carta está ali é o que faz você ganhar mais partidas. Este guia mostra os princípios que guiam a montagem de qualquer deck.',
                sections: [
                    {
                        title: 'As regras do deck',
                        paragraphs: [
                            'Um deck tem exatamente 30 cartas, de uma única classe mais as cartas neutras. Você pode usar até duas cópias de cada carta, e só uma de cada lendária. Algumas cartas mudam essas regras, como as que exigem um deck sem repetidas, mas elas são exceção.',
                            'Escolha também o formato: o Padrão usa só as coleções dos últimos anos, e o Livre permite todas as cartas já lançadas. Comece pelo Padrão, que tem menos cartas para conhecer.',
                        ],
                    },
                    {
                        title: 'Curva de mana',
                        paragraphs: [
                            'Você ganha um cristal de mana por turno, então o deck precisa ter algo para fazer em cada um deles. A curva de mana é a distribuição dos custos: quantas cartas de 1, 2, 3 de mana e assim por diante.',
                            'Um deck equilibrado costuma ter muitas cartas de 2 e 3 de mana, algumas de 1 e 4, e poucas acima de 6. Decks agressivos concentram tudo no começo; decks de controle aceitam um início mais lento em troca de cartas poderosas no fim da partida.',
                        ],
                    },
                    {
                        title: 'Compra de cartas e condição de vitória',
                        paragraphs: [
                            'Ficar sem cartas na mão é uma das formas mais comuns de perder. Inclua algumas cartas que compram outras ou geram cartas extras, principalmente se o deck for mais lento.',
                            'Todo deck precisa de uma resposta clara para a pergunta "como eu venço?". Pode ser bater rápido no herói inimigo, dominar o tabuleiro com lacaios ou sobreviver até jogar uma combinação poderosa. Cartas que não ajudam esse plano são as primeiras a sair.',
                        ],
                    },
                    {
                        title: 'Mulligan: a mão inicial',
                        paragraphs: [
                            'No começo da partida você pode trocar as cartas da mão inicial. A regra geral é manter cartas baratas que você consegue jogar nos primeiros turnos e devolver as caras. Quem joga em segundo recebe A Moeda, que dá um cristal de mana extra uma vez e permite jogar uma carta de 2 de mana no primeiro turno.',
                        ],
                    },
                    {
                        title: 'Teste e ajuste',
                        paragraphs: [
                            'Nenhum deck nasce pronto. Jogue algumas partidas, anote quais cartas ficaram presas na mão e quais você sempre quis ter, e troque aos poucos. O montador de decks da Taverna dos Jogos mostra a curva de mana e o custo em pó enquanto você edita, e gera o código para importar no jogo.',
                        ],
                    },
                ],
            },
            en: {
                title: 'How to build a Hearthstone deck from scratch',
                description: 'Deck rules, mana curve, card draw, win conditions and mulligan: a step-by-step guide to building and tuning your own Hearthstone deck.',
                intro: 'Copying a ready-made deck is the fastest way to start, but understanding why each card is there is what wins more games. This guide covers the principles behind building any deck.',
                sections: [
                    {
                        title: 'Deck rules',
                        paragraphs: [
                            'A deck has exactly 30 cards from a single class plus neutral cards. You can run up to two copies of each card and only one of each legendary. Some cards bend these rules, such as those that require a deck with no duplicates, but they are the exception.',
                            'Pick a format too: Standard uses only the last few years of sets, and Wild allows every card ever released. Start with Standard, which has fewer cards to learn.',
                        ],
                    },
                    {
                        title: 'Mana curve',
                        paragraphs: [
                            'You gain one mana crystal per turn, so the deck needs something to do on each of them. The mana curve is the spread of costs: how many 1-, 2-, 3-mana cards and so on.',
                            'A balanced deck usually has many 2- and 3-mana cards, some 1- and 4-mana cards and few above 6. Aggressive decks pack everything early; control decks accept a slower start in exchange for powerful late-game cards.',
                        ],
                    },
                    {
                        title: 'Card draw and win condition',
                        paragraphs: [
                            'Running out of cards is one of the most common ways to lose. Include some cards that draw or generate extra cards, especially in slower decks.',
                            'Every deck needs a clear answer to "how do I win?". It can be hitting the enemy hero fast, controlling the board with minions or surviving until a powerful combo. Cards that don’t help that plan are the first to go.',
                        ],
                    },
                    {
                        title: 'Mulligan: your opening hand',
                        paragraphs: [
                            'At the start of the game you can replace cards from your opening hand. The general rule is to keep cheap cards you can play in the first turns and send back the expensive ones. The player going second gets The Coin, which grants one extra mana crystal once and lets you play a 2-mana card on turn one.',
                        ],
                    },
                    {
                        title: 'Test and tune',
                        paragraphs: [
                            'No deck is perfect on day one. Play a few games, note which cards got stuck in your hand and which ones you always wanted, and swap gradually. The Taverna dos Jogos deck builder shows the mana curve and dust cost as you edit, and generates the code to import into the game.',
                        ],
                    },
                ],
            },
        },
    },
]

export const getGuide = (slug: string) => GUIDES.find((guide) => guide.slug === slug)

export const ABOUT: Record<Language, GuideContent> = {
    pt: {
        title: 'Sobre a Taverna dos Jogos',
        description: 'Quem mantém a Taverna dos Jogos, para que o site existe, de onde vêm os dados e como entrar em contato.',
        intro: 'A Taverna dos Jogos é um site brasileiro, gratuito e feito por fã, que reúne ferramentas e desafios sobre Pokémon e Hearthstone em português e inglês.',
        sections: [
            {
                title: 'Quem mantém o site',
                paragraphs: [
                    'O site é criado e mantido por Sergio Bastos Jr, desenvolvedor brasileiro e jogador de longa data das duas franquias. Ele começou como uma Pokédex pessoal e cresceu para incluir desafios diários, duelos entre amigos e ferramentas de Hearthstone.',
                ],
            },
            {
                title: 'O que você encontra aqui',
                paragraphs: [
                    'Uma Pokédex com os 1025 Pokémon, com página própria para cada um mostrando tipos, fraquezas, atributos, evoluções e dados de criação. Desafios diários para reconhecer Pokémon pela silhueta, pela descrição, pelo grito e por outras pistas, com ranking e duelos.',
                    'Para Hearthstone, uma biblioteca com todas as cartas colecionáveis, uma página para cada carta e cada coleção, um montador de decks com código de importação, o controle da sua coleção com o custo em pó de cada deck e desafios no estilo Hearthdle.',
                    'Também publicamos guias próprios, como a tabela de tipos Pokémon e dicas para gastar bem o Pó Arcano.',
                ],
            },
            {
                title: 'De onde vêm os dados',
                paragraphs: [
                    'Os dados dos Pokémon vêm da PokéAPI, um projeto aberto mantido pela comunidade. Os dados das cartas de Hearthstone vêm do HearthstoneJSON e da API oficial da Blizzard. Os textos explicativos, as análises e os guias são escritos por nós.',
                ],
            },
            {
                title: 'Projeto de fã',
                paragraphs: [
                    'A Taverna dos Jogos não tem vínculo com a Nintendo, a Game Freak, a The Pokémon Company ou a Blizzard Entertainment. Pokémon e Hearthstone são marcas registradas dos seus respectivos donos. O site é gratuito e se mantém com anúncios e doações voluntárias.',
                ],
            },
            {
                title: 'Contato',
                paragraphs: [
                    'Encontrou um erro, tem uma sugestão ou quer falar sobre o projeto? Escreva para sergiobastosfisio@gmail.com.',
                ],
            },
        ],
    },
    en: {
        title: 'About Taverna dos Jogos',
        description: 'Who runs Taverna dos Jogos, why the site exists, where the data comes from and how to get in touch.',
        intro: 'Taverna dos Jogos is a free, fan-made Brazilian site with tools and challenges about Pokémon and Hearthstone, in Portuguese and English.',
        sections: [
            {
                title: 'Who runs the site',
                paragraphs: [
                    'The site is built and maintained by Sergio Bastos Jr, a Brazilian developer and longtime player of both franchises. It started as a personal Pokédex and grew to include daily challenges, duels with friends and Hearthstone tools.',
                ],
            },
            {
                title: 'What you’ll find here',
                paragraphs: [
                    'A Pokédex with all 1025 Pokémon, with a page for each one showing types, weaknesses, stats, evolutions and breeding data. Daily challenges to recognize Pokémon by silhouette, description, cry and other clues, with rankings and duels.',
                    'For Hearthstone, a library of every collectible card, a page for each card and set, a deck builder with import codes, collection tracking with the dust cost of each deck, and Hearthdle-style challenges.',
                    'We also publish our own guides, such as the Pokémon type chart and tips for spending Arcane Dust wisely.',
                ],
            },
            {
                title: 'Where the data comes from',
                paragraphs: [
                    'Pokémon data comes from PokéAPI, an open community project. Hearthstone card data comes from HearthstoneJSON and Blizzard’s official API. The explanations, analyses and guides are written by us.',
                ],
            },
            {
                title: 'Fan project',
                paragraphs: [
                    'Taverna dos Jogos is not affiliated with Nintendo, Game Freak, The Pokémon Company or Blizzard Entertainment. Pokémon and Hearthstone are trademarks of their respective owners. The site is free and supported by ads and voluntary donations.',
                ],
            },
            {
                title: 'Contact',
                paragraphs: [
                    'Found a mistake, have a suggestion or want to talk about the project? Write to sergiobastosfisio@gmail.com.',
                ],
            },
        ],
    },
}
