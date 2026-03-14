# Anexai — AI SaaS Production

> Premium AI SaaS platform with dark glassmorphism UI, Gemini 1.5 Flash code generation, Supabase auth, and GitHub push integration.

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, glassmorphism UI (Electric Purple `#8b5cf6`, background `#030712`)
- **Backend**: Express API server, OpenAPI contract, auto-generated type-safe client
- **Auth**: Supabase (email/password, profiles table)
- **AI**: Google Gemini 1.5 Flash for project scaffolding
- **Database**: PostgreSQL via Drizzle ORM (`projects` table, `nexa_settings` key/value store)
- **GitHub**: Push generated project code via GitHub Contents API

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Supabase email/password auth |
| `/dashboard` | Overview with stats |
| `/projects` | All generated AI projects |
| `/projects/new` | AI project generator (Gemini) |
| `/projects/:id` | Project detail + GitHub push |
| `/admin` | API key management (Gemini + GitHub tokens stored in DB) |

## Setup

1. Clone the repo
2. `pnpm install`
3. Add `.env` with Supabase credentials
4. `pnpm --filter @workspace/db run db:push` — sync DB schema
5. `pnpm --filter @workspace/api-server run dev` — start API
6. `pnpm --filter @workspace/anexai run dev` — start frontend
7. Open `/admin` after logging in to add your Gemini API key

## Admin Panel

Navigate to `/admin` after logging in. Add your:
- **Google Gemini API Key** — enables AI project generation
- **GitHub Personal Access Token** — enables pushing generated code to GitHub

Keys are stored securely in the database (not in `.env`).
