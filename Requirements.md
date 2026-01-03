# Poker Night Score Tracker

## Requirements
* Up to 9 players can participate in a poker session
* Each player buys virtual money and uses it in the game
* Players can buy in multiple times during the night (re-buys)
* All buy-ins are the same amount (default: INR 200, but configurable)
* At the end of the night, players report their final cash value
* System validates that total final cash equals total buy-ins
* Settlement algorithm minimizes the number of transactions

## Features
- [ ] Allow entry of number of players and player names (up to 9 players)
- [ ] Set configurable buy-in amount (default: INR 200)
- [ ] Track multiple buy-ins for each player
- [ ] Display running totals per player and total pot
- [ ] Allow entry of final cash value for each player
- [ ] Validate that total final cash equals total buy-ins (show error if mismatch)
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
1. **Player Setup**: Enter number of players (1-9) and their names
2. **Buy-in Tracking**: Track multiple buy-ins per player, see running totals
3. **Final Standing**: Enter final cash value for each player, validate totals
4. **Settlement**: View optimized payment instructions (who pays whom)
