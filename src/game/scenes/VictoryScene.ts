import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { LEVELS } from '../../config/levels';
import { SaveSystem } from '../systems/SaveSystem';
import { makeButton } from '../../ui/Button';

interface VictoryData {
  levelId: number;
  timeMs: number;
}

export class VictoryScene extends Phaser.Scene {
  private levelId = 1;
  private timeMs = 0;

  constructor() {
    super(SCENES.VICTORY);
  }

  init(data: VictoryData) {
    this.levelId = data?.levelId ?? 1;
    this.timeMs = data?.timeMs ?? 0;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#123b1f');

    this.add
      .text(width / 2, height * 0.24, 'LEVEL GESCHAFFT!', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: `${Math.round(width * 0.075)}px`,
        color: '#ffd23f'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.4, `Zeit: ${(this.timeMs / 1000).toFixed(1)}s`, {
        fontFamily: 'sans-serif',
        fontSize: `${Math.round(width * 0.04)}px`,
        color: '#ffffff'
      })
      .setOrigin(0.5);

    const best = SaveSystem.getBestTime(this.levelId);
    if (best !== undefined) {
      this.add
        .text(width / 2, height * 0.48, `Bestzeit: ${(best / 1000).toFixed(1)}s`, {
          fontFamily: 'sans-serif',
          fontSize: `${Math.round(width * 0.026)}px`,
          color: '#c8e6c9'
        })
        .setOrigin(0.5);
    }

    const hasNext = this.levelId < LEVELS.length;

    if (hasNext) {
      makeButton(this, width / 2, height * 0.64, 'NÄCHSTES LEVEL', () => {
        this.scene.start(SCENES.GAME, { levelId: this.levelId + 1 });
      });
    } else {
      this.add
        .text(width / 2, height * 0.6, 'Du hast das Büro endgültig verlassen!', {
          fontFamily: 'sans-serif',
          fontSize: `${Math.round(width * 0.024)}px`,
          color: '#c8e6c9',
          align: 'center',
          wordWrap: { width: width * 0.8 }
        })
        .setOrigin(0.5);
    }

    makeButton(this, width / 2, height * 0.76, 'LEVELAUSWAHL', () => {
      this.scene.start(SCENES.LEVEL_SELECT);
    }, { color: 0x444a55 });

    makeButton(this, width / 2, height * 0.88, 'HAUPTMENÜ', () => {
      this.scene.start(SCENES.MENU);
    }, { color: 0x333333, width: 220, height: 44 });
  }
}
