import Phaser from 'phaser';

interface Theme {
  sky: number;
  back: number;
  mid: number;
  floor: number;
}

const THEMES: Record<string, Theme> = {
  office_basic: { sky: 0xcfe0f0, back: 0xdce8f2, mid: 0xb9cfe0, floor: 0x9aa7b5 },
  office_furniture: { sky: 0xcfe0e8, back: 0xd7e4e0, mid: 0xb3cdc7, floor: 0x8fa39c },
  breakroom: { sky: 0xf3e3c8, back: 0xf0d9b0, mid: 0xdcb987, floor: 0xb08c5c },
  meeting_room: { sky: 0xd6d2ea, back: 0xc9c2de, mid: 0xa79ccb, floor: 0x746a99 },
  openspace: { sky: 0xcde3f0, back: 0xb9d4e6, mid: 0x8fb2cc, floor: 0x5f7f99 },
  chaos: { sky: 0xe6c9c9, back: 0xd9a9a9, mid: 0xb87676, floor: 0x7a4747 }
};

/**
 * Einfaches 3-Layer Parallax-System (Hintergrund / Mittelgrund / Boden),
 * gezeichnet als wiederholte, versetzt scrollende Rechtecke + Deko-Elemente.
 */
export class ParallaxBackground {
  private scene: Phaser.Scene;
  private layers: { obj: Phaser.GameObjects.TileSprite; speed: number }[] = [];
  private width: number;
  private height: number;

  constructor(scene: Phaser.Scene, width: number, height: number, themeKey: string) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    const theme = THEMES[themeKey] ?? THEMES.office_basic;

    this.buildLayer(theme.sky, 0, height * 0.55, 0.15, 'sky');
    this.buildLayer(theme.back, height * 0.35, height * 0.35, 0.35, 'back');
    this.buildLayer(theme.mid, height * 0.55, height * 0.25, 0.65, 'mid');
    this.buildLayer(theme.floor, height * 0.8, height * 0.2, 1.0, 'floor');
  }

  private buildLayer(color: number, y: number, h: number, speedFactor: number, key: string) {
    const texKey = `bg_${key}_${color.toString(16)}`;
    if (!this.scene.textures.exists(texKey)) {
      const g = this.scene.add.graphics();
      g.fillStyle(color, 1);
      g.fillRect(0, 0, 128, Math.max(4, Math.round(h)));
      // dezente Deko-Streifen für optischen Tiefeneffekt
      g.fillStyle(0x000000, 0.04);
      for (let x = 0; x < 128; x += 32) {
        g.fillRect(x, 0, 4, Math.max(4, Math.round(h)));
      }
      g.generateTexture(texKey, 128, Math.max(4, Math.round(h)));
      g.destroy();
    }

    const tile = this.scene.add.tileSprite(0, y, this.width, h, texKey);
    tile.setOrigin(0, 0);
    tile.setScrollFactor(0);
    this.layers.push({ obj: tile, speed: speedFactor });
  }

  update(deltaMs: number, baseSpeed: number) {
    const dt = deltaMs / 1000;
    for (const layer of this.layers) {
      layer.obj.tilePositionX += baseSpeed * layer.speed * dt * 0.15;
    }
  }
}
