# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript web application for tracking poker game buy-ins and calculating optimal payment settlements. The app runs entirely client-side with no dependencies, build process, or backend.

## Development

**No build process required** - simply open [index.html](index.html) in a modern web browser:

```bash
# Local development
open index.html

# Or use a simple HTTP server if needed
python3 -m http.server 8000
```

There are no test, lint, or build commands. All code is vanilla JavaScript (ES6+).

## Deployment & Cache Management

**Before deploying to GitHub Pages, increment the version number in TWO places:**

1. **[js/app.js](js/app.js)** - Update `APP_VERSION` constant (e.g., `'1.0.0'` → `'1.0.1'`)
2. **[index.html](index.html)** - Update `?v=` query strings on all CSS/JS tags (e.g., `?v=1.0.0` → `?v=1.0.1`)

**How it works:**
- Query strings force browsers to download fresh CSS/JS files
- Version check in [app.js:28-42](js/app.js#L28-L42) detects updates and forces page reload
- Users see "App updated! Reloading..." notification on version mismatch
- First-time visitors won't see the reload notification

**Deployment steps:**
```bash
# 1. Update version numbers (as described above)
# 2. Commit and push to GitHub
git add .
git commit -m "Release v1.0.1"
git push origin main
```

GitHub Pages will automatically deploy within ~1 minute. Mobile users will get fresh code on next visit.

## Code Architecture

### Application Flow

The app follows a **screen-based single-page architecture** with four sequential screens:

1. **Setup Screen** ([app.js:98-161](js/app.js#L98-L161)) - Player names, currency, and chip configuration
2. **Buy-in Screen** ([app.js:324-452](js/app.js#L324-L452)) - Track multiple buy-ins per player
3. **Standing Screen** ([app.js:498-564](js/app.js#L498-L564)) - Enter final chip counts with validation
4. **Settlement Screen** ([app.js:626-717](js/app.js#L626-L717)) - Display optimized payment instructions

### State Management

All state lives in the `appState` object ([app.js:7-14](js/app.js#L7-L14)):

```javascript
{
  currentScreen: 'setup' | 'buyin' | 'standing' | 'settlement',
  buyInAmount: number,        // Currency per buy-in (default: 200)
  startingStack: number,      // Chips per buy-in (default: 400)
  currencySymbol: string,     // Display symbol (default: '$')
  players: [{
    name: string,
    buyIns: number,           // Number of buy-ins
    totalBuyIn: number,       // Total currency invested
    finalCash: number,        // Final currency value of chips
    netPosition: number       // finalCash - totalBuyIn
  }]
}
```

**State is automatically persisted to localStorage** on every update via `saveSession()` ([storage.js:13-25](js/storage.js#L13-L25)). Session restoration happens on page load ([app.js:24-62](js/app.js#L24-L62)).

### Key Technical Details

**Screen Navigation Pattern:**
- Each screen has `render*Screen()` and `showScreen()` functions
- `renderXScreen()` generates HTML and attaches event listeners
- `showScreen(name)` toggles visibility via CSS classes
- Always call `saveSession(appState)` after state changes

**Chip-to-Currency Conversion:**
- Tracks game in chips, settles in currency
- Chip value = `totalPot / totalChips` (calculated dynamically)
- Validation requires exact chip count match (no floating-point tolerance)
- Currency calculations use 0.01 threshold for floating-point errors ([settlement.js:24](js/settlement.js#L24))

**Settlement Algorithm** ([settlement.js:13-66](js/settlement.js#L13-L66)):
- Greedy algorithm minimizes transaction count
- Sorts creditors (net positive) descending, debtors (net negative) ascending
- Matches largest creditor with largest debtor iteratively
- Returns array of `{from, to, amount}` transactions

**Dynamic Player Management:**
- Setup screen: Add/remove players with validation for duplicates and empty names
- Buy-in screen: Can add players mid-game (defaults to 1 buy-in)
- Maximum 9 players enforced

**Session State Retention:**
- "New Session" button ([app.js:836-854](js/app.js#L836-L854)) preserves player names and currency
- Allows quick setup for recurring games with same players

## File Organization

```
/
├── index.html           # Entry point, four screen sections (setup/buyin/standing/settlement)
├── css/styles.css       # All styling
└── js/
    ├── app.js           # Main logic: state management, UI rendering, event handlers
    ├── settlement.js    # Settlement calculation algorithm
    └── storage.js       # localStorage wrapper (save/load/clear session)
```

**Script load order matters** - index.html loads storage.js → settlement.js → app.js ([index.html:76-78](index.html#L76-L78))

## Common Patterns

**Event Handling:**
- Event listeners added in `render*Screen()` functions
- Use `data-*` attributes for dynamic values (e.g., `data-player="${index}"`)
- Input validation happens on `input` events, not `change`

**DOM Updates:**
- Direct DOM manipulation via `getElementById()` and `querySelector()`
- No virtual DOM or reactive framework
- Full re-renders on screen transitions, targeted updates within screens

**Notifications:**
- `showNotification(message)` creates temporary 3-second overlay ([app.js:825-834](js/app.js#L825-L834))
- Used for share confirmations and player additions

**Share Functionality** ([app.js:719-823](js/app.js#L719-L823)):
- Web Share API for mobile with clipboard fallback for desktop
- Generates formatted text summary of game results
- Payment instructions shown before player summary in share text

## Important Considerations

- **No external dependencies** - avoid suggesting npm packages or build tools
- **Mobile-first design** - ensure changes work on small screens
- **Offline-capable** - no network requests, all data in localStorage
- **Floating-point precision** - use 0.01 thresholds for currency comparisons
- **State persistence** - always call `saveSession()` after state mutations
- **Sequential workflow** - users expect linear progression through screens
