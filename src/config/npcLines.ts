// Humorvolle NPC-Sprüche, die kurz eingeblendet werden, wenn ein
// NPC-Hindernis (npc_stand / npc_arm) erscheint. Rein kosmetisch,
// unterbricht den Spielfluss nicht.

export const NPC_LINES: string[] = [
  'Kannst du kurz noch diese Präsentation fertig machen?',
  'Eine Sache hätte ich noch...',
  'Du hast da noch eine Mail!',
  'Kurzes Meeting?',
  'Kannst du das bitte noch unterschreiben?',
  'Hast du kurz Zeit für Feedback?',
  'Wo brennt es denn so eilig?',
  'Nur eine Unterschrift, versprochen!'
];

export function randomNpcLine(): string {
  return NPC_LINES[Math.floor(Math.random() * NPC_LINES.length)];
}
