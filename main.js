
import BootScene from './BootScene.js';
import MenuScene from './MenuScene.js';
import LobbyScene from './LobbyScene.js';
import ArenaScene from './ArenaScene.js';

window.socket = io();
window.LOCKDIN = {
  key: localStorage.getItem('lockdinPlayerKey') || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
  name: localStorage.getItem('lockdinName') || '',
  room: '',
  state: null,
  host: false
};
localStorage.setItem('lockdinPlayerKey', window.LOCKDIN.key);

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#030409',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  render: { antialias: true, pixelArt: false, roundPixels: false },
  scene: [BootScene, MenuScene, LobbyScene, ArenaScene]
};
window.game = new Phaser.Game(config);
