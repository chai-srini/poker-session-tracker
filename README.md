# Poker Night Score Tracker

A simple, mobile-friendly web application to track poker game buy-ins and calculate optimal payment settlements.

## Features

- Track up to 9 players per poker session
- Support for multiple buy-ins per player
- Configurable buy-in amount (default: INR 200)
- Real-time calculation of totals and pot size
- Automatic validation of final standings
- Optimal settlement calculation (minimizes number of transactions)
- Automatic session saving (localStorage)
- Mobile-responsive design
- Works offline (no backend required)

## Usage

1. **Player Setup**: Enter the number of players (1-9) and their names
2. **Buy-in Tracking**: Track each player's buy-ins throughout the night
3. **Final Standing**: Enter each player's final cash value
4. **Settlement**: View who owes whom and how much

## Local Development

Simply open `index.html` in your web browser. No build process or server required.

```bash
# Clone the repository
git clone <your-repo-url>
cd poker-tracker-claude

# Open in browser
open index.html
```

## Deployment

This application is designed to be hosted on GitHub Pages:

1. Push code to GitHub repository
2. Go to repository Settings > Pages
3. Set source to "main" branch and "/" (root) folder
4. Save and wait for deployment

Your app will be available at: `https://<username>.github.io/<repository-name>/`

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: Browser localStorage
- **Hosting**: GitHub Pages
- **No dependencies**: Pure vanilla JavaScript, no frameworks or build tools

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
