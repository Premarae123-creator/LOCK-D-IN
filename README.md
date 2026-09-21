# LOCK'D IN v2.2
Minimum 5 locked players to start. Live Feed is always under the board. Lobby button/status removed. Creator is designated HOST. Optional Hangout adds browser camera/mic and room text chat. Keeps v2.1 sync/reconnect/Run It Back fixes.

Deploy: replace `server.js`, `package.json`, and `public/index.html`. Render remains Node / `npm install` / `npm start`.

Camera/mic requires browser permission and HTTPS. This prototype uses peer-to-peer WebRTC, best for smaller rooms; larger rooms should later use a dedicated SFU video service.

## v2.3 camera fix
- Prevents WebRTC offer collisions ("glare") by designating only one peer as the offerer.
- Queues ICE candidates until the remote connection description is ready.
- Adds a second STUN endpoint and explicitly starts remote video playback.
- Shows a small connection confirmation when a peer-to-peer media connection succeeds.

Important: this is still peer-to-peer WebRTC. Some cellular/corporate/firewall combinations require a TURN relay. If two devices still cannot connect after this fix, the next production step is adding a TURN/SFU video provider rather than more browser-side patches.


v3 adds synchronized-style countdown, drop reveal, lock pulse, Final Five glow, winner confetti and sound cues.


v3.2 adds a full-screen cinematic arena elimination sequence modeled on the supplied concept: spotlights, survivor cards, 3-2-1 suspense, giant player card, falling pit, screen impact and GOT DROPPED reveal. It is HTML/CSS/JS, not a static image.

# LOCK'D IN v4 — Elimination Engine
Host can choose RANDOM FX, TRAP DOOR, SHATTER, LOCKOUT, TARGET LOCK, POWER CUT, or RED LIGHT.
Random mode picks a different presentation sequence for each elimination. DROP 3 gives each eliminated player a separate sequence.
The server remains authoritative about the eliminated player; animation only presents the result.

## v5 Canvas Broadcast Engine
CINEMATIC DROP is now the default host drop style. It renders the elimination in a dedicated full-screen HTML5 Canvas at device-pixel resolution. The scene includes a virtual arena, moving spotlights, perspective stage grid, survivor lineup, timed 3-2-1 reveal, camera-style push-in, pseudo-3D card tilt/depth fall, glowing pit, 100+ impact particles, screen shake, broadcast typography, and a GOT DROPPED stinger. The server remains authoritative for game outcomes.
