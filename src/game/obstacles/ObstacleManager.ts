import Phaser from 'phaser';
import { ObstacleType } from '../../config/levels';

export interface ObstacleVisual {
  width: number;
  height: number;
  color: number;
  label: string;
  requiredAction: 'jump' | 'slide' | 'either';
  yOffset: number; // 0 = auf dem Boden, negative Werte = schwebend
  moves?: boolean;
}

// Definiert Größe/Verhalten je Hindernistyp. So bleibt Balancing an einer Stelle.
export const OBSTACLE_VISUALS: Record<ObstacleType, ObstacleVisual> = {
  box:          { width: 40, height: 40, color: 0xb5834a, label: '📦', requiredAction: 'jump', yOffset: 0 },
  chair:        { width: 36, height: 50, color: 0x555a66, label: '🪑', requiredAction: 'jump', yOffset: 0 },
  papers:       { width: 46, height: 22, color: 0xe8e2d0, label: '📄', requiredAction: 'jump', yOffset: 0 },
  drawer:       { width: 50, height: 34, color: 0x8a6b45, label: '🗄', requiredAction: 'jump', yOffset: 0 },
  cable:        { width: 60, height: 14, color: 0x2a2a2a, label: '〰️', requiredAction: 'jump', yOffset: 0 },
  printer:      { width: 56, height: 44, color: 0x444a55, label: '🖨', requiredAction: 'jump', yOffset: 0 },
  coffee:       { width: 30, height: 34, color: 0x6f4a2f, label: '☕', requiredAction: 'jump', yOffset: 0 },
  table:        { width: 30, height: 70, color: 0x6d5636, label: '▮', requiredAction: 'slide', yOffset: -30 },
  npc_stand:    { width: 34, height: 62, color: 0x3d6ea5, label: '🧑', requiredAction: 'jump', yOffset: 0 },
  npc_arm:      { width: 60, height: 20, color: 0x3d6ea5, label: '🙋', requiredAction: 'slide', yOffset: -34 },
  rolling_chair:{ width: 36, height: 50, color: 0x555a66, label: '🪑', requiredAction: 'jump', yOffset: 0, moves: true }
};

interface ActiveObstacle {
  container: Phaser.GameObjects.Container;
  type: ObstacleType;
  visual: ObstacleVisual;
  active: boolean;
}

/**
 * Verwaltet Hindernisse mit Object Pooling, damit während des Spiels
 * keine ständigen neuen GameObjects erzeugt/zerstört werden müssen.
 */
export class ObstacleManager {
  private scene: Phaser.Scene;
  private pool: ActiveObstacle[] = [];
  private groundY: number;

  constructor(scene: Phaser.Scene, groundY: number) {
    this.scene = scene;
    this.groundY = groundY;
  }

  spawn(type: ObstacleType, x: number): ActiveObstacle {
    let obj = this.pool.find(o => !o.active && o.type === type);
    const visual = OBSTACLE_VISUALS[type];

    if (!obj) {
      const container = this.createVisual(visual);
      obj = { container, type, visual, active: true };
      this.pool.push(obj);
    }

    obj.active = true;
    obj.container.setVisible(true);
    obj.container.setPosition(x, this.groundY + visual.yOffset);
    obj.container.setData('scored', false);
    return obj;
  }

  private createVisual(visual: ObstacleVisual): Phaser.GameObjects.Container {
    const c = this.scene.add.container(0, 0);
    const rect = this.scene.add.rectangle(0, -visual.height / 2, visual.width, visual.height, visual.color);
    rect.setStrokeStyle(2, 0x000000, 0.15);
    const text = this.scene.add.text(0, -visual.height / 2, visual.label, {
      fontSize: `${Math.min(visual.width, visual.height) * 0.7}px`
    });
    text.setOrigin(0.5);
    c.add([rect, text]);
    return c;
  }

  getActive(): ActiveObstacle[] {
    return this.pool.filter(o => o.active);
  }

  deactivate(obj: ActiveObstacle) {
    obj.active = false;
    obj.container.setVisible(false);
  }

  /** Entfernt Hindernisse, die den Bildschirm links verlassen haben */
  cullOffscreen(leftBound: number) {
    for (const o of this.pool) {
      if (o.active && o.container.x < leftBound) {
        this.deactivate(o);
      }
    }
  }

  reset() {
    for (const o of this.pool) this.deactivate(o);
  }

  getBounds(obj: ActiveObstacle): Phaser.Geom.Rectangle {
    const v = obj.visual;
    return new Phaser.Geom.Rectangle(
      obj.container.x - v.width / 2,
      obj.container.y - v.height,
      v.width,
      v.height
    );
  }
}
