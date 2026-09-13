import Phaser from 'phaser';
import { CharacterDefinition } from '../../config/characters';

/**
 * Erzeugt Platzhalter-Sprites zur Laufzeit per Canvas-Zeichnung.
 *
 * WICHTIG FÜR SPÄTEREN ASSET-AUSTAUSCH:
 * Sobald echte Sprite-Sheets vorhanden sind, lege sie unter
 * public/assets/characters/<char1|char2|char3>/<state>.png ab
 * (siehe README) und ersetze in PreloadScene den Aufruf von
 * generateCharacterTextures(...) durch reguläre this.load.spritesheet(...)
 * Aufrufe. Der Rest der Spiellogik (Animationen, Kollisionen, States)
 * bleibt unverändert, da beide Wege am Ende Texture-Keys wie
 * "char_flitzer_run" erzeugen.
 */

type State = 'idle' | 'run' | 'jump' | 'slide' | 'hit' | 'victory';
const STATES: State[] = ['idle', 'run', 'jump', 'slide', 'hit', 'victory'];

const FRAME_W = 64;
const FRAME_H = 80;

export function generateCharacterTextures(scene: Phaser.Scene, def: CharacterDefinition) {
  STATES.forEach(state => {
    const key = `char_${def.id}_${state}`;
    if (scene.textures.exists(key)) return;
    const frames = 4;
    const canvasTex = scene.textures.createCanvas(key, FRAME_W * frames, FRAME_H);
    if (!canvasTex) return;
    const ctx = canvasTex.getContext();

    for (let f = 0; f < frames; f++) {
      drawFrame(ctx, def, state, f, frames);
      // Frame-Rechteck in der Textur registrieren, damit Phaser sie als
      // Spritesheet-Frames (0,1,2,3...) ansprechen kann.
      canvasTex.add(f, 0, f * FRAME_W, 0, FRAME_W, FRAME_H);
    }
    canvasTex.refresh();
  });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  def: CharacterDefinition,
  state: State,
  frame: number,
  totalFrames: number
) {
  const ox = frame * FRAME_W;
  const t = frame / totalFrames; // 0..1 für Animationsphasen
  const bob = Math.sin(t * Math.PI * 2) * (state === 'run' ? 4 : state === 'idle' ? 1.5 : 0);
  const primary = colorToCss(def.primaryColor);
  const secondary = colorToCss(def.secondaryColor);
  const skin = '#f2c396';

  ctx.save();
  ctx.translate(ox, 0);

  const cx = FRAME_W / 2;
  let baseY = 58 + bob * 0.3;

  if (state === 'slide') baseY = 68;
  if (state === 'jump') baseY = 46 - Math.abs(Math.sin(t * Math.PI)) * 6;
  if (state === 'hit') baseY = 60;

  if (def.isHamster) {
    drawHamsterBody(ctx, cx, baseY, primary, secondary, def.emblem, state, t);
  } else {
    drawHumanoidBody(ctx, cx, baseY, primary, secondary, skin, state, t);
  }

  if (state === 'hit') {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, 0, FRAME_W, FRAME_H);
  }

  ctx.restore();
}

function colorToCss(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}

function drawHumanoidBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  primary: string,
  secondary: string,
  skin: string,
  state: State,
  t: number
) {
  const legSwing = state === 'run' ? Math.sin(t * Math.PI * 2) * 10 : 0;
  const armSwing = state === 'run' ? Math.sin(t * Math.PI * 2 + Math.PI) * 12 : 0;

  // Beine
  ctx.fillStyle = secondary;
  ctx.fillRect(cx - 10 + legSwing * 0.4, baseY + 14, 7, state === 'slide' ? 6 : 16);
  ctx.fillRect(cx + 3 - legSwing * 0.4, baseY + 14, 7, state === 'slide' ? 6 : 16);

  // Körper (Torso) - stilisiert oval
  ctx.fillStyle = primary;
  const torsoH = state === 'slide' ? 18 : 28;
  roundRect(ctx, cx - 14, baseY - torsoH, 28, torsoH, 8);
  ctx.fill();

  // Arme
  ctx.fillStyle = primary;
  ctx.fillRect(cx - 18, baseY - torsoH + 4 + armSwing * 0.3, 6, 16);
  ctx.fillRect(cx + 12, baseY - torsoH + 4 - armSwing * 0.3, 6, 16);

  // Kopf (generisch, rund) - bewusst simpel/platzhalterhaft
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(cx, baseY - torsoH - 10, 12, 0, Math.PI * 2);
  ctx.fill();

  // simple Haare
  ctx.fillStyle = '#3b2b20';
  ctx.beginPath();
  ctx.arc(cx, baseY - torsoH - 16, 12, Math.PI, Math.PI * 2);
  ctx.fill();

  // Augen
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx - 4, baseY - torsoH - 10, 1.6, 0, Math.PI * 2);
  ctx.arc(cx + 4, baseY - torsoH - 10, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function drawHamsterBody(
  ctx: CanvasRenderingContext2D,
  cx: number,
  baseY: number,
  primary: string,
  secondary: string,
  emblem: string | undefined,
  state: State,
  t: number
) {
  const legSwing = state === 'run' ? Math.sin(t * Math.PI * 2) * 8 : 0;
  const fur = '#c99b5f';

  // Füße
  ctx.fillStyle = '#a97a3f';
  ctx.fillRect(cx - 12 + legSwing * 0.4, baseY + 12, 9, state === 'slide' ? 5 : 14);
  ctx.fillRect(cx + 4 - legSwing * 0.4, baseY + 12, 9, state === 'slide' ? 5 : 14);

  // Runder Hamsterkörper
  ctx.fillStyle = fur;
  const bodyH = state === 'slide' ? 20 : 30;
  ctx.beginPath();
  ctx.ellipse(cx, baseY - bodyH / 2, 18, bodyH / 2 + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hoodie / Outfit
  ctx.fillStyle = primary;
  roundRect(ctx, cx - 14, baseY - bodyH, 28, bodyH - 4, 10);
  ctx.fill();

  if (emblem) {
    ctx.fillStyle = secondary;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emblem, cx, baseY - bodyH / 2 - 2);
  }

  // Arme
  ctx.fillStyle = primary;
  ctx.fillRect(cx - 19, baseY - bodyH + 6, 6, 14);
  ctx.fillRect(cx + 13, baseY - bodyH + 6, 6, 14);

  // Kopf
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.arc(cx, baseY - bodyH - 8, 13, 0, Math.PI * 2);
  ctx.fill();

  // Ohren
  ctx.beginPath();
  ctx.arc(cx - 9, baseY - bodyH - 17, 4, 0, Math.PI * 2);
  ctx.arc(cx + 9, baseY - bodyH - 17, 4, 0, Math.PI * 2);
  ctx.fill();

  // Wangen
  ctx.fillStyle = '#e6b98a';
  ctx.beginPath();
  ctx.arc(cx - 7, baseY - bodyH - 6, 4, 0, Math.PI * 2);
  ctx.arc(cx + 7, baseY - bodyH - 6, 4, 0, Math.PI * 2);
  ctx.fill();

  // Augen
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx - 5, baseY - bodyH - 9, 1.8, 0, Math.PI * 2);
  ctx.arc(cx + 5, baseY - bodyH - 9, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Nase
  ctx.fillStyle = '#7a4a2b';
  ctx.beginPath();
  ctx.arc(cx, baseY - bodyH - 3, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Frontzähne
  ctx.fillStyle = '#fff';
  ctx.fillRect(cx - 2, baseY - bodyH + 1, 4, 4);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
