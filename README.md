# Pokédex

Uma Pokédex interativa inspirada no aparelho clássico dos jogos e do anime, construída com **Next.js 16**, **React 19**, **Tailwind CSS 4** e **Motion**, consumindo dados da [PokeAPI](https://pokeapi.co/).

**Acesse:** [new-pokedex-one.vercel.app](https://new-pokedex-one.vercel.app)

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

### Desafios
- **Quatro modos**: **Silhueta** (adivinhe pela sombra), **Descrição** (pelo texto da Pokédex, com o nome ocultado), **Zoom** (a imagem começa ampliada e se afasta a cada erro) e **Infinito** (compare tipos, geração, altura, peso, cor e estágio evolutivo a cada palpite).
- **Desafio diário e partidas aleatórias**: o Pokémon do dia é o mesmo para todos e muda à meia-noite; o modo aleatório não tem limite.
- **Busca lateral com filtros** por geração e tipo, listando todos os Pokémon que combinam com o que foi digitado.
- **Pistas progressivas** liberadas conforme os erros (geração, tipo, cor, estágio, categoria, primeira letra e formato do nome), com atalho para aplicar a pista como filtro.
- **Estatísticas** de vitórias, sequência atual, melhor sequência e distribuição de tentativas.
- **XP, níveis e insígnias**: cada vitória rende experiência (com bônus por acertar rápido e por sequências), o jogador sobe de patente de Novato a Mestre Pokémon e desbloqueia 14 insígnias em bronze, prata e ouro.

### Contas e perfil
- **Login com Google, GitHub ou e-mail e senha**, com nome de usuário único.
- **Progresso sincronizado**: estatísticas e palpites do dia ficam salvos na conta e são mesclados com o que já existia no navegador.
- **Perfil público** em `/u/nome-de-usuario`, com foto, nome de exibição, bio, Pokémon favorito, **equipe de até 6 Pokémon**, nível, insígnias e estatísticas. O perfil pode ser público ou privado.

### Apoie o projeto
- Página de **doações via Pix** (QR Code e copia e cola gerados no navegador, com valor opcional) e **Ko-fi**.

## Tecnologias

| Camada | Ferramenta |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 |
| Estilo | Tailwind CSS 4 |
| Animações | Motion |
| Requisições | Axios, com cache em memória |
| Dados | PokeAPI |
| Contas e banco | Supabase (Auth, Postgres com RLS e Storage) |
| QR Code | qrcode.react |
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

# Contas e sincronização (opcional)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica

# Doações (opcional)
NEXT_PUBLIC_PIX_KEY=sua-chave-pix
NEXT_PUBLIC_PIX_NAME="Nome do Titular"
NEXT_PUBLIC_PIX_CITY="Cidade"
NEXT_PUBLIC_KOFI_URL=https://ko-fi.com/seu-usuario
```

As tabelas, políticas de acesso e o bucket de avatares do Supabase estão em `supabase/migrations`. Para aplicá-las:

```bash
npx supabase db push --db-url "postgresql://..."
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
├── components/   # Componentes visuais (cards, modal, desafios, perfil, login, doações...)
├── context/      # Contextos de idioma, autenticação e da Pokédex
├── desafios/     # Central de desafios e página de cada modo
├── entrar/       # Login e cadastro
├── perfil/       # Edição do perfil
├── u/[username]/ # Perfil público
├── apoiar/       # Página de doações
├── hooks/        # Hooks de dados assíncronos, desafios e tradução
├── i18n/         # Textos em português e inglês
└── lib/          # PokeAPI, Supabase, desafios, progressão, Pix, sprites e gritos
public/
├── brand/        # Logo e ícone
└── regions/      # Fotos de fundo de cada região
supabase/
└── migrations/   # Esquema do banco
```

## Créditos

- Dados e sprites: [PokeAPI](https://pokeapi.co/).
- Gritos: [PokeAPI](https://github.com/PokeAPI/cries) e [Pokémon Showdown](https://play.pokemonshowdown.com/).
- Fotos de fundo: [Wikimedia Commons](https://commons.wikimedia.org/), com autor e licença exibidos no site.

Pokémon e todos os nomes relacionados são marcas registradas da Nintendo, Game Freak e The Pokémon Company. Este é um projeto de fã, sem fins lucrativos.

## Autor

Desenvolvido por **Sergio Bastos Jr** · [GitHub](https://github.com/sergiofisio)
