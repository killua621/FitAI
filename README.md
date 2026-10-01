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
    training/                 Rotina de treino demonstrativa
    nutrition/                Sugestões de refeições e hidratação
    progress/                 Indicadores de evolução demonstrativos
    profile/                  Preferências do onboarding
  theme/                      Cores, tipografia, espaçamentos e raios
supabase/migrations/          Estrutura SQL e políticas de segurança (RLS)
render.yaml                   Build e publicação no Render
```

As abas ficam fixas na parte inferior. Início concentra os destaques e atalhos; Treino, Dieta e Evolução ainda exibem dados demonstrativos. O onboarding salva o perfil em `profiles`; a aba Dieta permite adicionar água em ml e mostra quanto falta para a meta diária de 2 L, com os registros salvos em `water_logs`. A sessão de login é persistida no dispositivo.

O tema padrão agora é escuro. A aba Treino gera sessões diferentes conforme objetivo, experiência e frequência semanal; Dieta adapta exemplos de refeições e apresenta o IMC adulto como triagem quando há dados suficientes. Os critérios e fontes estão em `docs/training-nutrition-methodology.md`.

## Supabase

O esquema inicial está em `supabase/migrations/202609300001_initial_user_data.sql`; a tabela de hidratação foi adicionada em `supabase/migrations/202609300002_water_logs.sql`. Ambos já foram aplicados ao projeto FitAI. Cada tabela tem RLS habilitado e políticas `SELECT`, `INSERT`, `UPDATE` e `DELETE` limitadas ao usuário proprietário. A chave `publishable` do app pode ser incluída em `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; nunca coloque uma chave `secret` ou `service_role` no aplicativo.
