# Office Escape 🏃‍♂️🚪

Ein humorvoller 2D-Side-Scrolling-Runner: Drei Kollegen versuchen, lebend
bis zur Ausgangstür des Büros zu kommen, während Kartons, Bürostühle,
Kabel und gesprächige Mitarbeiter sie ständig aufhalten.

Gebaut mit **TypeScript + Phaser 3 + Vite**, mobile-first, komplett
touch-gesteuert und als **installierbare PWA** vorbereitet (funktioniert
auf dem iPhone-Homescreen ohne App Store).

> **Hinweis zu den Charakteren:** Alle drei Charaktere ("Der Flitzer",
> "Der Chef", "Der Gemütliche") sind vollständig frei erfundene
> Cartoon-Figuren. Es wird kein Bildmaterial oder Gesicht realer Personen
> verwendet. Die aktuellen Sprites sind bewusst einfache, prozedural
> gezeichnete Platzhalter (siehe Abschnitt "Assets ersetzen").

---

## 1. Installation

Voraussetzung: Node.js 18+ (bzw. eine Cloud-IDE/GitHub Codespace, falls
du komplett vom iPhone aus arbeitest, wie bei deinem Steuerrechner-Projekt).

```bash
npm install
```

## 2. Development-Server starten

```bash
npm run dev
```

Öffnet das Spiel lokal (z. B. unter `http://localhost:5173`). Zum Testen
der Touch-Steuerung im Browser: Maus gedrückt halten + nach oben/unten
ziehen simuliert Swipe Up/Down.

## 3. Build erstellen

```bash
npm run build
```

Erzeugt den produktionsfertigen Build im Ordner `dist/`.

## 4. Deployment auf GitHub Pages

Der Workflow `.github/workflows/deploy.yml` baut das Projekt automatisch
bei jedem Push auf `main` und veröffentlicht es über GitHub Pages.

**Einmalige Einrichtung:**
1. Repository auf GitHub erstellen (z. B. `office-escape`).
2. In den Repo-Einstellungen unter **Settings → Pages** als Quelle
   **"GitHub Actions"** auswählen.
3. In `vite.config.ts` den `base`-Pfad an deinen Repo-Namen anpassen:
   ```ts
   base: '/office-escape/', // muss exakt deinem Repo-Namen entsprechen
   ```
4. Code pushen (bzw. Dateien über die GitHub-Weboberfläche hochladen,
   wie du es bei deinem Steuerrechner gemacht hast).
5. Unter dem Tab **Actions** den Build-Status prüfen.
6. Die fertige URL lautet in der Regel:
   `https://DEIN-USERNAME.github.io/office-escape/`

## 5. Auf dem iPhone installieren (PWA)

1. Die GitHub-Pages-URL in Safari öffnen.
2. Teilen-Button → **"Zum Home-Bildschirm"**.
3. Das Spiel läuft danach im Vollbild ohne Browserleiste.

**Wichtig:** Bei jedem Update musst du die `CACHE_VERSION` in
`public/sw.js` erhöhen (z. B. `v1` → `v2`), damit bereits installierte
Home-Screen-Icons das Update erhalten – genau wie bei deinem
Steuerrechner-Projekt.

## 6. Spätere Capacitor-Integration (iOS/Android App Store)

Die Architektur ist bewusst so aufgebaut, dass sie ohne Neuentwicklung
in eine native App verpackt werden kann:

- Die gesamte Spiellogik nutzt **nur Touch-/Pointer-Events**
  (`SwipeInput.ts`), keine Maus-spezifische Logik.
- `localStorage` (SaveSystem) funktioniert unverändert in Capacitor-WebViews.
- Wenn du bereit bist:
  ```bash
  npm install @capacitor/core @capacitor/cli
  npx cap init "Office Escape" "com.deinname.officeescape"
  npx cap add ios
  npx cap add android
  npm run build
  npx cap copy
  ```
- Danach in Xcode/Android Studio öffnen und wie eine normale native App
  bauen/signieren/veröffentlichen.

---

## 7. Projektarchitektur

```
src/
  game/
    scenes/        # BootScene, MenuScene, CharacterSelectScene,
                    # LevelSelectScene, SettingsScene, GameScene,
                    # GameOverScene, VictoryScene
    entities/       # Player.ts (Zustandsmaschine: run/jump/slide/hit/victory)
    obstacles/      # ObstacleManager.ts (Object Pooling)
    characters/     # SpriteFactory.ts (prozedurale Platzhalter-Sprites)
    systems/        # SwipeInput, LevelRunner, ParallaxBackground,
                    # SaveSystem, AudioSystem
  config/
    characters.ts   # Zentrale Charakterdefinitionen
    levels.ts       # Zentrale, datengetriebene Level-Konfiguration
    npcLines.ts     # Mitarbeiter-Sprüche
  ui/
    Button.ts       # Wiederverwendbarer UI-Button
public/
  assets/characters/char1|char2|char3/  # Zielordner für finale Sprites
  sw.js             # Service Worker (PWA-Cache)
  manifest.webmanifest
.github/workflows/deploy.yml  # Build + GitHub Pages Deployment
```

**Wichtiges Prinzip:** Es gibt **keine** zehn separaten Kopien der
Levellogik. Jedes Level ist ein Datensatz in `src/config/levels.ts`
(Geschwindigkeit, Hindernispool, Spawn-Abstände, NPC-Häufigkeit,
Hintergrund-Thema). `LevelRunner.ts` interpretiert diese Daten zur
Laufzeit und ist der einzige Code-Pfad für alle Level.

---

## 8. Neues Level hinzufügen

1. Öffne `src/config/levels.ts`.
2. Füge ein neues Objekt zum `LEVELS`-Array hinzu, z. B.:
   ```ts
   {
     id: 11,
     title: 'Level 11',
     subtitle: 'Die Überstunde',
     speed: 320,
     speedRamp: 40,
     length: 34,
     minGapMs: 700,
     maxGapMs: 1100,
     comboChance: 0.6,
     background: 'chaos',
     obstaclePool: ['printer', 'papers', 'rolling_chair', 'npc_arm'],
     npcFrequency: 0.8,
     difficulty: 11
   }
   ```
3. Fertig – Levelauswahl, Speicherstand und Spiellogik greifen das neue
   Level automatisch auf. Kein weiterer Code nötig.

## 9. Neues Hindernis hinzufügen

1. Öffne `src/config/levels.ts` und ergänze den `ObstacleType`-Union-Typ
   um deinen neuen Typ, z. B. `'plant'`.
2. Öffne `src/game/obstacles/ObstacleManager.ts` und ergänze einen
   Eintrag in `OBSTACLE_VISUALS`:
   ```ts
   plant: { width: 30, height: 46, color: 0x2e7d32, label: '🌿', requiredAction: 'jump', yOffset: 0 }
   ```
3. Trage den neuen Typ in `obstaclePool` der gewünschten Level in
   `levels.ts` ein.

---

## 10. Charakter-Assets ersetzen (Platzhalter → finale Sprites)

Aktuell werden alle Charakter-Sprites **prozedural per Canvas**
gezeichnet (`src/game/characters/SpriteFactory.ts`), damit das Spiel
sofort ohne externe Bilddateien lauffähig ist.

Um sie später durch fertige Sprite-Sheets zu ersetzen:

1. Lege PNG-Sprite-Sheets ab unter:
   ```
   public/assets/characters/char1/idle.png, run.png, jump.png, slide.png, hit.png, victory.png
   public/assets/characters/char2/...
   public/assets/characters/char3/...
   ```
2. Öffne `src/game/scenes/BootScene.ts` und ersetze den Aufruf von
   `generateCharacterTextures(...)` durch reguläres Laden, z. B.:
   ```ts
   this.load.spritesheet('char_flitzer_run', 'assets/characters/char1/run.png', {
     frameWidth: 64,
     frameHeight: 80
   });
   ```
3. Die Texture-Keys müssen dem Schema `char_<id>_<state>` folgen
   (`<id>` ∈ `flitzer | chef | gemuetlicher`), damit `Player.ts` und die
   Menüs unverändert weiterfunktionieren.

## 11. Sound-Assets ersetzen

Aktuell erzeugt `AudioSystem.ts` kurze synthetische Placeholder-Sounds
per WebAudio. Für finale Sounds:

1. Dateien ablegen unter `public/assets/audio/<name>.mp3`.
2. In einer Preload-Szene laden: `this.load.audio('jump', 'assets/audio/jump.mp3')`.
3. In `AudioSystem.play()` `this.scene.sound.play(key)` statt der
   synthetischen Erzeugung verwenden.

---

## Steuerung

- **Swipe nach oben** → Springen
- **Swipe nach unten** → Rutschen/Ducken
- **Tap** → Springen (Alternative)

## Bekannte Vereinfachungen (bewusste Scope-Entscheidungen im Vertical Slice)

- Kollisionsboxen sind einfache Rechtecke (kein Pixel-perfektes Masking) –
  bewusst großzügig für faires Gameplay.
- NPC-Sprüche sind kosmetisch und unterbrechen den Spielfluss nicht.
- Sound ist aktuell synthetisch (WebAudio), keine externen Audiodateien.
