# Number Sorting Game - Svelte Version

A strategic number sorting puzzle game built with Svelte 4 and Vite, featuring a bank of random action cards.

## Features

- **9 number cards** with values 1-10 (randomly selected, no repeats)
- **Action bank** of 3 random actions available at a time
- **Strategic gameplay** - only the used action gets replaced with a new random one
- **Multiple action types**: +1/-1, +2/-2, upshift/downshift, reverse
- **Action counter** to track efficiency
- **Responsive design** that works on all devices
- **Win detection** with celebration animation

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server with file watching
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Game Rules

1. **Select cards** by clicking them (unlimited selection)
2. **Use action cards** from the bank below
3. **Only the used action** gets replaced with a new random one
4. **Goal**: Sort all cards in ascending order with minimal actions
5. **Press "R"** to reset the game

## Action Types

- **+1/-1, +2/-2**: Add or subtract from 1 selected card
- **Upshift/Downshift**: Rotate selected cards by 1 position (with wrapping)
- **Reverse**: Reverse order of any number of selected cards

## Deployment

### Manual Deployment

```bash
npm run deploy
```

This will build the project and deploy it to the `gh-pages` branch.

### Automatic Deployment

Push to the `main` branch and GitHub Actions will automatically deploy to GitHub Pages.

## License

MIT License - feel free to use this code for your own projects!