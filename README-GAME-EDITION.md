# LOCK'D IN — Game Edition, Phase 1

This is the first Phaser front-end rebuild. The existing Node/Express/Socket.IO server remains in place.

Included:
- Phaser boot/loading scene
- Animated game-style main menu
- Create Room / Join Room
- Multiplayer lobby
- Phaser-rendered numbered arena
- Sprite-like interactive number tiles
- Lock-in interaction connected to Socket.IO
- Host controls
- First Phaser DROP scene
- Responsive phone/desktop canvas
- `public/legacy.html` keeps a copy of the prior browser UI for reference

Deployment:
1. Replace the files in the existing GitHub repository with the contents of this ZIP.
2. Keep `public/` as a folder.
3. Commit changes.
4. Existing Render service should redeploy automatically.
5. Open the deployed URL and hard-refresh.

Note: Phaser is loaded from jsDelivr in this Phase 1 prototype. The next production pass can bundle dependencies locally and add original game art/audio assets.
