# Voltron CTO Code Audit — 2026-02-19

## Issues Found (Code Review)

### 🔴 HIGH — Outdated Model Lists (3 locations)

The model dropdown options are stuck on old model names that don't match actual prompt data.

**Files:**
1. `src/app/submit/page.tsx` line ~15 — `MODEL_OPTIONS` array
2. `src/app/search/page.tsx` — model filter dropdown (hardcoded `<option>` values)
3. Need to check what models are actually in the DB

**Current (wrong):** GPT-4o, Claude 3.5 Sonnet, Claude 3.5 Haiku, Gemini 2.0 Flash, Any Model
**Actual DB values:** Claude Opus 4, Claude Sonnet 4, Claude Sonnet 4.5, GPT-4o, Grok 4.20, Gemini 2.5 Pro, Llama 3.3, etc.

**Impact:** Search model filter never matches. Submit form writes wrong model names.

### 🟡 MEDIUM — Leaderboard post-login (reported by Rajan)

Code review shows the leaderboard page should work fine for both anon and authed users:
- `getLeaderboardPrompts()` has robust fallback
- RLS policy "Published prompts are viewable by everyone" covers all roles
- `getUserSavedPromptIds()` is only called when user exists

**Possible causes to investigate with browser testing:**
- `get_weekly_leaderboard` RPC might not exist → falls back, but auth context could affect fallback query
- Hydration mismatch between server-rendered HTML and client `AuthProvider` state
- SaveButton client component error when auth state transitions

### 🟡 MEDIUM — Search doesn't search tags

The search function searches `title`, `description`, and `category_name` via ILIKE, but NOT `tags`. Tags are stored as a text[] array. Users searching for tag terms get no results.

### 🟡 MEDIUM — No keyboard shortcut for search

Navbar shows a `/` keyboard shortcut hint but there's no `useEffect` listening for the keypress.

### 🔵 LOW — Profile page uses browser `prompt()` for collection creation

`handleCreateCollection` uses `window.prompt()` which is ugly and can be blocked. Should be a proper modal.

### 🔵 LOW — About page not linked in desktop nav

About page exists (`/about`) but only shows in mobile menu, not desktop nav.

## Awaiting Kai's Browser Audit

Need live browser testing to:
- Reproduce leaderboard post-login break
- Test all flows end-to-end
- Check mobile responsiveness
- Verify Run Prompt functionality
