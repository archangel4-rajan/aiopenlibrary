# AIOpenLibrary

**The Wikipedia for Prompts** — An open library for discovering, learning, and sharing AI prompts across multiple categories.

AIOpenLibrary is a full-stack Next.js application where users can browse curated AI prompts, save their favorites, submit new prompts for community review, and explore trending prompts on a leaderboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL 17 via Supabase
- **Auth:** Supabase Auth (SSR pattern with cookie-based sessions)
- **Testing:** Vitest + Testing Library
- **Hosting:** Vercel (auto-deploy from GitHub)

## Prerequisites

- Node.js 22+
- npm 10+
- A Supabase project (free tier works)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/archangel4-rajan/aiopenlibrary.git
cd aiopenlibrary
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For seeding only — never expose client-side
```

> **Note:** A live Supabase project is required — all data is stored in the database.

### 3. Set up the database

Apply the schema to your Supabase project via the SQL Editor:

```bash
# The full schema is in scripts/schema.sql
# Copy and run it in your Supabase Dashboard > SQL Editor
```

Then seed the initial data:

```bash
npx tsx scripts/seed.ts
```

### 4. Start development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run all tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout (Navbar, Footer, AuthProvider)
│   ├── auth/               # Login page + OAuth callback
│   ├── categories/         # Browse all categories
│   ├── category/[slug]/    # Category detail with filtered prompts
│   ├── prompts/[slug]/     # Individual prompt detail
│   ├── search/             # Search results
│   ├── submit/             # Submit new prompt form
│   ├── profile/            # User's saved prompts library
│   ├── leaderboard/        # Trending prompts by weekly saves
│   ├── admin/              # Admin dashboard, CRUD, submissions
│   ├── about/              # About page
│   └── api/                # API routes (search, save, submissions, admin)
├── components/             # Reusable React components
├── lib/                    # Database layer, auth, rate limiting, types
└── __tests__/              # Vitest test files
scripts/
├── schema.sql              # Complete database schema with RLS
└── seed.ts                 # Database seeding script
```

## Development Workflow

This project follows a branch-based workflow with CI enforcement:

1. **Create a feature branch:** `git checkout -b feature/your-feature`
2. **Develop locally:** `npm run dev` with manual testing
3. **Run quality checks before committing:**
   ```bash
   npx eslint src/ && npx tsc --noEmit && npm test
   ```
4. **Commit using conventional commits:** `git commit -m "feat: add tag filtering"`
5. **Push and open a PR:** `git push -u origin feature/your-feature`
6. **CI runs automatically** — lint, typecheck, test, and build must all pass
7. **Review and merge** via squash merge after approval
8. **Vercel auto-deploys** production from main

### Commit Message Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `refactor:` — Code restructuring
- `test:` — Test additions/updates
- `chore:` — Build/tooling changes

## Database

The database schema lives in `scripts/schema.sql` and includes 7 tables, all with Row-Level Security (RLS) enabled:

- **categories** — Prompt categories (Software Engineering, Writing, etc.)
- **prompts** — The main prompt library with full metadata
- **profiles** — User profiles (auto-created on signup via trigger)
- **saved_prompts** — User bookmarks (triggers saves_count updates)
- **prompt_submissions** — Community-submitted prompts awaiting review
- **prompt_votes** — Like/dislike system with count triggers
- **admin_emails** — Admin role assignment table

Schema changes should always be applied via Supabase migrations (never raw DDL).

## Deployment

The app is deployed on Vercel with automatic deployments:

- **Preview:** Every PR gets a unique preview URL from Vercel
- **Production:** Merges to `main` trigger production deployment
- **Environment variables:** Managed in Vercel Dashboard > Settings > Environment Variables
- **Rollback:** Use Vercel's instant rollback in the Deployments dashboard

## License

Private project — all rights reserved.
