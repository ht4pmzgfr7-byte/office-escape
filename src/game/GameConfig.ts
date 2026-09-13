import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { MenuScene } from './game/scenes/MenuScene';
import { CharacterSelectScene } from './game/scenes/CharacterSelectScene';
import { LevelSelectScene } from './game/scenes/LevelSelectScene';
import { SettingsScene } from './game/scenes/SettingsScene';
import { GameScene } from './game/scenes/GameScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { VictoryScene } from './game/scenes/VictoryScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 540
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false }
    },
    scene: [
      BootScene,
      MenuScene,
      CharacterSelectScene,
      LevelSelectScene,
      SettingsScene,
      GameScene,
      GameOverScene,
      VictoryScene
    ]
  };
}
