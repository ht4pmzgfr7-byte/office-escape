import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { CHARACTER_ORDER, CHARACTERS } from '../../config/characters';
import { generateCharacterTextures } from '../characters/SpriteFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload() {
    const { width, height } = this.scale;
    const text = this.add.text(width / 2, height / 2, 'Lädt...', {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#ffffff'
    });
    text.setOrigin(0.5);
  }

  create() {
    // Alle Charakter-Sprites einmalig prozedural erzeugen (Platzhalter).
    CHARACTER_ORDER.forEach(id => generateCharacterTextures(this, CHARACTERS[id]));
    this.createAnimations();
    this.scene.start(SCENES.MENU);
  }

  private createAnimations() {
    const states: { key: string; frameRate: number; repeat: number }[] = [
      { key: 'idle', frameRate: 4, repeat: -1 },
      { key: 'run', frameRate: 10, repeat: -1 },
      { key: 'jump', frameRate: 1, repeat: 0 },
      { key: 'slide', frameRate: 1, repeat: 0 },
      { key: 'hit', frameRate: 1, repeat: 0 },
      { key: 'victory', frameRate: 6, repeat: -1 }
    ];

    CHARACTER_ORDER.forEach(id => {
      states.forEach(s => {
        const texKey = `char_${id}_${s.key}`;
        const animKey = `anim_${id}_${s.key}`;
        if (this.anims.exists(animKey)) return;
        // Jeder Charakter-Zustand wird mit exakt 4 Frames generiert (siehe SpriteFactory).
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(texKey, { start: 0, end: 3 }),
          frameRate: s.frameRate,
          repeat: s.repeat
        });
      });
    });
  }
}
