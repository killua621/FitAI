# FitAI

MVP em Expo, React Native, TypeScript e Expo Router, conectado ao Supabase. Inclui boas-vindas, criação de conta/login, onboarding em quatro etapas e cinco abas: Início, Treino, Dieta, Evolução e Perfil. O perfil e os registros de hidratação são salvos por conta. Metas, sessões de treino, alimentação e métricas já têm tabelas preparadas com políticas de acesso por usuário.

## Requisitos

- Node.js LTS
- npm (incluído com o Node.js)
- Expo Go no celular ou um emulador Android/iOS
- Projeto Supabase configurado em `.env.local`

## Executar no Windows

Abra o PowerShell nesta pasta e rode:

```powershell
npm.cmd install
npx.cmd expo install --fix
npx.cmd expo start --web
```

As credenciais locais estão em `.env.local`, ignorado pelo Git. Use `.env.example` como modelo caso configure outro projeto Supabase. Depois de alterar essas variáveis, reinicie o Expo para carregá-las.

## Publicar no Render

O endereço `localhost` só funciona no computador onde o Expo está rodando. Para compartilhar uma versão pública, envie este projeto a um repositório GitHub. No Render, escolha **New → Blueprint**, conecte o repositório e o Render usará o `render.yaml` para criar um site estático. A configuração instala as dependências, gera a versão web com `npm run web:build` e publica a pasta `dist`.

Na criação do Blueprint, informe estas variáveis quando o Render solicitar:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Depois do primeiro deploy, configure a URL `onrender.com` como `Site URL` e inclua-a em `Redirect URLs` na configuração de URLs do Supabase Auth. Nunca configure a chave `secret` ou `service_role` no frontend.

Para abrir no celular, troque a última linha por `npx.cmd expo start` e escaneie o QR code com o Expo Go. O atalho `a` abre o Android conectado. No servidor, `w` abre a versão web.

## Estrutura

```text
app/                         Rotas Expo Router
  index.tsx                  Boas-vindas
  auth.tsx                   Entrar e criar conta
  onboarding.tsx              Onboarding
  home.tsx                    Início / visão geral
  workout.tsx                 Treino
  nutrition.tsx               Dieta
  progress.tsx                Evolução
  profile.tsx                 Perfil
src/
  components/                 Botões, cartões, navegação e layout de tela
  lib/                        Cliente Supabase
  features/
    auth/                     Sessão, perfil autenticado e formulário de acesso
    onboarding/               Etapas e opções do onboarding
    home/                     Resumo principal
    training/                 Gerador de sessões por frequência e objetivo
    nutrition/                Orientação por objetivo, refeições e hidratação
    progress/                 Indicadores de evolução demonstrativos
    profile/                  Preferências do onboarding
  theme/                      Cores, tipografia, espaçamentos e raios
supabase/migrations/          Estrutura SQL e políticas de segurança (RLS)
render.yaml                   Build e publicação no Render
```

As abas ficam fixas na parte inferior. Início mostra o resumo semanal real e permite registrar um check-in por dia; Treino gera sessões diferentes conforme objetivo, experiência e frequência; Dieta adapta princípios e exemplos ao objetivo; Evolução ainda usa indicadores demonstrativos. O onboarding salva idade, altura, peso, atividade diária e dias escolhidos. O registro de água aceita valores livres em ml; a meta inicial para adultos com peso informado é uma estimativa editável do FitAI (peso × 30 ml, com limites), não uma recomendação oficial.

O tema padrão agora é escuro. A aba Treino gera sessões diferentes conforme objetivo, experiência e frequência semanal; Dieta apresenta IMC apenas como triagem e uma faixa educativa de manutenção para adultos elegíveis com informações completas. O app não converte essa faixa em dieta, déficit ou superávit. Os critérios e fontes estão em `docs/training-nutrition-methodology.md`.

## Supabase

O esquema inicial está em `supabase/migrations/202609300001_initial_user_data.sql`; a hidratação foi adicionada em `supabase/migrations/202609300002_water_logs.sql`; e a personalização/check-in está em `supabase/migrations/202610010003_personalization_checkins.sql`. A terceira migração foi aplicada ao projeto FitAI. As tabelas de dados pessoais usam RLS e políticas limitadas ao usuário autenticado. A chave `publishable` do app pode ser incluída em `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; nunca coloque uma chave `secret` ou `service_role` no aplicativo.
