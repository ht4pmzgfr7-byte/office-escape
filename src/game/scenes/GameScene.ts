import Phaser from 'phaser';
import { SCENES } from './SceneKeys';
import { getLevel } from '../../config/levels';
import { CHARACTERS } from '../../config/characters';
import { SaveSystem } from '../systems/SaveSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { SwipeInput } from '../systems/SwipeInput';
import { LevelRunner } from '../systems/LevelRunner';
import { ParallaxBackground } from '../systems/ParallaxBackground';
import { ObstacleManager } from '../obstacles/ObstacleManager';
import { Player } from '../entities/Player';
import { randomNpcLine } from '../../config/npcLines';
import { makeButton } from '../../ui/Button';

interface GameSceneData {
  levelId: number;
}

const PLAYER_X_FRACTION = 0.28;

export class GameScene extends Phaser.Scene {
  private levelId = 1;
  private audio!: AudioSystem;
  private input$!: SwipeInput;
  private levelRunner!: LevelRunner;
  private obstacles!: ObstacleManager;
  private background!: ParallaxBackground;
  private player!: Player;

  private groundY = 0;
  private elapsedMs = 0;
  private isPaused = false;
  private isGameOver = false;
  private isVictory = false;

  private hudLevelText!: Phaser.GameObjects.Text;
  private hudProgressBarBg!: Phaser.GameObjects.Rectangle;
  private hudProgressBarFill!: Phaser.GameObjects.Rectangle;
  private hudTimeText!: Phaser.GameObjects.Text;
  private npcSpeechText?: Phaser.GameObjects.Text;
  private npcSpeechTimer = 0;

  private pauseOverlay?: Phaser.GameObjects.Container;
  private door?: Phaser.GameObjects.Container;
  private doorSpawned = false;

  constructor() {
    super(SCENES.GAME);
  }

  init(data: GameSceneData) {
    this.levelId = data?.levelId ?? 1;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.elapsedMs = 0;
  }

  create() {
    const { width, height } = this.scale;
    this.groundY = height * 0.82;
    const def = getLevel(this.levelId);

    this.audio = new AudioSystem(this);
    this.background = new ParallaxBackground(this, width, height, def.background);
    this.obstacles = new ObstacleManager(this, this.groundY);

    const spawnX = width + 80;
    this.levelRunner = new LevelRunner(this, def, this.obstacles, spawnX);

    // Boden-Linie
    this.add.rectangle(width / 2, this.groundY + 2, width, 4, 0x000000, 0.25);

    const charDef = CHARACTERS[SaveSystem.getSelectedCharacter()];
    this.player = new Player(this, width * PLAYER_X_FRACTION, this.groundY, charDef);

    this.input$ = new SwipeInput(this);
    this.input$.onSwipe = dir => {
      if (this.isPaused || this.isGameOver || this.isVictory) return;
      if (dir === 'up' || dir === 'tap') {
        this.player.jump();
        this.audio.play('jump');
      } else if (dir === 'down') {
        this.player.slide();
        this.audio.play('slide');
      }
    };

    this.buildHud(def.title, def.subtitle);
  }

  private buildHud(title: string, subtitle: string) {
    const { width } = this.scale;

    this.hudLevelText = this.add.text(16, 14, `${title.toUpperCase()} · ${subtitle}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    this.hudLevelText.setScrollFactor(0);

    this.hudProgressBarBg = this.add.rectangle(width / 2, 40, width * 0.6, 10, 0x000000, 0.35);
    this.hudProgressBarBg.setScrollFactor(0);
    this.hudProgressBarFill = this.add.rectangle(
      width / 2 - (width * 0.6) / 2,
      40,
      2,
      10,
      0xffd23f,
      1
    );
    this.hudProgressBarFill.setOrigin(0, 0.5);
    this.hudProgressBarFill.setScrollFactor(0);

    this.hudTimeText = this.add.text(width - 16, 14, '0.0s', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    });
    this.hudTimeText.setOrigin(1, 0);
    this.hudTimeText.setScrollFactor(0);

    // Pause-Button oben rechts unter der Zeit
    const pauseBtn = this.add.text(width - 16, 40, '⏸', {
      fontSize: '22px',
      color: '#ffffff'
    });
    pauseBtn.setOrigin(1, 0);
    pauseBtn.setInteractive({ useHandCursor: true });
    pauseBtn.on('pointerup', () => this.togglePause());
  }

  private togglePause() {
    if (this.isGameOver || this.isVictory) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.showPauseOverlay();
    } else {
      this.hidePauseOverlay();
    }
  }

  private showPauseOverlay() {
    const { width, height } = this.scale;
    const container = this.add.container(0, 0);
    const dim = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    const panelTitle = this.add.text(width / 2, height * 0.32, 'PAUSE', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '32px',
      color: '#ffd23f'
    });
    panelTitle.setOrigin(0.5);

    container.add([dim, panelTitle]);
    container.add(
      makeButton(this, width / 2, height * 0.48, 'WEITERSPIELEN', () => this.togglePause())
    );
    container.add(
      makeButton(this, width / 2, height * 0.6, 'LEVEL NEUSTARTEN', () => {
        this.scene.restart({ levelId: this.levelId });
      })
    );
    container.add(
      makeButton(this, width / 2, height * 0.72, 'HAUPTMENÜ', () => {
        this.scene.start(SCENES.MENU);
      })
    );

    this.pauseOverlay = container;
  }

  private hidePauseOverlay() {
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  }

  update(_time: number, deltaRaw: number) {
    if (this.isPaused || this.isGameOver || this.isVictory) return;
    const delta = Math.min(deltaRaw, 50); // Schutz gegen Tab-Wechsel-Sprünge

    this.elapsedMs += delta;
    this.hudTimeText.setText(`${(this.elapsedMs / 1000).toFixed(1)}s`);

    this.levelRunner.update(delta);
    const speed = this.levelRunner.currentSpeed;

    this.background.update(delta, speed);
    this.player.update(delta);

    const dx = (speed * delta) / 1000;
    for (const obj of this.obstacles.getActive()) {
      obj.container.x -= dx;
      if (obj.visual.moves) {
        obj.container.x -= dx * 0.4; // bewegliche Hindernisse etwas schneller
      }
    }
    this.obstacles.cullOffscreen(-120);

    if (this.door) {
      this.door.x -= dx;
    }

    this.updateProgressBar();
    this.checkCollisions();
    this.updateNpcSpeech(delta);
    this.checkFinish();
  }

  private spawnDoor() {
    if (this.doorSpawned) return;
    this.doorSpawned = true;
    const x = this.scale.width + 160;
    const container = this.add.container(x, this.groundY);
    const frame = this.add.rectangle(0, -55, 46, 110, 0x3b2b20);
    const panel = this.add.rectangle(0, -55, 36, 100, 0x6fbf6f);
    const label = this.add.text(0, -55, 'EXIT', {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#0a3d0a'
    });
    label.setOrigin(0.5);
    const sublabel = this.add.text(0, -30, 'Feierabend!', {
      fontFamily: 'sans-serif',
      fontSize: '9px',
      color: '#0a3d0a'
    });
    sublabel.setOrigin(0.5);
    container.add([frame, panel, label, sublabel]);
    this.door = container;
  }

  private updateProgressBar() {
    const progress = this.levelRunner.getProgress();
    const maxW = this.hudProgressBarBg.width;
    this.hudProgressBarFill.width = Math.max(2, maxW * progress);
  }

  private updateNpcSpeech(delta: number) {
    if (this.npcSpeechTimer > 0) {
      this.npcSpeechTimer -= delta;
      if (this.npcSpeechTimer <= 0) {
        this.npcSpeechText?.destroy();
        this.npcSpeechText = undefined;
      }
    }
  }

  private checkCollisions() {
    const playerBounds = this.player.getBounds();

    for (const obj of this.obstacles.getActive()) {
      const bounds = this.obstacles.getBounds(obj);

      if ((obj.type === 'npc_stand' || obj.type === 'npc_arm') && !obj.container.getData('spoke')) {
        // NPC-Spruch anzeigen, sobald er in Bildschirmnähe kommt
        if (obj.container.x < this.scale.width * 0.8) {
          obj.container.setData('spoke', true);
          this.showNpcSpeech(obj.container.x, obj.container.y - obj.visual.height - 10);
        }
      }

      if (Phaser.Geom.Rectangle.Overlaps(playerBounds, bounds)) {
        this.triggerGameOver();
        return;
      }
    }
  }

  private showNpcSpeech(x: number, y: number) {
    this.npcSpeechText?.destroy();
    const line = randomNpcLine();
    this.npcSpeechText = this.add.text(x, y, `"${line}"`, {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 6, y: 4 },
      wordWrap: { width: 160 }
    });
    this.npcSpeechText.setOrigin(0.5, 1);
    this.npcSpeechTimer = 1400;
  }

  private checkFinish() {
    if (this.levelRunner.isFinished() && !this.doorSpawned) {
      this.spawnDoor();
    }
    if (this.door) {
      const playerX = this.player.sprite.x;
      if (playerX >= this.door.x - 20) {
        this.triggerVictory();
      }
    }
  }

  private triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.player.hit();
    this.audio.play('collision');
    this.cameras.main.shake(200, 0.01);
    this.time.delayedCall(500, () => {
      this.audio.play('game_over');
      this.scene.start(SCENES.GAME_OVER, { levelId: this.levelId });
    });
  }

  private triggerVictory() {
    if (this.isVictory) return;
    this.isVictory = true;
    this.player.victory();
    this.audio.play('door_exit');
    SaveSystem.unlockLevel(this.levelId + 1);
    SaveSystem.recordTime(this.levelId, this.elapsedMs);
    this.time.delayedCall(700, () => {
      this.audio.play('level_complete');
      this.scene.start(SCENES.VICTORY, { levelId: this.levelId, timeMs: this.elapsedMs });
    });
  }

  shutdown() {
    this.input$?.destroy();
  }
}
