# Workspace

## Overview

Anexai is an AI SaaS platform built on a pnpm workspace monorepo using TypeScript. It lets users generate complete code projects using Gemini 1.5 Flash and push them to GitHub.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/anexai) — dark glassmorphism theme with Electric Purple (#8b5cf6)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM (local Replit DB)
- **Authentication**: Supabase (email/password auth, profiles table)
- **AI**: Google Gemini 1.5 Flash (key stored in nexa_settings DB table)
- **GitHub Integration**: GitHub REST API (token stored in nexa_settings DB table)
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)

## Structure

```text
artifacts/
├── api-server/             # Express API server
│   └── src/
│       ├── lib/supabaseAdmin.ts  # Supabase auth helper (lazy init, handles swapped env var names)
│       ├── routes/settings.ts   # Admin-only: GET/POST /api/settings (Gemini + GitHub keys)
│       └── routes/projects.ts   # CRUD + GitHub push: /api/projects/*
├── anexai/                 # React frontend
│   └── src/
│       ├── lib/supabase.ts       # Supabase client (lazy init with fallback)
│       ├── lib/auth-context.tsx  # AuthProvider + useAuth hook
│       ├── components/layout/AppLayout.tsx  # Sidebar + header with admin shield icon
│       └── pages/
│           ├── Login.tsx         # Sign in / Sign up
│           ├── Dashboard.tsx     # Stats + recent projects
│           ├── Projects.tsx      # My Projects grid
│           ├── NewProject.tsx    # AI project generator form
│           ├── ProjectDetail.tsx # File tree + code viewer + GitHub push
│           └── Admin.tsx         # Admin-only: manage Gemini + GitHub keys
lib/
├── api-spec/openapi.yaml   # Source of truth for API contract
├── api-client-react/       # Generated React Query hooks
│   └── src/
│       ├── custom-fetch.ts       # Injects Supabase auth token on every request
│       └── supabase-session.ts   # Helper to retrieve Supabase JWT
├── api-zod/                # Generated Zod schemas
└── db/
    └── src/schema/projects.ts    # projects + nexa_settings tables
```

## Key Implementation Details

### Supabase Env Vars
The secrets `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may be stored swapped (Replit). Both the frontend (vite.config.ts define block) and backend (supabaseAdmin.ts) auto-detect which is the URL vs the key by checking if the value starts with `https` or `ey`.

### Authentication Flow
1. User signs in/up via Supabase on the frontend
2. Supabase issues a JWT access token
3. The custom fetch wrapper in api-client-react automatically injects the JWT as `Authorization: Bearer <token>`
4. API routes call `getUserFromToken()` to validate the token against Supabase
5. Admin routes also call `getUserRole()` to check the `profiles.role` field

### Admin Access
- Users with `role: 'admin'` in the Supabase `profiles` table can access `/admin`
- The red ShieldAlert icon appears in the header for admins
- Admins can store/update `GEMINI_API_KEY` and `GITHUB_TOKEN` in the `nexa_settings` table
- AI and GitHub features fetch keys from the DB, not from .env

### Database Tables (Replit PostgreSQL)
- `projects` — user's generated AI projects (id, userId, name, description, prompt, techStack, files jsonb, githubUrl)
- `nexa_settings` — key/value store for admin settings (GEMINI_API_KEY, GITHUB_TOKEN)

### Supabase Tables (external)
- `profiles` — one row per user (id = auth.uid(), role: 'user'|'admin')

## Root Scripts

- `pnpm run build` — typecheck + build all packages
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client from openapi.yaml
- `pnpm --filter @workspace/db run push` — push DB schema changes

## Design System
- Background: `#030712` (deep dark)
- Primary: Electric Purple `hsl(263 70% 61%)` / `#8b5cf6`
- Cards: Glassmorphism (`bg-white/5`, `backdrop-blur-lg`, `border border-white/10`)
- Accent glow: Purple radial gradient ambient background
- Font: Inter (display), system monospace for code
