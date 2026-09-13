import Phaser from 'phaser';
import { LevelDefinition, ObstacleType } from '../../config/levels';
import { ObstacleManager } from '../obstacles/ObstacleManager';

/**
 * Interpretiert eine LevelDefinition zur Laufzeit und spawnt Hindernisse
 * datengetrieben. Dadurch existiert nur EIN Code-Pfad für alle 10 Level.
 */
export class LevelRunner {
  private scene: Phaser.Scene;
  private def: LevelDefinition;
  private obstacles: ObstacleManager;
  private spawnX: number;

  private elapsedMs = 0;
  private nextSpawnAt = 0;
  private spawnedCount = 0;
  private finished = false;

  public currentSpeed: number;

  constructor(scene: Phaser.Scene, def: LevelDefinition, obstacles: ObstacleManager, spawnX: number) {
    this.scene = scene;
    this.def = def;
    this.obstacles = obstacles;
    this.spawnX = spawnX;
    this.currentSpeed = def.speed;
    this.scheduleNext(0);
  }

  private scheduleNext(fromTime: number) {
    const gap = Phaser.Math.Between(this.def.minGapMs, this.def.maxGapMs);
    this.nextSpawnAt = fromTime + gap;
  }

  private pickObstacle(): ObstacleType[] {
    const pool = this.def.obstaclePool;
    const useCombo = Math.random() < this.def.comboChance;
    const first = Phaser.Utils.Array.GetRandom(pool);

    if (!useCombo) return [first];

    // Kombination: zweites, unterschiedliches Hindernis kurz danach
    let second = Phaser.Utils.Array.GetRandom(pool);
    let guard = 0;
    while (second === first && guard < 5) {
      second = Phaser.Utils.Array.GetRandom(pool);
      guard++;
    }
    return [first, second];
  }

  update(deltaMs: number) {
    if (this.finished) return;

    this.elapsedMs += deltaMs;

    // Geschwindigkeit steigt linear über die Levellänge (definiert durch Anzahl Spawns)
    const progress = Math.min(1, this.spawnedCount / this.def.length);
    this.currentSpeed = this.def.speed + this.def.speedRamp * progress;

    if (this.spawnedCount >= this.def.length) {
      this.finished = true;
      return;
    }

    if (this.elapsedMs >= this.nextSpawnAt) {
      const group = this.pickObstacle();
      group.forEach((type, i) => {
        // Kombinationen leicht versetzt spawnen, damit sie hintereinander kommen
        this.obstacles.spawn(type, this.spawnX + i * 90);
      });
      this.spawnedCount++;
      this.scheduleNext(this.elapsedMs);
    }
  }

  isFinished(): boolean {
    return this.finished;
  }

  getProgress(): number {
    return Math.min(1, this.spawnedCount / this.def.length);
  }
}
