# GambCalc - Card Game Money Calculator

A web app for calculating money in card games. Currently supports **Cat Te** (Vietnamese card game), designed to easily add more games in the future.

## Tech Stack

- **React 19** + Vite
- **TailwindCSS 4**
- **Supabase** (Auth + PostgreSQL)
- **localStorage** fallback (offline support)

## Features

- Auto money calculation: normal win, instant win, win streak multiplier
- Unlimited Undo / Redo, persisted across refresh
- Match history with soft delete + trash bin
- Per-player round-by-round +/- detail view
- Reset streak (anti-cheat) with confirmation
- Dark mode
- Login only (no registration - admin creates accounts)
- Cloud sync to Supabase when logged in
- Full offline support via localStorage

## Visual Effects

- Win streak 2+: orange glow on player card
- Win streak 5+: **DEMON MODE** - red-purple fire aura, shaking badge with brightness flash
- Lose streak 5+: blue glow on player card
- Lose streak 10+: shaking badge
- Money loss milestones: -30k, -50k, -100k, -200k badges
- All animations GPU-optimized (transform/opacity only), smooth on mobile

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

1. Run `supabase-schema.sql` in Supabase SQL Editor
2. Go to **Authentication > Settings** and disable "Enable sign ups"
3. Create user accounts manually via **Authentication > Users > Add user**

## Deploy (Vercel)

1. Push to GitHub
2. Import repo on Vercel
3. Add Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

```
src/
  lib/supabase.js           # Supabase client init
  services/
    auth.js                 # Sign in / sign out
    matchService.js         # localStorage + Supabase sync layer
  contexts/AuthContext.jsx  # Auth state provider
  hooks/
    useAuth.js              # Auth hook
    useMatch.js             # Game state, undo/redo, streak reset
    useDarkMode.js          # Dark mode toggle
  games/
    registry.js             # Game registry (extensible)
    catte/
      logic.js              # Cat Te rules & money calculation
      components.jsx        # Cat Te board UI
  components/
    GameContainer.jsx       # Main game view (desktop: 2-col layout)
    GameGuide.jsx           # Game rules & badge guide
    MatchSetup.jsx          # Match creation form
    LogPanel.jsx            # Round-by-round log with streak effects
    PlayerHistory.jsx       # Per-player timeline modal
    SummaryModal.jsx        # End-of-match ranking & stats
    HistoryPage.jsx         # Match history with filters & trash
    LoginPage.jsx           # Login form (no registration)
    Sidebar.jsx             # Navigation sidebar
  utils/storage.js          # localStorage abstraction
```

## Adding a New Game

1. Create `src/games/yourgame/logic.js` with game definition
2. Create `src/games/yourgame/components.jsx` with board UI
3. Register in `src/games/registry.js`
4. Game automatically appears in navigation
