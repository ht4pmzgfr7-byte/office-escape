// Zentrale, datengetriebene Level-Konfiguration.
// Es gibt KEINE separaten Code-Kopien pro Level - jedes Level ist ein
// Datensatz, den GameScene interpretiert (siehe systems/LevelRunner.ts).

export type ObstacleType =
  | 'box'          // Karton
  | 'chair'        // Bürostuhl (Boden)
  | 'papers'       // Papierstapel (Boden)
  | 'drawer'       // offene Schublade (Boden)
  | 'cable'        // Kabel (Boden, niedrig - muss übersprungen werden)
  | 'printer'      // Drucker (Boden, breit)
  | 'coffee'       // Kaffeemaschine/Tasse
  | 'table'        // Konferenztisch (hoch - muss gerutscht werden)
  | 'npc_stand'    // Mitarbeiter steht (muss übersprungen werden)
  | 'npc_arm'      // Mitarbeiter mit ausgestrecktem Arm (muss gerutscht werden)
  | 'rolling_chair'; // rollender Stuhl (bewegliches Hindernis)

export interface ObstacleSpawn {
  type: ObstacleType;
  /** Wie muss der Spieler reagieren, rein informativ für Balancing */
  requiredAction: 'jump' | 'slide' | 'either';
}

export interface LevelDefinition {
  id: number;
  title: string;
  subtitle: string;
  /** Basisgeschwindigkeit in px/s */
  speed: number;
  /** Geschwindigkeitszuwachs über die Levellänge (px/s über die volle Distanz) */
  speedRamp: number;
  /** Levellänge in "Spawn-Einheiten" (siehe LevelRunner) */
  length: number;
  /** minimaler / maximaler Abstand zwischen Hindernissen in ms, verkürzt sich mit steigender Schwierigkeit */
  minGapMs: number;
  maxGapMs: number;
  /** Chance (0-1), dass statt eines Solo-Hindernisses eine Kombination gespawnt wird */
  comboChance: number;
  /** Hintergrund-Thema, steuert Parallax-Layer-Farbgebung */
  background: 'office_basic' | 'office_furniture' | 'breakroom' | 'meeting_room' | 'openspace' | 'chaos';
  /** Welche Hindernistypen in diesem Level vorkommen dürfen */
  obstaclePool: ObstacleType[];
  /** Erscheinungshäufigkeit von NPCs (0 = keine, 1 = sehr häufig) */
  npcFrequency: number;
  difficulty: number; // 1-10, nur informativ für UI
}

export const LEVELS: LevelDefinition[] = [
  {
    id: 1,
    title: 'Level 1',
    subtitle: 'Der einfache Arbeitstag',
    speed: 180,
    speedRamp: 20,
    length: 14,
    minGapMs: 1500,
    maxGapMs: 2200,
    comboChance: 0,
    background: 'office_basic',
    obstaclePool: ['box', 'chair', 'papers'],
    npcFrequency: 0,
    difficulty: 1
  },
  {
    id: 2,
    title: 'Level 2',
    subtitle: 'Mehr Büromöbel',
    speed: 195,
    speedRamp: 25,
    length: 16,
    minGapMs: 1350,
    maxGapMs: 2000,
    comboChance: 0.1,
    background: 'office_furniture',
    obstaclePool: ['box', 'chair', 'papers', 'drawer', 'cable'],
    npcFrequency: 0,
    difficulty: 2
  },
  {
    id: 3,
    title: 'Level 3',
    subtitle: 'Die Mitarbeiter',
    speed: 205,
    speedRamp: 25,
    length: 18,
    minGapMs: 1300,
    maxGapMs: 1900,
    comboChance: 0.15,
    background: 'office_furniture',
    obstaclePool: ['box', 'chair', 'papers', 'npc_stand', 'npc_arm'],
    npcFrequency: 0.4,
    difficulty: 3
  },
  {
    id: 4,
    title: 'Level 4',
    subtitle: 'Bürochaos',
    speed: 215,
    speedRamp: 30,
    length: 20,
    minGapMs: 1150,
    maxGapMs: 1750,
    comboChance: 0.28,
    background: 'office_furniture',
    obstaclePool: ['box', 'chair', 'papers', 'drawer', 'cable', 'npc_stand', 'npc_arm'],
    npcFrequency: 0.5,
    difficulty: 4
  },
  {
    id: 5,
    title: 'Level 5',
    subtitle: 'Pausenraum',
    speed: 225,
    speedRamp: 30,
    length: 20,
    minGapMs: 1100,
    maxGapMs: 1700,
    comboChance: 0.3,
    background: 'breakroom',
    obstaclePool: ['coffee', 'box', 'table', 'chair', 'npc_stand'],
    npcFrequency: 0.45,
    difficulty: 5
  },
  {
    id: 6,
    title: 'Level 6',
    subtitle: 'Besprechungsraum',
    speed: 235,
    speedRamp: 32,
    length: 22,
    minGapMs: 1000,
    maxGapMs: 1600,
    comboChance: 0.35,
    background: 'meeting_room',
    obstaclePool: ['table', 'chair', 'npc_arm', 'npc_stand', 'papers'],
    npcFrequency: 0.55,
    difficulty: 6
  },
  {
    id: 7,
    title: 'Level 7',
    subtitle: 'Großraumbüro',
    speed: 250,
    speedRamp: 34,
    length: 24,
    minGapMs: 900,
    maxGapMs: 1450,
    comboChance: 0.4,
    background: 'openspace',
    obstaclePool: ['box', 'chair', 'drawer', 'cable', 'npc_stand', 'npc_arm', 'printer'],
    npcFrequency: 0.6,
    difficulty: 7
  },
  {
    id: 8,
    title: 'Level 8',
    subtitle: 'Der chaotische Arbeitstag',
    speed: 265,
    speedRamp: 36,
    length: 26,
    minGapMs: 850,
    maxGapMs: 1350,
    comboChance: 0.45,
    background: 'chaos',
    obstaclePool: ['printer', 'papers', 'drawer', 'chair', 'rolling_chair', 'npc_stand', 'npc_arm', 'cable'],
    npcFrequency: 0.65,
    difficulty: 8
  },
  {
    id: 9,
    title: 'Level 9',
    subtitle: 'Die Bürohölle',
    speed: 285,
    speedRamp: 38,
    length: 28,
    minGapMs: 800,
    maxGapMs: 1250,
    comboChance: 0.55,
    background: 'chaos',
    obstaclePool: ['printer', 'papers', 'drawer', 'chair', 'rolling_chair', 'npc_stand', 'npc_arm', 'cable', 'table'],
    npcFrequency: 0.7,
    difficulty: 9
  },
  {
    id: 10,
    title: 'Level 10',
    subtitle: 'Der letzte Arbeitstag',
    speed: 305,
    speedRamp: 40,
    length: 32,
    minGapMs: 750,
    maxGapMs: 1200,
    comboChance: 0.6,
    background: 'chaos',
    obstaclePool: ['printer', 'papers', 'drawer', 'chair', 'rolling_chair', 'npc_stand', 'npc_arm', 'cable', 'table', 'coffee'],
    npcFrequency: 0.75,
    difficulty: 10
  }
];

export function getLevel(id: number): LevelDefinition {
  const lvl = LEVELS.find(l => l.id === id);
  if (!lvl) throw new Error(`Level ${id} existiert nicht`);
  return lvl;
}
