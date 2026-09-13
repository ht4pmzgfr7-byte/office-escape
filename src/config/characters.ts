// Zentrale Charakter-Konfiguration.
// Alle drei Charaktere sind vollständig eigenständige, frei erfundene
// Cartoon-Figuren (keine realen Personen, kein Bildmaterial Dritter).
// Die Sprites werden zur Laufzeit prozedural (Canvas) gezeichnet, siehe
// src/game/characters/SpriteFactory.ts. Das erlaubt es, die Platzhalter
// später 1:1 durch fertige PNG-Sprite-Sheets zu ersetzen, ohne die
// Spiellogik anzufassen (siehe README, Abschnitt "Assets ersetzen").

export type CharacterId = 'flitzer' | 'chef' | 'gemuetlicher';

export interface CharacterStats {
  /** Multiplikator auf die Grundgeschwindigkeit des Levels */
  speedMultiplier: number;
  /** Multiplikator auf die Sprunghöhe */
  jumpMultiplier: number;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  tagline: string;
  description: string;
  /** Primärfarbe des Körpers/Outfits (Hex) */
  primaryColor: number;
  /** Sekundärfarbe für Details */
  secondaryColor: number;
  /** true = Hamster-Körper (Charakter 2), false = humanoider Cartoon-Körper */
  isHamster: boolean;
  /** Ein Buchstabe/Symbol auf der Kleidung, optional */
  emblem?: string;
  stats: CharacterStats;
  assetFolder: string;
}

export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  flitzer: {
    id: 'flitzer',
    name: 'Der Flitzer',
    tagline: 'Schnell und wendig.',
    description:
      'Ist schon gedanklich beim Feierabend, bevor die Mittagspause vorbei ist.',
    primaryColor: 0x2f6fed, // Blau
    secondaryColor: 0x1a4bb8,
    isHamster: false,
    stats: { speedMultiplier: 1.08, jumpMultiplier: 1.0 },
    assetFolder: 'characters/char1'
  },
  chef: {
    id: 'chef',
    name: 'Der Chef',
    tagline: 'Bereit für den Feierabend.',
    description:
      'Ein pelziger Hamster im roten Hoodie mit großem "A" – der auffälligste im Büro.',
    primaryColor: 0xe23b3b, // Rot
    secondaryColor: 0x9c1f1f,
    isHamster: true,
    emblem: 'A',
    stats: { speedMultiplier: 1.0, jumpMultiplier: 1.0 },
    assetFolder: 'characters/char2'
  },
  gemuetlicher: {
    id: 'gemuetlicher',
    name: 'Der Gemütliche',
    tagline: 'Langsam, aber entspannt.',
    description: 'Groß, kräftig, unaufgeregt – kommt trotzdem immer an.',
    primaryColor: 0x2fa84f, // Grün
    secondaryColor: 0x1c6e33,
    isHamster: false,
    stats: { speedMultiplier: 0.94, jumpMultiplier: 1.12 },
    assetFolder: 'characters/char3'
  }
};

export const CHARACTER_ORDER: CharacterId[] = ['flitzer', 'chef', 'gemuetlicher'];
