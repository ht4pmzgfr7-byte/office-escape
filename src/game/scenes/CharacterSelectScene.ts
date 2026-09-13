import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { CHARACTER_ORDER, CHARACTERS, CharacterId } from '../../config/characters';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { makeButton } from '../../ui/Button';

interface SceneData {
  pickOnly?: boolean;
}

export class CharacterSelectScene extends Phaser.Scene {
  private audio!: AudioSystem;
  private selected: CharacterId = 'flitzer';
  private cards: Phaser.GameObjects.Container[] = [];
  private pickOnly = false;

  constructor() {
    super(SCENES.CHARACTER_SELECT);
  }

  init(data: SceneData) {
    this.pickOnly = !!data?.pickOnly;
  }

  create() {
    this.audio = new AudioSystem(this);
    this.selected = SaveSystem.getSelectedCharacter();
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#16213e');

    this.add
      .text(width / 2, height * 0.1, 'CHARAKTER WÄHLEN', {
        fontFamily: 'Arial Black, Arial, sans-serif',
        fontSize: `${Math.round(width * 0.06)}px`,
        color: '#ffd23f'
      })
      .setOrigin(0.5);

    const cardW = Math.min(180, width * 0.27);
    const spacing = cardW + 20;
    const startX = width / 2 - spacing;
    const cardY = height * 0.48;

    this.cards = CHARACTER_ORDER.map((id, i) => this.buildCard(id, startX + i * spacing, cardY, cardW));
    this.refreshSelection();

    makeButton(this, width / 2, height * 0.86, this.pickOnly ? 'ÜBERNEHMEN' : 'WEITER', () => {
      this.audio.play('button_click');
      SaveSystem.setSelectedCharacter(this.selected);
      if (this.pickOnly) {
        this.scene.start(SCENES.MENU);
      } else {
        this.scene.start(SCENES.LEVEL_SELECT);
      }
    });

    makeButton(this, width * 0.15, height * 0.1, '←', () => {
      this.scene.start(SCENES.MENU);
    }, { width: 50, height: 50, color: 0x444a55 });
  }

  private buildCard(id: CharacterId, x: number, y: number, w: number): Phaser.GameObjects.Container {
    const def = CHARACTERS[id];
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, w, w * 1.5, 0x232946, 1);
    bg.setStrokeStyle(4, def.primaryColor, 1);
    bg.setInteractive({ useHandCursor: true });

    const sprite = this.add.sprite(0, w * 0.2, `char_${id}_idle`, 0);
    sprite.setScale(w / 90);
    sprite.play(`anim_${id}_idle`);

    const name = this.add.text(0, w * 0.55, def.name, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    name.setOrigin(0.5);

    const tagline = this.add.text(0, w * 0.68, def.tagline, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#b8bcd8',
      align: 'center',
      wordWrap: { width: w - 12 }
    });
    tagline.setOrigin(0.5);

    container.add([bg, sprite, name, tagline]);

    bg.on('pointerup', () => {
      this.audio.play('character_select');
      this.selected = id;
      this.refreshSelection();
    });

    container.setData('id', id);
    container.setData('bg', bg);
    return container;
  }

  private refreshSelection() {
    this.cards.forEach(card => {
      const id = card.getData('id') as CharacterId;
      const bg = card.getData('bg') as Phaser.GameObjects.Rectangle;
      const isSelected = id === this.selected;
      this.tweens.add({
        targets: card,
        scale: isSelected ? 1.08 : 1.0,
        duration: 150
      });
      bg.setFillStyle(isSelected ? 0x2e3768 : 0x232946, 1);
    });
  }
}
