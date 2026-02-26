# Plano Pace — Treinador Virtual de Corrida

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
- Cada módulo: controller + service + dto
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
