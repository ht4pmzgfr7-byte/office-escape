import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { makeButton } from '../../ui/Button';

interface GameOverData {
  levelId: number;
}

export class GameOverScene extends Phaser.Scene {
  private levelId = 1;

  constructor() {
    super(SCENES.GAME_OVER);
  }

  init(data: GameOverData) {
    this.levelId = data?.levelId ?? 1;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#2b1414');

    this.add
      .text(width / 2, height * 0.28, 'GAME OVER', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: `${Math.round(width * 0.09)}px`,
        color: '#ff6b6b'
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.44,
        'Du wurdest beim Arbeitszeitbetrug erwischt\nund musst unbezahlte Überstunden machen.',
        {
          fontFamily: 'sans-serif',
          fontSize: `${Math.round(width * 0.028)}px`,
          color: '#f0d0d0',
          align: 'center',
          wordWrap: { width: width * 0.85 }
        }
      )
      .setOrigin(0.5);

    makeButton(this, width / 2, height * 0.66, 'ERNEUT VERSUCHEN', () => {
      this.scene.start(SCENES.GAME, { levelId: this.levelId });
    });

    makeButton(this, width / 2, height * 0.78, 'HAUPTMENÜ', () => {
      this.scene.start(SCENES.MENU);
    }, { color: 0x444a55 });
  }
}
