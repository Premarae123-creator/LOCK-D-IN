# THE GRID LIVE

A real-time multiplayer elimination-game prototype for livestreams.

## What it does
- Host creates a room and chooses 10–100 Grid positions.
- Real players join from their own phones with the room code.
- Each player claims one available position.
- Host closes claims and starts the round.
- Host can eliminate one or three random occupied positions at a time.
- Every connected screen updates in real time.
- Last occupied position wins.
- Host can reopen the same claims or clear the board for a fresh round.

## Deploy on Render
1. Create a new GitHub repository.
2. Upload `server.js`, `package.json`, `README.md`, and the entire `public` folder.
3. On Render, create a **Web Service** from the repository.
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy.

## StreamYard use
Open the hosted game in a browser and share that browser/tab/window in StreamYard as the public game board. Players use the same URL on their phones.

## Important
This prototype does **not** collect wagers, process payments, hold player funds, or automate cash payouts. Before charging for chance-based entries or awarding wager-funded cash prizes, get jurisdiction-specific legal review and confirm platform/payment-processor rules.

## Current prototype limitation
Rooms live in server memory. A server restart clears active rooms. Add a database before production use.
