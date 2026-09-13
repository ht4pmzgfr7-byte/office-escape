import Phaser from 'phaser';
import { SaveSystem } from './SaveSystem';

export type SfxKey =
  | 'jump'
  | 'slide'
  | 'collision'
  | 'level_complete'
  | 'button_click'
  | 'character_select'
  | 'game_over'
  | 'door_exit';

/**
 * Zentrales Soundsystem. Erzeugt aktuell kurze, synthetische Placeholder-
 * Sounds per WebAudio (keine externen Dateien nötig, damit das Spiel
 * sofort ohne Assets läuft). Sobald echte Sound-Dateien vorhanden sind,
 * lege sie unter public/assets/audio/<key>.mp3 ab und ersetze play()
 * durch this.scene.sound.play(key) nach Laden via this.scene.load.audio(...).
 */
export class AudioSystem {
  private ctx: AudioContext | null = null;

  constructor(_scene: Phaser.Scene) {}

  private getCtx(): AudioContext | null {
    if (!SaveSystem.isSoundEnabled()) return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  play(key: SfxKey) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const presets: Record<SfxKey, { freq: number; dur: number; type: OscillatorType }> = {
      jump: { freq: 520, dur: 0.12, type: 'square' },
      slide: { freq: 220, dur: 0.14, type: 'sawtooth' },
      collision: { freq: 110, dur: 0.25, type: 'square' },
      level_complete: { freq: 660, dur: 0.35, type: 'triangle' },
      button_click: { freq: 440, dur: 0.06, type: 'sine' },
      character_select: { freq: 500, dur: 0.1, type: 'sine' },
      game_over: { freq: 130, dur: 0.4, type: 'sawtooth' },
      door_exit: { freq: 800, dur: 0.3, type: 'triangle' }
    };

    const p = presets[key];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = p.freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + p.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + p.dur);
  }
}
