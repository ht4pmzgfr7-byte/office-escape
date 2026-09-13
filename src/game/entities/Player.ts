import Phaser from 'phaser';
import { CharacterDefinition } from '../../config/characters';

export type PlayerState = 'run' | 'jump' | 'slide' | 'hit' | 'victory';

const GROUND_Y = 0; // wird relativ zur Szene gesetzt, siehe GameScene
const JUMP_VELOCITY = -640;
const GRAVITY = 1800;
const SLIDE_DURATION = 480; // ms

export class Player {
  public sprite: Phaser.GameObjects.Sprite;
  public state: PlayerState = 'run';
  public velocityY = 0;
  public groundY: number;
  public hitboxWidth: number;
  public hitboxHeight: number;

  private def: CharacterDefinition;
  private scene: Phaser.Scene;
  private slideTimer = 0;
  private isDead = false;

  constructor(scene: Phaser.Scene, x: number, groundY: number, def: CharacterDefinition) {
    this.scene = scene;
    this.def = def;
    this.groundY = groundY;
    this.hitboxWidth = 34;
    this.hitboxHeight = 56;

    this.sprite = scene.add.sprite(x, groundY, `char_${def.id}_run`, 0);
    this.sprite.setOrigin(0.5, 1);
    this.playAnim('run');
  }

  private playAnim(state: PlayerState) {
    const key = `anim_${this.def.id}_${state}`;
    if (this.scene.anims.exists(key)) {
      this.sprite.play(key, true);
    } else {
      this.sprite.setTexture(`char_${this.def.id}_${state}`, 0);
    }
  }

  jump() {
    if (this.isDead) return;
    if (this.state === 'jump') return; // kein Doppelsprung
    if (this.state === 'slide') this.endSlide();
    this.state = 'jump';
    this.velocityY = JUMP_VELOCITY * this.def.stats.jumpMultiplier;
    this.playAnim('jump');
  }

  slide() {
    if (this.isDead) return;
    if (this.state === 'jump') return; // kein Rutschen in der Luft
    this.state = 'slide';
    this.slideTimer = SLIDE_DURATION;
    this.hitboxHeight = 30;
    this.sprite.y = this.groundY;
    this.playAnim('slide');
  }

  private endSlide() {
    this.state = 'run';
    this.hitboxHeight = 56;
    this.playAnim('run');
  }

  hit() {
    if (this.isDead) return;
    this.isDead = true;
    this.state = 'hit';
    this.playAnim('hit');
  }

  victory() {
    this.isDead = true;
    this.state = 'victory';
    this.playAnim('victory');
  }

  reset(x: number) {
    this.isDead = false;
    this.state = 'run';
    this.velocityY = 0;
    this.hitboxHeight = 56;
    this.sprite.x = x;
    this.sprite.y = this.groundY;
    this.playAnim('run');
  }

  update(deltaMs: number) {
    if (this.isDead) return;

    if (this.state === 'jump') {
      this.velocityY += GRAVITY * (deltaMs / 1000);
      this.sprite.y += this.velocityY * (deltaMs / 1000);
      if (this.sprite.y >= this.groundY) {
        this.sprite.y = this.groundY;
        this.velocityY = 0;
        this.state = 'run';
        this.playAnim('run');
      }
    } else if (this.state === 'slide') {
      this.slideTimer -= deltaMs;
      if (this.slideTimer <= 0) {
        this.endSlide();
      }
    }
  }

  /** Rechteck-Hitbox in Weltkoordinaten (Sprite-Origin ist unten-mittig) */
  getBounds(): Phaser.Geom.Rectangle {
    const x = this.sprite.x - this.hitboxWidth / 2;
    const y = this.sprite.y - this.hitboxHeight;
    return new Phaser.Geom.Rectangle(x, y, this.hitboxWidth, this.hitboxHeight);
  }

  destroy() {
    this.sprite.destroy();
  }
}
