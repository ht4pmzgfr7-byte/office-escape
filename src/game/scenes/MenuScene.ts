import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { CHARACTER_ORDER, CHARACTERS } from '../../config/characters';
import { AudioSystem } from '../systems/AudioSystem';
import { makeButton } from '../../ui/Button';

export class MenuScene extends Phaser.Scene {
  private audio!: AudioSystem;

  constructor() {
    super(SCENES.MENU);
  }

  create() {
    this.audio = new AudioSystem(this);
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // dezenter Bürohintergrund
    const g = this.add.graphics();
    g.fillStyle(0x232946, 1);
    g.fillRect(0, height * 0.6, width, height * 0.4);
    g.fillStyle(0x16213e, 1);
    g.fillRect(0, 0, width, height * 0.6);

    // Titel
    const title = this.add.text(width / 2, height * 0.16, 'OFFICE ESCAPE', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: `${Math.round(width * 0.09)}px`,
      color: '#ffd23f',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    const sub = this.add.text(width / 2, height * 0.16 + title.height * 0.7 + 6, 'Nur noch bis zur Tür...', {
      fontFamily: 'sans-serif',
      fontSize: `${Math.round(width * 0.025)}px`,
      color: '#e0e0e0'
    });
    sub.setOrigin(0.5);

    // Animierte Charaktere laufen im Hintergrund
    const groundY = height * 0.62;
    CHARACTER_ORDER.forEach((id, i) => {
      const sprite = this.add.sprite(-80 - i * 150, groundY, `char_${id}_run`, 0);
      sprite.setOrigin(0.5, 1);
      sprite.setScale(1.1);
      sprite.play(`anim_${id}_run`);
      this.tweens.add({
        targets: sprite,
        x: width + 100,
        duration: 6000 + i * 900,
        repeat: -1,
        delay: i * 1200,
        onRepeat: () => {
          sprite.x = -80;
        }
      });
    });

    const btnY = height * 0.68;
    const btnGap = Math.round(height * 0.11);

    makeButton(this, width / 2, btnY, 'SPIELEN', () => {
      this.audio.play('button_click');
      this.scene.start(SCENES.CHARACTER_SELECT);
    });

    makeButton(this, width / 2, btnY + btnGap, 'LEVEL AUSWÄHLEN', () => {
      this.audio.play('button_click');
      this.scene.start(SCENES.LEVEL_SELECT);
    });

    makeButton(this, width / 2, btnY + btnGap * 2, 'CHARAKTER', () => {
      this.audio.play('button_click');
      this.scene.start(SCENES.CHARACTER_SELECT, { pickOnly: true });
    });

    makeButton(this, width / 2, btnY + btnGap * 3, 'EINSTELLUNGEN', () => {
      this.audio.play('button_click');
      this.scene.start(SCENES.SETTINGS);
    });

    // Kleiner Copyright-/Hinweistext
    const note = this.add.text(width / 2, height - 14, 'Fiktives Büro • Fiktive Charaktere', {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#8888a0'
    });
    note.setOrigin(0.5, 1);
    void CHARACTERS; // referenced for future use (descriptions)
  }
}
