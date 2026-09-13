import Phaser from 'phaser';

export type SwipeDirection = 'up' | 'down' | 'tap';

/**
 * Erkennt Swipe-Up, Swipe-Down und Tap zuverlässig auf Touch-Geräten.
 * Funktioniert auch mit Maus (für Desktop-Tests im Browser).
 */
export class SwipeInput {
  private scene: Phaser.Scene;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private active = false;

  private readonly SWIPE_THRESHOLD = 28; // px
  private readonly TAP_MAX_DURATION = 220; // ms
  private readonly TAP_MAX_MOVE = 12; // px

  public onSwipe: ((dir: SwipeDirection) => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.input.on('pointerdown', this.handleDown, this);
    this.scene.input.on('pointerup', this.handleUp, this);
    this.scene.input.on('pointerupoutside', this.handleUp, this);
  }

  private handleDown(pointer: Phaser.Input.Pointer) {
    this.startX = pointer.x;
    this.startY = pointer.y;
    this.startTime = this.scene.time.now;
    this.active = true;
  }

  private handleUp(pointer: Phaser.Input.Pointer) {
    if (!this.active) return;
    this.active = false;

    const dx = pointer.x - this.startX;
    const dy = pointer.y - this.startY;
    const dt = this.scene.time.now - this.startTime;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (dt <= this.TAP_MAX_DURATION && absDx < this.TAP_MAX_MOVE && absDy < this.TAP_MAX_MOVE) {
      this.onSwipe?.('tap');
      return;
    }

    if (absDy > absDx && absDy > this.SWIPE_THRESHOLD) {
      this.onSwipe?.(dy < 0 ? 'up' : 'down');
    }
  }

  destroy() {
    this.scene.input.off('pointerdown', this.handleDown, this);
    this.scene.input.off('pointerup', this.handleUp, this);
    this.scene.input.off('pointerupoutside', this.handleUp, this);
  }
}
