# Prüfbericht: Mathe-Schatzreise, 3. Klasse

Dieser Bericht dokumentiert die erste Umsetzung. Für den anschließend erweiterten
Divisionsbereich und die sichtbare Timeranzeige gilt [UPDATE_REPORT.md](UPDATE_REPORT.md).

Datum: 8. Oktober 2026. Grundlage: aktuelle Originalversion
`fa4f0731adb3bbeb1dd722a17168c328b6f678dc` von `AllesSuper/math-treasure-quest`.
Das Repository wurde frisch geklont; die Änderungen liegen auf einem eigenen
Branch. Die Originalversion bestand zunächst ihre 364.141 bisherigen Prüfungen.

## Testergebnisse

| Prüfung                                                                  | Ergebnis                                                                                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Bestehende Mathematiktests mit angepassten Faktoren und Antwortbereichen | 364.146/364.146 bestanden                                                                                                  |
| Neue Lern-, Aufgaben-, Timer- und Grenzfallprüfungen                     | 2.646.276/2.646.276 bestanden                                                                                              |
| Zufallsaufgaben                                                          | 348.000 insgesamt; davon 264.000 reproduzierbar mit Seed 8102026                                                           |
| Schwierigkeitsstufen                                                     | 33 Werte von 1 bis 5 in Schritten von 0,125; je 2.000 Aufgaben pro Rechenart und Wert                                      |
| Mischmodus                                                               | 2.000 simulierte Runden mit 10 oder 25 Stationen; Differenz der Häufigkeiten höchstens 1                                   |
| Service Worker                                                           | Vorladen aller 9 Einträge, Cache-Wechsel v2→v3, Offline-Fallback, Navigation und ignorierte Fremd-/POST-Anfragen bestanden |
| Browser-Regressionssuite                                                 | 77 Prüfungen in Microsoft Edge 154.0.4258.62 (Chromium), Playwright 1.62.1 bestanden                                       |
| JavaScript-Syntax und JSON                                               | `npm run validate` bestanden                                                                                               |
| Formatierung                                                             | `npm run format:check` bestanden                                                                                           |
| Diff-Kontrolle                                                           | `git diff --check` bestanden; keine Originaldatei entfernt oder umbenannt                                                  |

Die Browserprüfungen verwenden eine kontrollierte Uhr, um vollständige Runden,
Pausen und Timeouts reproduzierbar und ohne lange Wartezeiten zu testen.

## Geprüfte Aufgaben und Lernregeln

- Addition mit zwei/drei nicht negativen Ganzzahlen, Summe bis 100; leichte
  Aufgaben beginnen bis 20. Grenzfälle `50 + 50` und `0 + 0 + 100` geprüft.
- Subtraktion bis Ausgangszahl 100 ohne negatives Ergebnis; `100 − 100` und
  `100 − 0` geprüft.
- Multiplikation mit beiden Faktoren 2–10; alle 81 geordneten Kombinationen
  werden auf Stufe 5 erzeugt. `2 × 2` und `10 × 10` geprüft.
- Division mit Dividend ≤100, Divisor 2–10 und ganzzahligem Ergebnis 1–10;
  `100 ÷ 10` sowie kleinstes Ergebnis 1 geprüft. Null, Rest, falsche Ergebnisse,
  zusätzliche/falsche Operanden, Brüche und unzulässige Faktoren abgewiesen.
- Antwortbereiche, richtige Antwort, eindeutige Auswahlmöglichkeiten und
  Auswahlanzahl geprüft; auch an den Bereichsgrenzen.
- Timer für jede erzeugte Aufgabe mit vier verschiedenen Antwortgeschwindigkeiten
  geprüft: Multiplikation 6–20s, Division 10–30s, Addition/Subtraktion 12–40s.
  Konkrete schwierigere Beispielaufgaben erhalten mehr Zeit; dieselbe Aufgabe
  erhält unabhängig vom Stufennamen dasselbe Ausgangsbudget.
- Je Rechenart unabhängige Lernstände, Start bei Stufe 1, langsame Erhöhung
  um 0,125 nach vier Erfolgen, behutsame Senkung bei Fehlern, Begrenzung 1–5,
  Speicher-Roundtrip und Erholung von fehlerhaften Lernwerten geprüft.
- Neue Divisions-, Meilenstein- und Erklärungstexte für alle 16 Sprachen geprüft.

## Geprüfte Browserfunktionen

- Vollständige Standardrunde mit 25 Stationen, Schnellrunde mit 10 Stationen,
  ausgewogene Mischrunden und jede der vier einzeln gewählten Rechenarten.
- Erfolgsmeldung nach fünf Aufgaben, Sterne, Münzen, Genauigkeit, Abzeichen,
  Schatztruhe und Bewahrung einer bereits gespeicherten Schatzsammlung.
- Shop-Kauf, Münzabzug, Begleiter-Kauf und Auswahl, Joker ohne Lernbonus,
  50:50, Schutzschild und Rückschritt um drei Stationen.
- Fehlererklärung und Umkehraufgabe bei Division; Fortsetzen per Schaltfläche.
- Kauf von +10s für drei Sterne und +5s per Zeit-Power-up; Zeit bleibt nach
  Pause erhalten, auch bei wiederholter Escape-Taste. Lösungsschirme starten
  keinen neuen Timer und buchen keinen zweiten Lernfehler.
- Navigation während eines verzögerten Aufgabenwechsels, Touch-Antworten,
  Tastaturantwort per Enter, Pause per Escape und Sprachauswahl.
- Erhalt alter Speicherfelder einschließlich unbekannter Zusatzfelder;
  Lernfortschritt nach Reload; bestehende Timer-/Blitz-Einstellungen bleiben
  erhalten, während Neuinstallationen ohne Zeitdruck starten.
- Beschädigter Speicher, vollständig gesperrter Speicher und ausdrücklicher
  Fortschrittsreset einschließlich Lernstände.
- Tatsächlich vom Service Worker kontrollierte Seite offline neu geladen und
  Division gespielt; Tabletansicht und Mobilansicht ohne horizontalen Überlauf.
- Visuelle Kontrolle der Screenshots: Die ursprünglich trotz `hidden` sichtbaren
  Timer-Elemente werden durch die korrigierte CSS-Regel ausgeblendet. Keine
  JavaScript-Fehler im geprüften Browserablauf.

## Vergleich jeder geänderten Originaldatei

Die Größen sind UTF-8-Bytes mit vereinheitlichten LF-Zeilenenden, damit Windows-
Zeilenenden nicht als Inhaltsverlust erscheinen.

| Datei                           | Original | Geändert | Bewertung                                                                                                            |
| ------------------------------- | -------: | -------: | -------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/quality.yml` |      912 |     1120 | Neue Tests und Browserprüfung eingebunden                                                                            |
| `CHANGELOG.md`                  |     4125 |     5396 | Änderungen additiv dokumentiert                                                                                      |
| `CONTRIBUTING.md`               |     2943 |     3432 | Aufgabenbereiche und Testanleitung aktualisiert                                                                      |
| `README.md`                     |     9508 |    11581 | Vier Rechenarten, Lernstände und Timer dokumentiert                                                                  |
| `app.js`                        |   125484 |   136135 | Generierung, Lernstände, Erklärungen und gezielte Fehlerkorrekturen                                                  |
| `index.html`                    |    20065 |    20692 | Division ergänzt, Metadaten und Stationszahl aktualisiert                                                            |
| `manifest.json`                 |      844 |      846 | Beschreibung für Klasse 3                                                                                            |
| `package.json`                  |     1110 |     1301 | Version, Testskripte und reine Entwicklungswerkzeuge                                                                 |
| `service-worker.js`             |     2519 |     2519 | Ausschließlich Cache-Version aktualisiert                                                                            |
| `styles.css`                    |    33560 |    33563 | Ausgeblendete Elemente zuverlässig unsichtbar                                                                        |
| `tests/math.test.js`            |     5792 |     5791 | **Warnsignal geprüft: 1 Byte kleiner**, gezielte Anpassung von Faktoren und Antwortvalidierung; keine Tests entfernt |

Zusätzliche Dateien: `package-lock.json`, `tests/learning.test.js`,
`tests/offline.test.js`, `tests/browser.test.js` und dieser Bericht.
Die repo-weite Formatierung änderte in mehreren weiteren Originaldateien nur
lokale Zeilenenden; Git enthält dafür keine inhaltlichen Änderungen.

Ein automatischer Vergleich des vollständig geladenen Originalcodes mit dem
geänderten Code bestätigt: Alle 105 ursprünglichen benannten Funktionen sind
weiter vorhanden (112 insgesamt); die Lösungsfunktion wurde für direkte Tests
ins gemeinsame Modul verschoben und erweitert. Sprachliste, vorhandene
Übersetzungsschlüssel und Texte (außer der aktualisierten Mischmodusbeschreibung),
Abzeichenkatalog, alle 50 Schätze, Begleiter und ursprüngliche Shopartikel mit
ihren Preisen sind erhalten. Die vorhandene +5s-Funktion ist jetzt zusätzlich
als kaufbarer Shopartikel erreichbar. Laufzeitabhängigkeiten wurden nicht ergänzt.

## Reproduktion und Prüfumfang

```sh
npm ci
npm test
npm run validate
npm run format:check
npx playwright install chromium
npm run test:browser
```

Lokal unter Windows wurde für den letzten Befehl `BROWSER_CHANNEL=msedge`
verwendet. GitHub CI führt dieselben Tests mit Playwright-Chromium aus. Die
lokalen Ergebnisse belegen Edge/Chromium; Safari/iPad, Firefox und ein
pädagogischer Praxistest mit Kindern sind damit nicht abgedeckt. Die vorhandene
Rückschrittmechanik bleibt erhalten; dadurch können zusätzliche Übungsversuche
häufiger eine Rechenart enthalten als der ausgewogene Stationsplan.
