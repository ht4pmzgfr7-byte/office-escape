import Phaser from 'phaser';

export function makeButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  opts?: { width?: number; height?: number; color?: number; textColor?: string }
): Phaser.GameObjects.Container {
  const width = opts?.width ?? Math.min(340, scene.scale.width * 0.7);
  const height = opts?.height ?? 56;
  const color = opts?.color ?? 0x2f6fed;
  const textColor = opts?.textColor ?? '#ffffff';

  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, width, height, color, 1);
  bg.setStrokeStyle(3, 0x000000, 0.25);
  bg.setInteractive({ useHandCursor: true });

  const text = scene.add.text(0, 0, label, {
    fontFamily: 'Arial, sans-serif',
    fontSize: '20px',
    fontStyle: 'bold',
    color: textColor
  });
  text.setOrigin(0.5);

  container.add([bg, text]);

  bg.on('pointerover', () => bg.setFillStyle(color, 0.85));
  bg.on('pointerout', () => bg.setFillStyle(color, 1));
  bg.on('pointerdown', () => {
    container.setScale(0.96);
  });
  bg.on('pointerup', () => {
    container.setScale(1);
    onClick();
  });

  return container;
}
