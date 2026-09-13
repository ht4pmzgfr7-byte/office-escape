import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { makeButton } from '../../ui/Button';

export class SettingsScene extends Phaser.Scene {
  private audio!: AudioSystem;

  constructor() {
    super(SCENES.SETTINGS);
  }

  create() {
    this.audio = new AudioSystem(this);
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#16213e');

    this.add
      .text(width / 2, height * 0.14, 'EINSTELLUNGEN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: `${Math.round(width * 0.06)}px`,
        color: '#ffd23f'
      })
      .setOrigin(0.5);

    const soundLabel = this.add.text(width / 2, height * 0.4, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    });
    soundLabel.setOrigin(0.5);

    const updateLabel = () => {
      soundLabel.setText(`Sound: ${SaveSystem.isSoundEnabled() ? 'AN' : 'AUS'}`);
    };
    updateLabel();

    makeButton(this, width / 2, height * 0.52, 'SOUND UMSCHALTEN', () => {
      SaveSystem.setSoundEnabled(!SaveSystem.isSoundEnabled());
      this.audio.play('button_click');
      updateLabel();
    });

    makeButton(this, width / 2, height * 0.66, 'FORTSCHRITT ZURÜCKSETZEN', () => {
      SaveSystem.resetProgress();
      this.audio.play('button_click');
    }, { color: 0x9c1f1f });

    makeButton(this, width / 2, height * 0.8, 'ZURÜCK', () => {
      this.scene.start(SCENES.MENU);
    });
  }
}
