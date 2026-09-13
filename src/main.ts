import Phaser from 'phaser';
import { createGameConfig } from './game/GameConfig';

const parent = document.getElementById('app');
if (!parent) {
  throw new Error('#app Element nicht gefunden');
}

const game = new Phaser.Game(createGameConfig(parent));

// Pause bei App-Wechsel / Tab-Wechsel (wichtig für Mobile UX)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.scene.scenes.forEach((scene: Phaser.Scene) => scene.scene.pause());
  } else {
    game.scene.scenes.forEach((scene: Phaser.Scene) => scene.scene.resume());
  }
});

// Service Worker für PWA-Installation (Offline-fähig, Home-Screen-Icon)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Service Worker ist optional - Spiel funktioniert auch ohne
    });
  });
}
