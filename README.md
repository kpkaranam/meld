# Meld

**Tasks and notes, unified.** A fast, clean productivity app that treats tasks and notes as equal citizens in one system.

Built with [FISHI](https://github.com/kpkaranam/fishi) orchestration engine.

## Features

- **Task Management** — Create, edit, complete tasks with priorities and due dates
- **Rich Notes** — TipTap-powered editor with formatting, auto-save
- **Projects** — Organize tasks and notes with custom colors
- **Tags** — Cross-project labeling shared across tasks and notes
- **Full-Text Search** — Ctrl+K to search across everything
- **Today View** — See due and overdue tasks at a glance
- **Inbox** — Quick capture, organize later
- **Dark Mode** — Light/dark/system theme synced across devices
- **Mobile Responsive** — Works on desktop and mobile browsers
- **PWA** — Installable on mobile home screens
- **Accessible** — WCAG 2.1 AA compliant

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Editor | TipTap (ProseMirror) |
| State | Zustand (UI) + TanStack Query (server) |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Deployment | Vercel + Supabase Cloud |

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works)

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/kpkaranam/meld.git
   cd meld
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase project URL and anon key.

3. **Set up the database**
   - Go to your Supabase Dashboard > SQL Editor
   - Run `supabase/migrations/0001_initial_schema.sql`
   - Enable Google OAuth in Authentication > Providers (optional)

4. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## Architecture

```
src/
  components/     # UI components by feature (tasks, notes, projects, tags, search, auth, layout, shared)
  pages/          # Route-level components (lazy-loaded)
  services/       # Supabase service layer (no direct DB calls from components)
  hooks/          # TanStack Query hooks + utilities
  stores/         # Zustand stores (UI state only)
  types/          # TypeScript types
  utils/          # Helpers (dates, priorities, cn)
  lib/            # Supabase client, TipTap config, QueryClient
```

## License

MIT
