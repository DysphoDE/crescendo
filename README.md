# 𝄞 Crescendo – Das musikalische Idle-Abenteuer

Ein Klicker-/Idle-Spiel durch die gesamte Musikgeschichte: vom Händeklatschen am Lagerfeuer über Bach, Beethoven und die Beatles bis zur Harmonie der Sphären. Jedes Instrument, das du kaufst, verändert die Musik, die du hörst – alle Klänge werden live im Browser synthetisiert.

## Starten

Das Spiel braucht einen kleinen lokalen Webserver (wegen der JavaScript-Module):

```bash
npm start
```

Danach im Browser öffnen: <http://localhost:8765>

Ohne npm geht es auch direkt mit Node:

```bash
node tools/serve.mjs 8765
```

**Auf dem Handy spielen:** Der Server zeigt beim Start zusätzlich eine Adresse im WLAN an (z. B. `http://192.168.1.23:8765`). Diese auf dem Handy im selben WLAN öffnen – über „Zum Startbildschirm hinzufügen“ läuft Crescendo dann wie eine App im Vollbild.

Kopfhörer empfohlen. 🎧

## Spielprinzip

- **Schallplatte klicken** (oder **Leertaste**) erzeugt Noten – jeder Klick spielt einen Ton in der aktuellen Tonart.
- **Im Takt klicken** baut **Groove** auf: Perfekte Treffer steigern die gesamte Produktion, lange Kombos schenken Inspiration.
- **20 Instrumente & Ensembles** in 14 Epochen, jeweils mit 8 Verbesserungsstufen – insgesamt über 220 Upgrades, dazu Synergien, Kritiken, Klick-, Groove- und Glücks-Upgrades.
- **Goldene Noten** tauchen zufällig auf: Fortissimo ×7, Applaus, Virtuosen-Solo ×777, Notenregen, Groove-Welle, Instrumenten-Soli, Zugaben …
- **Harmonielehre** mit Inspiration: interaktiver **Quintenzirkel** (26 Tonarten), **7 Kirchentonarten** (verändern Bonus *und* Klang), **Rhythmik**-Lektionen.
- **52 Legenden** – Komponist:innen, Theoretiker, Stars und Bands, jede mit eigener Fähigkeit (Vivaldis Jahreszeiten, Ravels Boléro, Cages 4′33″, Tschaikowskis Kanonen, Kraftwerks Roboter …).
- **Konzerte** in Echtzeit (auch offline) an 14 Orten – vom Lagerfeuer bis zum Mondkrater – mit **43 Raritäten** der Musikgeschichte.
- **Übungsklavier** mit 23 versteckten Melodien zum Entdecken.
- **Da Capo** (Prestige): Goldene Schallplatten, Tantiemen, **Ruhmeshalle**, **11 Genres** (von Klassik über Metal bis Schlager) und **7 Wettbewerbe**.
- **Über 260 Auszeichnungen** (viele geheim), ein **Lexikon** mit allem Entdeckten, Statistik, Offline-Fortschritt.

## Tastenkürzel

| Taste | Funktion |
| --- | --- |
| Leertaste | Klick im Takt |
| 1–9 | Reiter wechseln |
| M | Ton an/aus |
| Umschalt / Strg + Klick | 10 / 100 Instrumente kaufen |
| Esc | Dialog schließen |
| A–K / W–P | Übungsklavier |

## Spielstand

Wird automatisch alle 15 Sekunden im Browser gespeichert (`localStorage`). Unter *Optionen → Spielstand* lässt er sich exportieren und auf einem anderen Gerät importieren.

## Projektstruktur

```
index.html          Grundgerüst
css/                Gestaltung (main.css) und Schriften
js/core/            Spiellogik, Zustand, Formatierung
js/data/            Inhalte: Instrumente, Upgrades, Legenden, Theorie, Raritäten, …
js/audio/           Synthesizer-Instrumente, Musikstile, generativer Sequencer
js/fx/              Hintergrund, Partikel, Visualizer
js/ui/              Oberfläche und Reiter
assets/             Icons, Porträts, Schriften
tools/              Dev-Server, Balancing-Simulation, Icon-Werkzeuge
```

Balancing prüfen: `node tools/sim.mjs 24 casual` (Profile: `active`, `casual`, `idle`).

## Mitwirkende

- Icons: [game-icons.net](https://game-icons.net) (CC BY 3.0) – Lorc, Delapouite, Skoll, Caro Asercion, Zajkonur, Sbed u. a.; Laute & Stimmgabel selbst gezeichnet.
- Porträts: Wikimedia Commons / Wikipedia.
- Schriften: Cinzel, Nunito, Noto Music (SIL Open Font License).
