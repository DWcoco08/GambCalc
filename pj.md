You are a senior frontend engineer. Build a scalable web app for calculating money for multiple card games. One of the games is "Cat Te" (Vietnamese card game), but the system must be designed to support adding more games in the future.

Tech requirements:

- React (with hooks) + TailwindCSS
- No backend, use localStorage
- Modular and scalable architecture
- Mobile-friendly UI

====================================

1. APP STRUCTURE (IMPORTANT)

- Layout:
  - Sidebar (left):
    - List of games (Cat Te for now)
    - Button: "Add Game" (future use)
  - Main content area:
    - Changes based on selected game

- Routing (optional but preferred):
  - /game/cat-te
  - /history

- Design system:
  - Reusable components
  - Game-specific logic separated from UI

====================================

2. GAME ENGINE DESIGN

- Create a flexible game system:
  Each game should define:
  - name
  - rules
  - scoring logic
  - UI behavior

- Example:
  const games = {
  catte: {
  name: "Cat Te",
  calculateResult: fn,
  config: {...}
  }
  }

====================================

3. CAT TE GAME LOGIC

Base bet = 2000

Normal Win:

- Winner gains: (number_of_other_players _ base bet _ streak_multiplier)
- Others lose base bet

Instant Win:

- Same as win but multiply result by 2

Win streak:

- Starts at 1
- Each consecutive win adds +1 multiplier
- Reset for all losing players

Example (4 players):

- Streak 1 → 6k
- Streak 2 → 12k
- Instant win streak 2 → 24k

====================================

4. MATCH SYSTEM (REUSABLE FOR ALL GAMES)

- Create match
- Add/remove players
- Edit player names
- Track:
  - total money
  - streak (if game supports it)

====================================

5. GAMEPLAY UI (DYNAMIC PER GAME)

- Show players list
- Each player has:
  - Name (editable)
  - Total money
  - Game-specific stats (e.g. streak for Cat Te)

- Actions (based on game):
  - Win
  - Instant Win (only for Cat Te)

====================================

6. LOG SYSTEM (GLOBAL)

- Scrollable log panel
- Each entry:
  - Game name
  - Round number
  - Winner
  - Action type
  - Money changes
  - Timestamp

- Show:
  - Total rounds
  - Daily summary

====================================

7. UNDO SYSTEM

- Undo last action
- Restore:
  - Player money
  - Game states (streak, etc.)
  - Logs

====================================

8. END MATCH

- Show summary:
  - Ranking
  - Total rounds
  - Top winner
  - Highest streak (if applicable)

- Save to history

====================================

9. HISTORY PAGE

- List past matches
- Filter by:
  - Game type
  - Date

- View details:
  - Logs
  - Final result

====================================

10. COMPONENT STRUCTURE

- App
- Sidebar (game selector)
- GameContainer (switch based on selected game)
- MatchSetup
- PlayerCard
- GameBoard
- LogPanel
- SummaryModal
- HistoryPage

====================================

11. CODE QUALITY

- Separate:
  - game logic (pure functions)
  - UI components

- Example:
  /games/catte/logic.js
  /games/catte/components.jsx

====================================

12. UX DETAILS

- Highlight winner (green), loser (red)
- Sticky header:
  - Current game
  - Total rounds
- Smooth animations

====================================

13. BONUS (OPTIONAL)

- Dark mode toggle
- Sound effects
- Configurable base bet

====================================

Output:

- Full working React project (multi-file)
- Clean folder structure
- Well-commented code

Make the UI look like a modern card game dashboard with rounded cards, shadows, and smooth animations.
