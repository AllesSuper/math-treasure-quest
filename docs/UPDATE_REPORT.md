# Prüfbericht: erweiterte Division und Countdown

Stand: 8. Oktober 2026. Ausgangsversion der Ergänzung: `da96757`.
Diese Ergänzung ersetzt die Divisionsgrenzen und Timeranzeige aus dem ersten
[Testbericht](TEST_REPORT.md); alle übrigen Regeln und Spielfunktionen bleiben erhalten.

## Änderungen

- Dividenden 1–100, Divisoren 1–10, ganzzahlige Ergebnisse 1–100, ohne Rest.
  Damit sind `81 ÷ 9 = 9`, `100 ÷ 5 = 20`, `72 ÷ 8 = 9`, `3 ÷ 1 = 3` und
  `100 ÷ 1 = 100` zulässig. Der Anfängerbereich wächst weiterhin langsam von
  Dividenden bis 20 auf bis 100.
- Antworten und falsche Auswahlmöglichkeiten dürfen jetzt bis 100 reichen.
  Division durch null, Restaufgaben, negative Zahlen und Dividenden über 100
  werden weiterhin abgewiesen.
- Bei aktiviertem Zeit-Modus zeigt jede Rechenart und auch die Mischung einen
  sichtbaren, laufenden Countdown im Aufgabenring und in der oberen Spielleiste.
  Der SVG-Ring wird über sein `hidden`-Attribut korrekt ein- und ausgeblendet.
- Die normale Divisionszeit bleibt zwischen 10 und 30 Sekunden. Division durch
  1 erhält eine kurze Basiszeit; schwierigere Aufgaben berücksichtigen Dividend
  und Divisor. Gekaufte Zusatzzeit und Pause bleiben erhalten.
- Beschreibungen für alle 16 Sprachen und die Dokumentation angepasst;
  PWA-Cache auf `mathe-schatzreise-v4` aktualisiert.

## Prüfungen

| Prüfung                                     | Ergebnis                                                                                                                                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Bestehende Mathematiktests                  | 364.146 Prüfungen bestanden                                                                                                                   |
| Lern-, Aufgaben-, Timer- und Grenzfalltests | 2.648.291 Prüfungen bestanden                                                                                                                 |
| Zufallsaufgaben                             | 348.000 insgesamt, davon 264.000 reproduzierbar über 33 Schwierigkeitswerte                                                                   |
| Neue Divisionsbeispiele                     | Alle fünf Beispiele validiert und tatsächlich vom Zufallsgenerator erzeugt                                                                    |
| Offline-Service-Worker                      | Vorladen, Wechsel v3→v4, Cache-Fallback und Navigation bestanden                                                                              |
| Browser                                     | 92 Prüfungen in Edge/Chromium 154 bestanden                                                                                                   |
| Sichtbarer Countdown                        | Alle fünf Modi; synchron in Kopfzeile/Ring, nach 1,1 Sekunden abnehmend und auf der nächsten Aufgabe wieder sichtbar                          |
| Regressionen                                | Vollständige Runden, Shop, alle Power-ups, Belohnungen, Speicher, Touch/Tastatur, Pause, Timeout, mobile Ansicht und Offline-Reload bestanden |
| Syntax, JSON, Formatierung, Diff            | Bestanden                                                                                                                                     |

Reproduktion: `npm test`, `npm run validate`, `npm run format:check` und
`npm run test:browser`. Windows-Browserprüfung mit `BROWSER_CHANNEL=msedge`.
Die Browserprüfung unterstützt außerdem `TEST_BASE_URL`, um nach dem Deployment
dieselben Abläufe gegen den öffentlichen GitHub-Pages-Link zu prüfen. Testdaten
liegen ausschließlich im isolierten Browserkontext.

## Dateivergleich

Gegen `da96757` geprüft: `app.js`, `index.html`, `service-worker.js`,
`tests/learning.test.js`, `tests/browser.test.js`, `tests/offline.test.js`,
`README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` und `docs/TEST_REPORT.md`.
Dieser ergänzende Bericht ist neu. Keine Originaldateien, ursprünglichen
Funktionen oder bestehenden Tests entfernt. Sprachbeschreibungen und bisherige
Divisions-Grenztests wurden gezielt an die neu beauftragten Bereiche angepasst.

Die Änderungen werden nach erfolgreicher CI über den vorhandenen Pull Request
in `main` übernommen und mit dem bestehenden GitHub-Pages-Workflow veröffentlicht.
Live-Adresse: <https://allessuper.github.io/math-treasure-quest/>.
