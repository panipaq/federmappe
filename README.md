# Federmappe — Farbschemata für Buntstifte

Eine kleine Client-seitige Web-App, um aus einem Set an Buntstiften (standardmäßig die 120 Farben von Albrecht Dürer) Farbschemata, Misch-Familien und Paletten-Ideen abzuleiten — inklusive Farbkreis-Visualisierung.


## Features

- **Farbschemata**: Komplementär, Analog, Triadisch, Split-Komplementär, Quadratisch, Rechteckig, Monochromatisch und 60/30/10 — jeweils berechnet aus einem gewählten Basis-Stift und auf die eigenen, tatsächlich besessenen Stifte gematcht.
- **Farbkreis**: zeigt Zielfarbton vs. tatsächlich gefundenen Stift pro Slot.
- **Familien-Check**: prüft, welche eigenen Stifte sich gedanklich aus 2–4 gewählten Grundfarben mischen lassen.
- **Paletten-Ideen**: schlägt aus 1–2 Ausgangsfarben drei fertige Paletten mit unterschiedlichem Charakter vor (harmonisch, kontrastreich, gedeckt).
- **Eigene Stiftedose verwalten**: Stifte als "besessen" markieren/abwählen, Farben manuell bearbeiten oder neue Sonderfarben ergänzen.
- Persistiert die Stiftedose über `window.storage` (asynchrones Key-Value-Storage der Laufzeitumgebung, in der die App eingebettet ist).

## Lokal starten

Am einfachsten über einen simplen statischen Server (z. B. wegen `@import` der Google Fonts und damit relative Pfade sauber auflösen):

```bash
python3 -m http.server 8080
```

Danach im Browser `http://localhost:8080/` öffnen. Alternativ funktioniert auch das direkte Öffnen von `index.html` per Doppelklick — nur `window.storage` (Persistenz der Stiftedose) steht dann ggf. nicht zur Verfügung, je nachdem in welcher Umgebung die Datei geöffnet wird.

## Eigene Federmappe anpassen

- Über **⚙︎ Auswahl** lässt sich markieren, welche der 120 Farben man tatsächlich besitzt — nur diese fließen in alle Berechnungen ein.
- Per Doppelklick auf einen Stift in der Sidebar (oder über "Bearbeiten") lassen sich Name, Nummer und Hex-Wert eines Stifts anpassen oder der Stift entfernen.
- **+ Stift hinzufügen** legt eine neue, frei editierbare Farbe an (z. B. für Sonderfarben, die nicht in der Werksliste enthalten sind).
