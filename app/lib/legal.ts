import type { Language } from "../i18n/translations";

export type LegalDoc = 'privacy' | 'terms'
export type LegalSection = { title: string; paragraphs: string[] }

export const LEGAL_UPDATED = '2026-10-09'
export const CONTACT_EMAIL = 'sergiobastosfisio@gmail.com'

export const LEGAL: Record<LegalDoc, Record<Language, LegalSection[]>> = {
    privacy: {
        pt: [
            {
                title: 'Quem somos',
                paragraphs: [
                    'A PokéTaverna é um projeto de fã, independente e sem vínculo com a Nintendo, a Game Freak, a The Pokémon Company ou a Blizzard Entertainment. Esta política explica quais dados coletamos, por que e quais são os seus direitos segundo a Lei Geral de Proteção de Dados (LGPD).',
                ],
            },
            {
                title: 'Dados que coletamos',
                paragraphs: [
                    'Sem conta, o site guarda no seu navegador (localStorage) o tema, o idioma, o progresso dos desafios, a coleção de Hearthstone e os decks salvos. Esses dados não saem do seu aparelho.',
                    'Ao criar uma conta, por e-mail e senha ou pelo Google ou GitHub, guardamos o e-mail, o nome de usuário, o avatar e as informações de perfil que você preencher, além do progresso dos desafios, dos duelos, da coleção de Hearthstone e dos decks salvos. Esses dados ficam no Supabase, nosso provedor de banco de dados e autenticação.',
                ],
            },
            {
                title: 'Para que usamos',
                paragraphs: [
                    'Usamos os dados só para fazer o site funcionar: manter você conectado, sincronizar o progresso entre aparelhos, mostrar rankings e duelos e exibir o seu perfil público quando você escolhe compartilhá-lo. Não vendemos dados pessoais.',
                ],
            },
            {
                title: 'Cookies e anúncios',
                paragraphs: [
                    'O site pode exibir anúncios do Google AdSense para cobrir os custos de hospedagem. O Google e os seus parceiros usam cookies para exibir e medir anúncios, inclusive anúncios personalizados com base nas suas visitas a este e a outros sites.',
                    'Na primeira visita, uma mensagem de consentimento do Google permite aceitar ou recusar os cookies de anúncios personalizados. Você pode mudar essa escolha a qualquer momento pelo link "Gerenciar cookies" no rodapé, ou desativar anúncios personalizados em adssettings.google.com.',
                    'Saiba mais sobre como o Google usa os dados em policies.google.com/technologies/partner-sites.',
                ],
            },
            {
                title: 'Serviços de terceiros',
                paragraphs: [
                    'As imagens e dados dos Pokémon vêm da PokéAPI, e os das cartas de Hearthstone vêm do HearthstoneJSON. A hospedagem é feita pela Vercel. Esses serviços podem registrar o seu endereço IP ao entregar os arquivos.',
                ],
            },
            {
                title: 'Seus direitos',
                paragraphs: [
                    `Você pode acessar, corrigir ou apagar os seus dados a qualquer momento. Para apagar a conta e tudo o que está ligado a ela, escreva para ${CONTACT_EMAIL}. Os dados guardados só no navegador podem ser apagados limpando os dados do site nas configurações do navegador.`,
                ],
            },
        ],
        en: [
            {
                title: 'Who we are',
                paragraphs: [
                    'PokéTaverna is an independent fan project with no ties to Nintendo, Game Freak, The Pokémon Company or Blizzard Entertainment. This policy explains which data we collect, why, and your rights under Brazil\'s General Data Protection Law (LGPD).',
                ],
            },
            {
                title: 'Data we collect',
                paragraphs: [
                    'Without an account, the site stores your theme, language, challenge progress, Hearthstone collection and saved decks in your browser (localStorage). This data never leaves your device.',
                    'When you create an account, with email and password or with Google or GitHub, we store your email, username, avatar and any profile information you fill in, plus your challenge progress, duels, Hearthstone collection and saved decks. This data is kept on Supabase, our database and authentication provider.',
                ],
            },
            {
                title: 'How we use it',
                paragraphs: [
                    'We only use data to run the site: keep you signed in, sync progress across devices, show rankings and duels and display your public profile when you choose to share it. We do not sell personal data.',
                ],
            },
            {
                title: 'Cookies and ads',
                paragraphs: [
                    'The site may show Google AdSense ads to cover hosting costs. Google and its partners use cookies to serve and measure ads, including personalized ads based on your visits to this and other sites.',
                    'On your first visit, a Google consent message lets you accept or refuse personalized ad cookies. You can change that choice at any time through the "Manage cookies" link in the footer, or turn off personalized ads at adssettings.google.com.',
                    'Learn how Google uses data at policies.google.com/technologies/partner-sites.',
                ],
            },
            {
                title: 'Third-party services',
                paragraphs: [
                    'Pokémon images and data come from PokéAPI, and Hearthstone card data comes from HearthstoneJSON. Hosting is provided by Vercel. These services may log your IP address when delivering files.',
                ],
            },
            {
                title: 'Your rights',
                paragraphs: [
                    `You can access, correct or delete your data at any time. To delete your account and everything tied to it, email ${CONTACT_EMAIL}. Data stored only in the browser can be removed by clearing the site data in your browser settings.`,
                ],
            },
        ],
    },
    terms: {
        pt: [
            {
                title: 'Sobre o site',
                paragraphs: [
                    'A PokéTaverna é um projeto de fã gratuito, com Pokédex, biblioteca de cartas de Hearthstone, desafios diários, duelos e deckbuilder. Ao usar o site, você concorda com estes termos.',
                ],
            },
            {
                title: 'Marcas registradas',
                paragraphs: [
                    'Pokémon e todos os nomes, imagens e marcas relacionados pertencem à Nintendo, à Game Freak e à The Pokémon Company. Hearthstone, as cartas e as artes pertencem à Blizzard Entertainment. O site não é oficial, não é endossado por essas empresas e usa esse material só para fins informativos e de entretenimento.',
                ],
            },
            {
                title: 'Sua conta',
                paragraphs: [
                    'Você é responsável pela sua conta e pelo nome de usuário que escolher. Nomes ofensivos, trapaça nos duelos e uso automatizado para abusar dos rankings podem levar à remoção da conta.',
                ],
            },
            {
                title: 'Anúncios e apoio',
                paragraphs: [
                    'O site pode exibir anúncios e aceitar apoios voluntários para cobrir os custos. Os anúncios são fornecidos pelo Google, e não nos responsabilizamos pelo conteúdo de sites de terceiros.',
                ],
            },
            {
                title: 'Sem garantias',
                paragraphs: [
                    'O site é oferecido como está. Os dados de cartas, decks de referência e estatísticas podem conter erros ou ficar desatualizados, e funções podem mudar ou sair do ar sem aviso.',
                ],
            },
            {
                title: 'Contato',
                paragraphs: [`Dúvidas, sugestões ou pedidos de remoção de conteúdo: ${CONTACT_EMAIL}.`],
            },
        ],
        en: [
            {
                title: 'About the site',
                paragraphs: [
                    'PokéTaverna is a free fan project with a Pokédex, a Hearthstone card library, daily challenges, duels and a deckbuilder. By using the site, you agree to these terms.',
                ],
            },
            {
                title: 'Trademarks',
                paragraphs: [
                    'Pokémon and all related names, images and marks belong to Nintendo, Game Freak and The Pokémon Company. Hearthstone, its cards and artwork belong to Blizzard Entertainment. The site is unofficial, not endorsed by these companies, and uses this material for informational and entertainment purposes only.',
                ],
            },
            {
                title: 'Your account',
                paragraphs: [
                    'You are responsible for your account and the username you choose. Offensive names, cheating in duels and automated use to abuse rankings may lead to account removal.',
                ],
            },
            {
                title: 'Ads and support',
                paragraphs: [
                    'The site may show ads and accept voluntary support to cover its costs. Ads are served by Google, and we are not responsible for the content of third-party sites.',
                ],
            },
            {
                title: 'No warranties',
                paragraphs: [
                    'The site is provided as is. Card data, reference decks and statistics may contain errors or become outdated, and features may change or go offline without notice.',
                ],
            },
            {
                title: 'Contact',
                paragraphs: [`Questions, suggestions or content removal requests: ${CONTACT_EMAIL}.`],
            },
        ],
    },
}
