import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { LEVELS } from '../../config/levels';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { makeButton } from '../../ui/Button';

export class LevelSelectScene extends Phaser.Scene {
  private audio!: AudioSystem;

  constructor() {
    super(SCENES.LEVEL_SELECT);
  }

  create() {
    this.audio = new AudioSystem(this);
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#16213e');

    this.add
      .text(width / 2, height * 0.09, 'LEVEL AUSWÄHLEN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: `${Math.round(width * 0.05)}px`,
        color: '#ffd23f'
      })
      .setOrigin(0.5);

    const cols = 5;
    const cellSize = Math.min(90, width / (cols + 1));
    const gridW = cellSize * cols + (cols - 1) * 12;
    const startX = width / 2 - gridW / 2 + cellSize / 2;
    const startY = height * 0.3;

    LEVELS.forEach((lvl, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellSize + 12);
      const y = startY + row * (cellSize + 18);
      const unlocked = SaveSystem.isLevelUnlocked(lvl.id);

      const bg = this.add.rectangle(x, y, cellSize, cellSize, unlocked ? 0x2f6fed : 0x333850, 1);
      bg.setStrokeStyle(2, 0x000000, 0.3);
      if (unlocked) bg.setInteractive({ useHandCursor: true });

      const label = this.add.text(x, y - 6, unlocked ? `${lvl.id}` : '🔒', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#ffffff'
      });
      label.setOrigin(0.5);

      const best = SaveSystem.getBestTime(lvl.id);
      if (unlocked && best !== undefined) {
        const bestText = this.add.text(x, y + cellSize / 2 - 12, `${(best / 1000).toFixed(1)}s`, {
          fontFamily: 'sans-serif',
          fontSize: '11px',
          color: '#d0d6ff'
        });
        bestText.setOrigin(0.5);
      }

      if (unlocked) {
        bg.on('pointerup', () => {
          this.audio.play('button_click');
          this.scene.start(SCENES.GAME, { levelId: lvl.id });
        });
      }
    });

    makeButton(this, width * 0.15, height * 0.09, '←', () => {
      this.scene.start(SCENES.MENU);
    }, { width: 50, height: 50, color: 0x444a55 });
  }
}
