# Ernst Jünger im Ersten Weltkrieg 1914–1918

Animierte Karte von Ernst Jüngers Weg an der Westfront, vom Kriegseintritt im August 1914 bis zur letzten
Verwundung im August 1918, mit Belegstand und Quellen je Schritt. Aufbau und Design wie das Repo
`erster-Weltkrieg` (Jagdgeschwader Richthofen).

Online: https://kaffeeundkommiss.github.io/Stahlgewitter/

## Aufbau

- `index.html` – Karte mit Zeitleiste (26 Schritte); Kartendaten (Grenzen, Frontlinien) sind eingebettet und
  stammen aus der Karte im Repo `erster-Weltkrieg`. Jüngers Stationen stehen im Skript als `STEPS`, die Koordinaten in `MAP.pts`.
- `verwundungen.html` – die sieben Verwundungen, Beförderungen und Auszeichnungen mit Belegstatus.
- `fassungen.html` – Kriegstagebuch und „In Stahlgewittern“: Fassungen 1920–1978, Deutungen, Folgen für die Belege.
- `glossar.html` – Fachbegriffe; die Einträge stehen in `site.js`.
- `quellen-*.html` – je Seite ein Quellenverzeichnis; die Quellen der Karte stehen in `quellen-karte.js`.
- `site.js`, `site.css`, `basis.css`, `bereich.css` – gemeinsame Bausteine wie im Repo `erster-Weltkrieg`.
- `werkzeuge/vorschau.js` – erzeugt die Vorschaubilder für Linkvorschauen (`vorschau/`).

## Quellenlage

Fast alle Angaben gehen letztlich auf Jüngers eigene Aufzeichnungen zurück (Kriegstagebuch, Buchfassungen).
„In Stahlgewittern“ ist ein selbst verfasster, mehrfach überarbeiteter Text (Fassungen 1920–1978). Die Seiten
kennzeichnen Angaben, die nur aus dem Buch stammen, und nennen abweichende Quellen. Offen: Abgleich mit dem
Kriegstagebuch (Ausgabe Kiesel 2010) und der Regimentsgeschichte des Füsilier-Regiments 73.

Jüngers Texte sind urheberrechtlich geschützt; die Seiten zitieren sie nicht.

## Veröffentlichung

GitHub Pages: Settings → Pages → Deploy from a branch → `main` / `(root)`.
