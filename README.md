# Pokédex

Uma Pokédex interativa inspirada no aparelho clássico dos jogos e do anime, construída com **Next.js 16**, **React 19**, **Tailwind CSS 4** e **Motion**, consumindo dados da [PokeAPI](https://pokeapi.co/).

Todos os 1025 Pokémon, das nove gerações, com cards animados, busca instantânea, cadeia evolutiva completa (incluindo métodos que mudam de acordo com a geração), sprites alternativos, formas regionais, gritos originais e versão em português e inglês.

## Funcionalidades

### Experiência
- **Abertura com Poké Ball**: o site começa com uma Poké Ball em tela cheia que se abre ao ser clicada, revelando a Pokédex.
- **Animações em todo o site** com Motion: entrada escalonada dos cards, transições de layout, indicadores animados, microinterações em botões e respeito à preferência de movimento reduzido do sistema.
- **Fundo temático por região**: cada geração exibe uma paisagem real que inspirou sua região (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar e Paldea), com transição suave e créditos das fotos.
- **Tema claro e escuro**, sem flash ao carregar a página.
- **Português e inglês**, com troca instantânea de idioma. As descrições da Pokédex são traduzidas no navegador quando não existem no idioma escolhido.

### Navegação
- **Menu lateral de gerações retrátil**, com animação suave no desktop e no mobile.
- **Busca instantânea** por nome ou número entre todas as espécies, com resultados priorizando quem começa com o termo digitado.
- **Grade responsiva** de cards com número, nome, tipos e arte oficial.

### Pokédex (modal)
- Visual de **aparelho Pokédex**, com tela, luzes, botões e D-pad.
- **D-pad funcional**: as setas percorrem exatamente a lista exibida na página (geração atual ou resultado da busca).
- **Grito do Pokémon** tocado automaticamente ao abrir, com opção entre o grito moderno e o clássico.
- Seções de **informações**, **status base** com barras animadas, **habilidades**, **formas alternativas**, **galeria de sprites** e **cadeia evolutiva**.
- **Evoluções por geração**: Pokémon como Eevee mostram todos os métodos possíveis (pedra, amizade, horário, local, tipo de golpe conhecido...) identificando em quais gerações cada método vale.

## Tecnologias

| Camada | Ferramenta |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Estilo | Tailwind CSS 4 |
| Animações | Motion |
| Requisições | Axios, com cache em memória |
| Dados | PokeAPI |
| Áudio | Gritos da PokeAPI e do Pokémon Showdown |
| Deploy | Vercel |

## Como rodar localmente

Pré-requisitos: Node.js 20+ e Yarn.

```bash
git clone git@github.com:sergiofisio/new-pokedex.git
cd new-pokedex
yarn install
```

Crie um arquivo `.env` na raiz:

```env
NEXT_PUBLIC_POKEMON_API_URL=https://pokeapi.co/api/v2/
```

Depois, inicie o servidor de desenvolvimento:

```bash
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando | Descrição |
| --- | --- |
| `yarn dev` | Servidor de desenvolvimento |
| `yarn build` | Build de produção |
| `yarn start` | Servidor de produção |
| `yarn lint` | Análise estática com ESLint |

## Estrutura

```
app/
├── components/   # Componentes visuais (cards, modal, menu, busca, Poké Ball de abertura...)
├── context/      # Contextos de idioma e da Pokédex
├── hooks/        # Hooks de dados assíncronos e tradução
├── i18n/         # Textos em português e inglês
├── lib/          # Cliente da PokeAPI, sprites, gritos, cores dos tipos e tradução
└── pages/        # Página inicial
public/
└── regions/      # Fotos de fundo de cada região
```

## Créditos

- Dados e sprites: [PokeAPI](https://pokeapi.co/).
- Gritos: [PokeAPI](https://github.com/PokeAPI/cries) e [Pokémon Showdown](https://play.pokemonshowdown.com/).
- Fotos de fundo: [Wikimedia Commons](https://commons.wikimedia.org/), com autor e licença exibidos no site.

Pokémon e todos os nomes relacionados são marcas registradas da Nintendo, Game Freak e The Pokémon Company. Este é um projeto de fã, sem fins lucrativos.

## Autor

Desenvolvido por **Sergio Bastos Jr** · [GitHub](https://github.com/sergiofisio)
