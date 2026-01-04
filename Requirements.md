# Poker Night Score Tracker

## Requirements
* Up to 9 players can participate in a poker session
* Each player buys virtual money and uses it in the game
* Players can buy in multiple times during the night (re-buys)
* All buy-ins are the same amount (default: INR 200, but configurable)
* Configurable starting stack/chips per buy-in (default: 400 chips)
* Game tracked in chips with automatic INR conversion
* At the end of the night, players report their final chip count
* System validates that total chip count matches
* Settlement algorithm minimizes the number of transactions

## Features
- [ ] Allow entry of number of players and player names (up to 9 players)
- [ ] Set configurable buy-in amount (default: INR 200)
- [ ] Configure chips per buy-in (starting stack)
- [ ] Track multiple buy-ins for each player
- [ ] Track game progress in chips
- [ ] Display running totals per player and total pot (both chips and INR)
- [ ] Allow entry of final chip count for each player
- [ ] Automatic chip-to-INR conversion for settlement
- [ ] Validate that total chip count matches (show error if mismatch)
- [ ] Display both chip counts and INR values throughout
- [ ] Calculate optimal settlement (minimize number of transactions)
- [ ] Display who owes whom and how much
- [ ] Save session data automatically (localStorage)
- [ ] Restore session on page reload
- [ ] Mobile-friendly responsive design

## Technologies
- Frontend: HTML, CSS, JavaScript (vanilla JS)
- Storage: localStorage (browser-based)
- Deployment: GitHub Pages
- Backend: None required

## Workflow
1. **Player Setup**: Enter number of players (1-9) and their names, set chips per buy-in (default: 400 chips for ₹200)
2. **Buy-in Tracking**: Track multiple buy-ins per player, see chip totals and INR equivalents
3. **Final Standing**: Enter final chip count for each player, automatic conversion to INR, validate chip totals
4. **Settlement**: View chip progression and INR settlement with optimized payment instructions (who pays whom)
