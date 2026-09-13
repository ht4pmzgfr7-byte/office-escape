import { CharacterId } from '../../config/characters';

const STORAGE_KEY = 'office-escape-save-v1';

export interface SaveData {
  unlockedLevel: number; // höchstes freigeschaltetes Level
  bestTimes: Record<number, number>; // levelId -> beste Zeit in ms
  selectedCharacter: CharacterId;
  soundEnabled: boolean;
}

function defaultSave(): SaveData {
  return {
    unlockedLevel: 1,
    bestTimes: {},
    selectedCharacter: 'flitzer',
    soundEnabled: true
  };
}

export class SaveSystem {
  private static data: SaveData | null = null;

  static load(): SaveData {
    if (this.data) return this.data;
    let result: SaveData;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      result = raw ? { ...defaultSave(), ...JSON.parse(raw) } : defaultSave();
    } catch {
      result = defaultSave();
    }
    this.data = result;
    return result;
  }

  static save() {
    if (!this.data) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // localStorage evtl. nicht verfügbar - Spiel funktioniert trotzdem weiter
    }
  }

  static unlockLevel(levelId: number) {
    const d = this.load();
    if (levelId > d.unlockedLevel) {
      d.unlockedLevel = levelId;
      this.save();
    }
  }

  static isLevelUnlocked(levelId: number): boolean {
    return levelId <= this.load().unlockedLevel;
  }

  static recordTime(levelId: number, timeMs: number) {
    const d = this.load();
    const prev = d.bestTimes[levelId];
    if (prev === undefined || timeMs < prev) {
      d.bestTimes[levelId] = timeMs;
      this.save();
    }
  }

  static getBestTime(levelId: number): number | undefined {
    return this.load().bestTimes[levelId];
  }

  static setSelectedCharacter(id: CharacterId) {
    const d = this.load();
    d.selectedCharacter = id;
    this.save();
  }

  static getSelectedCharacter(): CharacterId {
    return this.load().selectedCharacter;
  }

  static setSoundEnabled(enabled: boolean) {
    const d = this.load();
    d.soundEnabled = enabled;
    this.save();
  }

  static isSoundEnabled(): boolean {
    return this.load().soundEnabled;
  }

  static resetProgress() {
    this.data = defaultSave();
    this.save();
  }
}
