# Prüfbericht: vollständiges Einmaleins ab dem Start

Stand: 8. Oktober 2026. Grundlage: veröffentlichter Commit `63f1170`.
Dieser Bericht ersetzt die Aufgabenbereiche und Startwerte aus den früheren
Prüfberichten; Speicher, Belohnungen, Shop, Timer und Offline-Spiel bleiben erhalten.

## Aktuelles Verhalten

- Multiplikation: beide Faktoren 1–10, alle 100 geordneten Kombinationen von
  1×1 bis 10×10 sofort verfügbar. Das gilt auch bei Stufe 1 und im mitwachsenden
  Modus, unabhängig von einem alten, niedrigen Lernstand.
- Division: Divisor und ganzzahliges Ergebnis jeweils 1–10, Dividend höchstens 100. Damit sind 64 ÷ 8, 72 ÷ 9, 56 ÷ 7, 54 ÷ 9 und 100 ÷ 10 verfügbar.
  Die vorher erlaubten 100 ÷ 5 = 20 und 100 ÷ 1 = 100 sind entsprechend dem
  neuen Auftrag ausgeschlossen. Es gibt weder Nullteiler noch Restaufgaben.
- Neuer Startlevel 1,5: Plus und Minus beginnen mit Zahlen/Summen bis etwa 30.
  Alte niedrigere Lernstände werden einmalig angehoben; höhere Lernstände und
  sämtliche Belohnungen bleiben erhalten. Nach Fehlern darf die Schwierigkeit
  weiterhin sinken, und diese Senkung bleibt nach einem Neustart gespeichert.
- Bruchteilige adaptive Stufen ergeben stets eine ganze Anzahl Antwortknöpfe.
  Multiplikationszeit weiterhin 6–20s, Divisionszeit 10–30s. Timeranzeige,
  Zeitkäufe, Pause und PWA funktionieren weiter; Cache-Version jetzt v5.

## Ergebnisse

| Prüfung                                     | Ergebnis                                                                                                                                                                   |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bestehende Mathematiktests                  | 364.146 Prüfungen bestanden                                                                                                                                                |
| Aufgaben-, Lern-, Timer- und Grenzfalltests | 2.647.590 Prüfungen bestanden                                                                                                                                              |
| Zufallsaufgaben                             | 348.000 insgesamt, davon 264.000 mit festem Seed                                                                                                                           |
| Vollständige Tabellen                       | Alle 100 Produkte und alle 100 Umkehraufgaben auf jeder der 33 Stufen von 1 bis 5 nachgewiesen                                                                             |
| Divisionen                                  | Alle 1.000 Dividend-/Divisorpaare bis 100 bzw. 10 vollständig gegen die neuen Grenzen geprüft                                                                              |
| Start-Migration                             | Alte niedrige und höhere Lernstände, unbekannte Speicherfelder, Belohnungen und spätere Senkung geprüft                                                                    |
| Browser                                     | 95 Prüfungen in Edge/Chromium 154 bestanden                                                                                                                                |
| Erste adaptive Aufgabe                      | 1×1 und 10×10 über den tatsächlichen Spielstart deterministisch geprüft; beide korrekt beantwortbar                                                                        |
| Bestehende Funktionen                       | Shop, alle Power-ups, Sterne, Münzen, Abzeichen, Schätze, Navigation, Sprache, Touch/Tastatur, Zeitkäufe, Countdown, Pause, Speicher-Reload und Offline-Neuladen bestanden |
| Syntax und JSON                             | `npm run validate` bestanden                                                                                                                                               |
| Formatierung und Diff                       | `npm run format:check` und `git diff --check` bestanden                                                                                                                    |

Reproduktion: `npm test`, `npm run validate`, `npm run format:check`,
`npm run test:browser`. Browser unter Windows mit `BROWSER_CHANNEL=msedge`.
Nach der Veröffentlichung wird dieselbe Browserprüfung mit
`TEST_BASE_URL=https://allessuper.github.io/math-treasure-quest/` gegen die
öffentliche Version ausgeführt. Safari/iPad und Firefox sind nicht abgedeckt.

## Originalvergleich

Gezielte Änderungen an `app.js`, `service-worker.js`, `tests/math.test.js`,
`tests/learning.test.js`, `tests/browser.test.js`, `tests/offline.test.js`,
`README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` und `docs/UPDATE_REPORT.md`.
Dieser Bericht ist neu. Alle ursprünglichen Funktionen und Dateinamen bleiben
erhalten. Alte Grenzfalltests wurden an die neuen Vorgaben angepasst; zusätzliche
Tests verhindern einen Rückfall auf ausschließlich kleine adaptive Aufgaben.
