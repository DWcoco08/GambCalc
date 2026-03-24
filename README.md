# GambCalc - Card Game Money Calculator

Web app tinh tien cho cac game bai. Hien tai ho tro game **Cat Te**, thiet ke mo rong de them game khac trong tuong lai.

## Tech Stack

- **React 19** + Vite
- **TailwindCSS 4**
- **Supabase** (Auth + PostgreSQL)
- **localStorage** fallback (offline support)

## Tinh nang

- Tinh tien tu dong: thang thuong, thang toi trang, chuoi thang (streak)
- Undo / Redo khong gioi han, luu qua refresh
- Lich su van dau voi soft delete + thung rac
- Xem chi tiet +/- tung nguoi moi luot
- Huy chuoi (chong gian lan) voi confirm
- Dark mode
- Dang nhap (khong co dang ky - admin tao tai khoan)
- Dong bo lich su len Supabase khi dang nhap
- Hoat dong offline bang localStorage

## Hieu ung

- Win streak 2+: card phat sang cam
- Win streak 5+: **DEMON MODE** - aura do tim bung no, badge lac lien tuc
- Lose streak 5+: card phat sang xanh
- Lose streak 10+: badge rung lac
- Moc thua tien: -30k, -50k, -100k, -200k badges
- Tat ca animation toi uu GPU (transform/opacity), mượt tren mobile

## Cai dat

```bash
npm install
npm run dev
```

## Environment Variables

Tao file `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

Chay file `supabase-schema.sql` trong Supabase SQL Editor.

Sau do vao **Authentication > Settings** tat "Enable sign ups" (chi admin tao tai khoan).

## Deploy (Vercel)

1. Push len GitHub
2. Import repo tren Vercel
3. Them Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Cau truc thu muc

```
src/
  lib/supabase.js           # Supabase client
  services/
    auth.js                 # Login/logout
    matchService.js         # localStorage + Supabase sync
  contexts/AuthContext.jsx  # Auth state
  hooks/
    useAuth.js              # Auth hook
    useMatch.js             # Game state, undo/redo
    useDarkMode.js          # Dark mode
  games/
    registry.js             # Game registry
    catte/
      logic.js              # Cat Te rules & calculations
      components.jsx        # Cat Te board UI
  components/
    GameContainer.jsx       # Main game view
    GameGuide.jsx           # Game rules guide
    MatchSetup.jsx          # Create match
    LogPanel.jsx            # Round history
    PlayerHistory.jsx       # Per-player detail
    SummaryModal.jsx        # End match summary
    HistoryPage.jsx         # Match history
    LoginPage.jsx           # Login
    Sidebar.jsx             # Navigation
  utils/storage.js          # localStorage layer
```
