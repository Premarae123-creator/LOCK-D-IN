# LOCK'D IN — Live Game Show Build

Built from the uploaded LOCK'D IN server and the previously working WebRTC signaling approach.

## What changed
- New premium black/red/gold game-show arena.
- Player portraits live inside the arena side rail.
- Each player can use live camera + audio, audio with avatar, or avatar only.
- Existing Socket.IO room/host/claim/drop/run-back backend is preserved.
- Existing two-player minimum is preserved.
- Existing WebRTC offer-collision and ICE-queue approach is preserved.
- Live feed is integrated into the right rail.
- Host controls remain in the arena.
- Full-screen elimination presentation remains part of the game flow.
- Prior full browser build is preserved at `public/legacy.html`.

## GitHub structure
server.js
package.json
public/index.html
public/legacy.html
public/game/main.js
public/game/BootScene.js
public/game/MenuScene.js
public/game/LobbyScene.js
public/game/ArenaScene.js

Replace the corresponding files in the existing repository and let the existing Render service redeploy.
