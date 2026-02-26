# 🏃 RunAI — Prompt Completo para Claude Code

> **Instrução:** Cole este prompt inteiro no Claude Code para iniciar o projeto. Ele vai criar toda a estrutura, configurar o ambiente, e implementar o MVP funcional do zero.

---

## 📋 PROMPT PRINCIPAL (cole no Claude Code)

```
Você é o lead engineer do RunAI, um SaaS B2C de treinador virtual autônomo de corrida. Vou te dar a spec completa. Leia TUDO antes de escrever qualquer código. Depois, execute fase por fase, commitando a cada fase concluída.

---

# RUNAI — SPEC COMPLETA DO MVP

## 1. VISÃO DO PRODUTO

RunAI é um SaaS brasileiro que gera planilhas de corrida personalizadas com IA, conecta com Strava/Garmin para importar dados reais do atleta, e cria um perfil evolutivo com métricas em tempo real. O diferencial é: zero assessoria humana — a IA é o treinador.

### Público-alvo
- Corredores amadores e intermediários brasileiros (25-45 anos)
- Que já usam Strava ou apps de corrida
- Que querem evoluir pace/distância mas não querem pagar R$200+/mês de assessoria

### Modelo de negócio
Assinatura mensal, 3 tiers:
- **Starter** R$19,90/mês — planilha mensal IA + sync Strava + dashboard básico
- **Pro** R$34,90/mês — tudo do Starter + ajustes semanais automáticos + métricas avançadas (TSS/CTL/ATL) + preparação para provas
- **Elite** R$49,90/mês — tudo do Pro + detecção overtraining + previsão de pace + periodização inteligente + suporte chat

---

## 2. STACK TÉCNICA (use exatamente estas tecnologias)

### Monorepo com Turborepo
```
runai/
├── apps/
│   ├── web/          # Next.js 15 (App Router) — frontend
│   └── api/          # NestJS 11 — backend API
├── packages/
│   ├── database/     # Prisma + PostgreSQL schemas
│   ├── shared/       # Types, utils, constantes compartilhadas
│   └── ui/           # Componentes React reutilizáveis
├── turbo.json
├── package.json
├── CLAUDE.md
└── docker-compose.yml
```

### Frontend (apps/web)
- Next.js 15 com App Router e Server Components
- TypeScript strict mode
- Tailwind CSS v4
- Zustand para state management
- Recharts para gráficos de evolução
- next-auth v5 para autenticação (Google + Email magic link)
- Framer Motion para animações

### Backend (apps/api)
- NestJS 11 com TypeScript strict
- Prisma ORM com PostgreSQL
- Bull + Redis para filas (geração de treinos async)
- Passport.js para auth
- Class-validator para DTOs
- Swagger/OpenAPI auto-generated

### Integrações
- **Strava API v3:** usar `strava-v3` npm package para OAuth2 + webhooks de atividades
- **Claude API (Anthropic):** usar `@anthropic-ai/sdk` para gerar treinos personalizados
- **Stripe:** pagamentos com suporte a Pix via Stripe Brazil
- **Resend:** emails transacionais (welcome, treino gerado, resumo semanal)

### Infra
- Docker Compose para dev local (postgres + redis)
- Vercel para frontend
- Railway ou Render para API
- Neon ou Supabase para PostgreSQL managed

---

## 3. DATABASE SCHEMA (Prisma)

Crie o schema Prisma com estas entidades:

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum PlanTier {
  STARTER
  PRO
  ELITE
}

enum RunType {
  EASY
  INTERVALS
  TEMPO
  LONG_RUN
  REST
  RACE
  TEST
}

enum GoalType {
  PACE
  DISTANCE
  RACE_5K
  RACE_10K
  RACE_HALF
  RACE_MARATHON
  GENERAL_FITNESS
}

model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  image           String?
  plan            PlanTier  @default(STARTER)
  stripeCustomerId String?  @unique
  stripeSubId     String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  profile         AthleteProfile?
  stravaAccount   StravaAccount?
  runs            Run[]
  trainingPlans   TrainingPlan[]
  weeklyPlans     WeeklyPlan[]
  metrics         MetricSnapshot[]
}

model AthleteProfile {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  age             Int?
  weight          Float?    // kg
  height          Float?    // cm
  experienceYears Float?
  currentPace     Float?    // min/km as decimal (5.33 = 5:20/km)
  goalType        GoalType  @default(PACE)
  goalValue       String?   // ex: "sub-5:00" or "10km" or "2025-06-15 prova X"
  weeklyDays      Int       @default(3)
  vdot            Float?
  maxHr           Int?
  restHr          Int?
  updatedAt       DateTime  @updatedAt
}

model StravaAccount {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stravaId        Int       @unique
  accessToken     String
  refreshToken    String
  expiresAt       Int
  scope           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Run {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  stravaActivityId BigInt?  @unique
  date            DateTime
  distanceKm      Float
  durationSeconds Int
  paceAvg         Float     // min/km decimal
  paceMax         Float?
  heartRateAvg    Int?
  heartRateMax    Int?
  cadenceAvg      Int?
  elevationGain   Float?
  calories        Int?
  type            RunType   @default(EASY)
  source          String    @default("strava") // strava, manual, garmin
  polyline        String?   // encoded polyline
  splits          Json?     // km splits array
  notes           String?
  createdAt       DateTime  @default(now())

  @@index([userId, date])
}

model TrainingPlan {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  month           Int       // 1-12
  year            Int
  goalType        GoalType
  goalValue       String?
  totalWeeks      Int       @default(4)
  generatedBy     String    @default("claude") // claude, manual
  aiPromptUsed    String?   @db.Text
  aiResponseRaw   String?   @db.Text
  status          String    @default("active") // active, completed, cancelled
  createdAt       DateTime  @default(now())

  weeklyPlans     WeeklyPlan[]

  @@unique([userId, month, year])
}

model WeeklyPlan {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  trainingPlanId  String
  trainingPlan    TrainingPlan @relation(fields: [trainingPlanId], references: [id], onDelete: Cascade)
  weekNumber      Int
  startDate       DateTime
  endDate         DateTime
  status          String    @default("upcoming") // upcoming, active, completed

  workouts        Workout[]

  @@index([userId, startDate])
}

model Workout {
  id              String    @id @default(cuid())
  weeklyPlanId    String
  weeklyPlan      WeeklyPlan @relation(fields: [weeklyPlanId], references: [id], onDelete: Cascade)
  dayOfWeek       Int       // 0=domingo, 1=segunda...6=sábado
  type            RunType
  title           String    // "Corrida leve", "Tiros 800m"
  description     String    @db.Text
  targetDistanceKm Float?
  targetPaceMin   Float?    // pace alvo min (range)
  targetPaceMax   Float?    // pace alvo max (range)
  targetDurationMin Int?    // duração em minutos
  warmupMin       Int?
  cooldownMin     Int?
  intervals       Json?     // { reps: 6, distanceM: 800, paceTarget: 4.5, restSeconds: 120 }
  completed       Boolean   @default(false)
  matchedRunId    String?   // link para Run real que corresponde

  @@index([weeklyPlanId, dayOfWeek])
}

model MetricSnapshot {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  date            DateTime
  ctl             Float?    // Chronic Training Load (fitness)
  atl             Float?    // Acute Training Load (fatigue)
  tsb             Float?    // Training Stress Balance (form)
  weeklyKm        Float?
  avgPace         Float?
  vdot            Float?
  runCount        Int?
  createdAt       DateTime  @default(now())

  @@unique([userId, date])
  @@index([userId, date])
}
```

---

## 4. API ENDPOINTS (NestJS)

Crie estes módulos NestJS com controllers, services, e DTOs:

### Auth Module (`/api/auth`)
- `POST /auth/register` — registro com email + senha ou magic link
- `POST /auth/login` — login email/senha
- `GET /auth/google` — OAuth Google redirect
- `GET /auth/google/callback` — callback
- `GET /auth/strava` — inicia OAuth Strava (redirect para strava.com/oauth/authorize)
- `GET /auth/strava/callback` — recebe code, troca por tokens, salva StravaAccount
- `POST /auth/strava/webhook` — webhook subscription endpoint (verificação GET + eventos POST)
- `POST /auth/refresh` — refresh JWT token

### Users Module (`/api/users`)
- `GET /users/me` — perfil do usuário logado
- `PATCH /users/me` — atualizar perfil
- `GET /users/me/profile` — AthleteProfile
- `PUT /users/me/profile` — criar/atualizar AthleteProfile

### Runs Module (`/api/runs`)
- `GET /runs` — listar corridas (paginado, filtros por data/tipo)
- `GET /runs/:id` — detalhe de uma corrida
- `POST /runs` — adicionar corrida manual
- `POST /runs/sync` — trigger sync manual com Strava (busca atividades recentes)
- `GET /runs/stats` — estatísticas agregadas (total km, avg pace, etc)

### Training Module (`/api/training`)
- `POST /training/generate` — gerar plano mensal com IA (async via Bull queue)
- `GET /training/current` — plano ativo atual
- `GET /training/:id` — detalhe do plano
- `GET /training/:id/weeks` — semanas do plano
- `GET /training/:id/weeks/:weekId` — workouts da semana
- `PATCH /training/workouts/:id/complete` — marcar workout como feito

### Metrics Module (`/api/metrics`)
- `GET /metrics/evolution` — série temporal de métricas (CTL, ATL, TSB, pace, km)
- `GET /metrics/current` — snapshot mais recente
- `POST /metrics/calculate` — recalcular métricas (cron job diário)

### AI Module (`/api/ai`)
- `POST /ai/generate-plan` — chama Claude API para gerar plano de treino
- `POST /ai/weekly-adjustment` — ajuste semanal baseado em dados reais (plano Pro+)
- `POST /ai/insight` — gerar insight/análise (plano Elite)
- `POST /ai/race-prediction` — previsão de tempo de prova (plano Elite)

### Billing Module (`/api/billing`)
- `POST /billing/checkout` — criar Stripe Checkout Session
- `POST /billing/webhook` — Stripe webhook (subscription events)
- `GET /billing/portal` — link para Stripe Customer Portal
- `GET /billing/status` — status da assinatura

---

## 5. INTEGRAÇÃO STRAVA (detalhe)

### OAuth Flow
1. Frontend redireciona para: `https://www.strava.com/oauth/authorize?client_id={ID}&response_type=code&redirect_uri={CALLBACK}&scope=read,activity:read_all&approval_prompt=auto`
2. Callback recebe `code`, chama `POST https://www.strava.com/oauth/token` para trocar por access_token + refresh_token
3. Salva tokens na tabela StravaAccount
4. Token refresh automático quando expirado (middleware/interceptor)

### Webhook Subscription
- Registrar webhook via API Strava para receber eventos de novas atividades
- Endpoint `GET /auth/strava/webhook` responde ao challenge de verificação
- Endpoint `POST /auth/strava/webhook` recebe evento, verifica se é `activity.create`, busca detalhes via API e salva como Run

### Sync de Atividades
- Na conexão inicial: buscar últimas 30 atividades via `GET /athlete/activities`
- Mapear campos: `distance` (m→km), `moving_time` (s), `average_speed` (m/s→min/km), `average_heartrate`, `total_elevation_gain`, `map.summary_polyline`
- Calcular `paceAvg` = (durationSeconds / 60) / distanceKm

---

## 6. GERAÇÃO DE TREINOS COM CLAUDE API

### Prompt Engineering para Geração de Planos

Quando o usuário pede um novo plano mensal, montar este prompt para Claude:

```
System: Você é um treinador de corrida certificado com 15 anos de experiência em periodização esportiva. Você usa a metodologia VDOT de Jack Daniels para calcular zonas de treino. Responda APENAS em JSON válido, sem markdown, sem explicações.

User: Gere um plano de treino mensal (4 semanas) para este atleta:

PERFIL:
- Idade: {age} anos
- Pace médio atual: {currentPace} min/km
- VDOT estimado: {vdot}
- Experiência: {experienceYears} anos de corrida
- Dias disponíveis: {weeklyDays}/semana
- Objetivo: {goalType} — {goalValue}
- Ambiente: rua/parque (sem esteira)

HISTÓRICO RECENTE (últimas 4 semanas):
- Km/semana médio: {avgWeeklyKm}
- Pace médio: {avgPace}
- Corridas/semana: {avgRunsPerWeek}
- CTL atual: {ctl}
- ATL atual: {atl}
- TSB atual: {tsb}

ZONAS DE PACE (baseado no VDOT {vdot}):
- Easy: {easyPaceMin}-{easyPaceMax} min/km
- Tempo: {tempoPaceMin}-{tempoPaceMax} min/km
- Interval: {intervalPaceMin}-{intervalPaceMax} min/km
- Repetition: {repPaceMin}-{repPaceMax} min/km
- Long Run: {longRunPaceMin}-{longRunPaceMax} min/km

Responda com este JSON:
{
  "planSummary": "resumo do plano em 2 frases",
  "weeklyIncrease": "percentual de aumento semanal de carga",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "nome da semana (ex: Base & Adaptação)",
      "totalKm": 22.5,
      "tip": "dica da semana",
      "workouts": [
        {
          "dayOfWeek": 1,
          "type": "EASY|INTERVALS|TEMPO|LONG_RUN|REST|RACE|TEST",
          "title": "nome curto",
          "description": "descrição detalhada com paces específicos e tempos",
          "targetDistanceKm": 5.0,
          "targetPaceMin": 5.40,
          "targetPaceMax": 5.55,
          "targetDurationMin": 30,
          "warmupMin": 10,
          "cooldownMin": 10,
          "intervals": null
        }
      ]
    }
  ]
}
```

### Ajuste Semanal (Plano Pro+)
- Todo domingo à noite (cron), comparar workouts planejados vs runs reais da semana
- Se aderência < 70% ou pace real muito diferente do planejado, chamar Claude para ajustar a próxima semana
- Prompt inclui: "O atleta executou X de Y treinos planejados. Os dados reais foram: [...]  Ajuste a semana {N+1} considerando que [estava mais cansado/mais rápido/pulou treinos]."

### Cálculo VDOT
Implementar a fórmula de Jack Daniels para estimar VDOT:
- Input: melhor corrida recente (distância + tempo)
- Usar tabela de lookup ou fórmula: VDOT = f(velocidade, distância)
- Fórmula aproximada: `vdot = -4.6 + 0.182258 * velocity + 0.000104 * velocity²` onde velocity = m/min

### Cálculo TSS/CTL/ATL/TSB
- **TSS (Training Stress Score):** `(duration_seconds * NGP * IF) / (FTP * 3600) * 100`
  - Simplificado para corrida: `TSS = (duration_min * intensity²) / normalizador`
  - Intensity = pace_alvo / pace_real (relativo ao threshold)
- **CTL (Chronic Training Load / Fitness):** média exponencial 42 dias do TSS diário
- **ATL (Acute Training Load / Fatigue):** média exponencial 7 dias do TSS diário
- **TSB (Training Stress Balance / Form):** CTL - ATL

---

## 7. FRONTEND — PAGES E COMPONENTES

### Pages (App Router)
```
apps/web/app/
├── (marketing)/
│   ├── page.tsx                    # Landing page
│   └── precos/page.tsx             # Página de preços
├── (auth)/
│   ├── login/page.tsx              # Login
│   ├── registro/page.tsx           # Registro
│   └── callback/strava/page.tsx    # Callback OAuth Strava
├── (app)/                          # Layout autenticado (sidebar/navbar)
│   ├── layout.tsx                  # App shell com bottom nav mobile
│   ├── dashboard/page.tsx          # Home — stats, treino do dia, insight IA
│   ├── treino/
│   │   ├── page.tsx                # Plano semanal atual
│   │   └── [planId]/page.tsx       # Detalhe do plano mensal
│   ├── evolucao/page.tsx           # Gráficos evolução (pace, km, CTL, ATL, TSB)
│   ├── corridas/
│   │   ├── page.tsx                # Lista de corridas
│   │   └── [runId]/page.tsx        # Detalhe da corrida
│   ├── perfil/page.tsx             # Perfil + integrações + assinatura
│   └── configuracoes/page.tsx      # Settings
└── api/                            # Route handlers (proxy para API NestJS ou auth callbacks)
```

### Design System
- Dark theme principal: bg `#0A0A0B`, cards `#141415`, borders `rgba(255,255,255,0.06)`
- Accent colors: Orange `#F97316` (primary), Red `#EF4444`, Purple `#A855F7` (IA), Green `#22C55E` (positivo)
- Font: "DM Sans" do Google Fonts (fallback: system-ui)
- Border radius: 16px cards, 12px buttons, 8px inputs
- Mobile-first: max-width 480px para app, responsivo para desktop
- Animações com Framer Motion: page transitions, staggered lists, count-up numbers
- Bottom navigation mobile com 4 tabs: Home, Treino, Evolução, Perfil

### Componentes-chave para criar
1. **StatCard** — card de métrica com ícone, valor, trend, mini sparkline
2. **WorkoutCard** — card de treino do dia com tipo colorido, pace alvo, distância
3. **WeeklyPlanView** — lista de 7 dias com status (done/today/upcoming)
4. **EvolutionChart** — gráfico Recharts (pace, volume, fitness) com range selector
5. **AIInsightCard** — card roxo com ícone de cérebro e texto de insight
6. **StravaConnectButton** — botão laranja para iniciar OAuth
7. **PlanCard** — card de plano de preço com features e CTA
8. **RunListItem** — item de corrida com distance, pace, duration, type badge
9. **GenerateTrainingButton** — botão que triggera geração IA com progress bar
10. **MetricGauge** — gauge circular para CTL/ATL/TSB

---

## 8. ENV VARS NECESSÁRIAS

Crie um `.env.example` com:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/runai

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-jwt-secret-here
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Strava
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
STRAVA_REDIRECT_URI=http://localhost:3000/callback/strava
STRAVA_WEBHOOK_VERIFY_TOKEN=your-random-verify-token

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ELITE_PRICE_ID=price_xxx

# Resend (email)
RESEND_API_KEY=re_xxx
EMAIL_FROM=RunAI <noreply@runai.com.br>

# App
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 9. DOCKER COMPOSE (dev local)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: runai
      POSTGRES_USER: runai
      POSTGRES_PASSWORD: runai123
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  postgres_data:
```

---

## 10. EXECUÇÃO — FASES

Execute na seguinte ordem, commitando ao final de cada fase:

### FASE 1: Scaffolding (commit: "feat: initial project scaffolding")
1. Inicializar monorepo com Turborepo
2. Criar apps/web (Next.js 15), apps/api (NestJS 11), packages/*
3. Configurar TypeScript, ESLint, Prettier compartilhados
4. Criar docker-compose.yml
5. Criar .env.example
6. Criar CLAUDE.md na raiz com instruções do projeto
7. `git init && git add . && git commit`

### FASE 2: Database (commit: "feat: database schema and prisma setup")
1. Criar schema Prisma completo (copiar schema acima)
2. Configurar Prisma Client no package database
3. Rodar `docker compose up -d` e `npx prisma db push`
4. Criar seed com dados de exemplo (1 user, 20 runs, 1 training plan)

### FASE 3: Auth (commit: "feat: authentication with JWT, Google, and Strava OAuth")
1. Implementar auth module NestJS (JWT + refresh tokens)
2. Implementar OAuth Strava (authorize → callback → save tokens)
3. Implementar NextAuth no frontend (Google + credentials)
4. Middleware de auth no NestJS (guard)
5. Endpoint de webhook Strava (GET verify + POST events)

### FASE 4: Core API (commit: "feat: runs, training, metrics API endpoints")
1. Módulo Runs — CRUD + sync Strava + stats
2. Módulo Training — CRUD plans + weeks + workouts
3. Módulo Metrics — cálculos VDOT, TSS, CTL, ATL, TSB
4. Módulo AI — integração Claude API para geração de treinos
5. Bull queues para jobs async (sync strava, generate plan, calculate metrics)
6. Swagger setup automático

### FASE 5: Frontend Marketing (commit: "feat: landing page and pricing")
1. Landing page com hero, features, social proof, CTA
2. Página de preços com 3 planos
3. Header/Footer marketing
4. SEO meta tags, OpenGraph

### FASE 6: Frontend App (commit: "feat: authenticated app with dashboard")
1. Layout autenticado com bottom nav mobile
2. Dashboard — stats grid, treino do dia, insight IA, corridas recentes
3. Página Treino — plano semanal, gerar treino IA, visão mensal
4. Página Evolução — gráficos pace, volume, fitness com Recharts
5. Página Perfil — dados atleta, integrações, assinatura
6. Página Corridas — lista + detalhe

### FASE 7: Billing (commit: "feat: stripe billing integration")
1. Stripe checkout session creation
2. Webhook handler (subscription.created, updated, deleted)
3. Customer portal link
4. Middleware de plano (verificar tier para features)

### FASE 8: Polish (commit: "feat: animations, loading states, error handling")
1. Framer Motion transitions entre páginas
2. Skeleton loaders
3. Error boundaries
4. Toast notifications
5. Empty states bonitos
6. PWA manifest + service worker básico

---

## 11. REGRAS IMPORTANTES

- **TypeScript strict** em todo o projeto. Zero `any`.
- **Nunca use CommonJS** (require). Sempre ES modules (import/export).
- **Componentes funcionais** com hooks. Zero class components.
- **Nomenclatura em inglês** no código. UI/textos em português brasileiro.
- **Validação** em TODOS os endpoints (class-validator no NestJS, zod no frontend).
- **Error handling** consistente: try/catch em services, HttpException no NestJS, error boundaries no React.
- **Responsive** mobile-first. Testar em 375px (iPhone SE) e 1440px (desktop).
- **Commits convencionais**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- **Não instale libs desnecessárias.** Se pode fazer com o que já tem, faça.
- **Seed realista.** O seed deve criar dados que pareçam reais para demo.

---

## 12. CLAUDE.md DO PROJETO (criar na raiz)

Crie este arquivo como CLAUDE.md na raiz do projeto:

```markdown
# RunAI — Treinador Virtual de Corrida

## O que é
SaaS B2C brasileiro que gera treinos de corrida com IA (Claude API) + sync Strava.

## Stack
- Monorepo Turborepo: apps/web (Next.js 15) + apps/api (NestJS 11)
- Database: PostgreSQL + Prisma (packages/database)
- Queue: Bull + Redis
- Auth: JWT + NextAuth (Google, Strava OAuth)

## Comandos
- `pnpm dev` — roda tudo (turbo dev)
- `pnpm --filter web dev` — só frontend
- `pnpm --filter api dev` — só backend
- `pnpm db:push` — sync schema Prisma
- `pnpm db:seed` — seed de dados
- `pnpm db:studio` — Prisma Studio
- `pnpm lint` — ESLint em tudo
- `pnpm typecheck` — TypeScript check
- `docker compose up -d` — sobe postgres + redis

## Code Style
- TypeScript strict, zero `any`
- ES modules (import/export), nunca CommonJS
- Functional components com hooks
- Tailwind para styling, sem CSS modules
- Nomenclatura em inglês no código, UI em pt-BR

## Arquitetura API (NestJS)
- Cada módulo: controller + service + dto + entity
- Guards para auth (JwtAuthGuard)
- Interceptors para transform response
- Pipes para validation (ValidationPipe global)

## Arquitetura Frontend (Next.js)
- App Router com Server Components onde possível
- Client components apenas quando precisa de interatividade
- Zustand stores em apps/web/stores/
- API calls via fetch em apps/web/lib/api.ts

## Verificação
- Sempre rodar `pnpm typecheck` após mudanças
- Testar endpoints via Swagger em http://localhost:3333/api/docs
```

Agora execute a FASE 1. Quando terminar, me avise e siga para a FASE 2.
```

---

## 🛠️ ARQUIVOS AUXILIARES

### `.claude/commands/generate-component.md`
Após o projeto estar criado, crie este custom command:

```markdown
Crie um novo componente React em apps/web/components/$ARGUMENTS.tsx seguindo:
1. TypeScript com interface de Props explícita
2. Export default
3. Tailwind CSS para styling (dark theme: bg-[#141415])
4. Framer Motion para animações de entrada
5. Responsivo mobile-first
```

### `.claude/commands/new-endpoint.md`
```markdown
Crie um novo endpoint NestJS para $ARGUMENTS:
1. Criar/atualizar controller com decorator correto (@Get, @Post, etc)
2. Criar/atualizar service com lógica de negócio
3. Criar DTO com class-validator decorators
4. Adicionar ao module (imports/providers)
5. Documentar com @ApiTags e @ApiOperation do Swagger
6. Rodar typecheck após criar
```

### `.claude/commands/sync-strava.md`
```markdown
Debugar/testar integração Strava:
1. Verificar tokens em StravaAccount (expirado?)
2. Se expirado, fazer refresh via POST /oauth/token
3. Testar GET /athlete/activities com token válido
4. Mapear resposta para nosso schema Run
5. Logar erros detalhados
```

---

## 📊 RESUMO VISUAL DA ARQUITETURA

```
┌──────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                │
│  Landing • Pricing • Dashboard • Treino • Evolução       │
│  Auth (NextAuth) • Zustand • Recharts • Framer Motion    │
└────────────────────────┬─────────────────────────────────┘
                         │ REST API calls
┌────────────────────────▼─────────────────────────────────┐
│                     BACKEND (NestJS 11)                   │
│  Auth • Users • Runs • Training • Metrics • AI • Billing │
│  JWT Guards • Swagger • Class-validator                   │
├──────────┬──────────┬───────────┬────────────────────────┤
│ Prisma   │ Bull     │ Strava    │ Claude API             │
│ ORM      │ Queue    │ OAuth +   │ Geração de treinos     │
│          │ (Redis)  │ Webhooks  │ + Insights + Predição  │
└────┬─────┴────┬─────┴─────┬─────┴──────────┬─────────────┘
     │          │           │                │
┌────▼────┐ ┌──▼──┐ ┌──────▼──────┐  ┌──────▼──────┐
│PostgreSQL│ │Redis│ │ Strava API  │  │Anthropic API│
│  (Neon)  │ │     │ │   v3        │  │  (Claude)   │
└──────────┘ └─────┘ └─────────────┘  └─────────────┘
                           │
                    ┌──────▼──────┐
                    │   Stripe    │
                    │  (Billing)  │
                    └─────────────┘
```

---

## 🚀 COMO USAR

1. Abra o terminal no diretório onde quer criar o projeto
2. Execute `claude` para abrir o Claude Code
3. Cole o **PROMPT PRINCIPAL** (seção acima) inteiro
4. O Claude Code vai executar fase por fase
5. A cada fase, revise o código e aprove os commits
6. Após a Fase 8, você terá um MVP funcional completo

### Dicas para melhor resultado:
- Use `/compact` se o contexto ficar grande entre fases
- Se Claude travar em alguma fase, diga: "Continue da FASE X"
- Use subagents para pesquisa: "Use subagents para investigar como implementar o webhook do Strava"
- Após terminar, rode `/init` para atualizar o CLAUDE.md com o estado real do projeto
