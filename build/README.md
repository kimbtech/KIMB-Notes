# Build-Skript für KIMB-Notes

Dieses NodeJS-Skript erstellt die Minified Versions der
JS und CSS Dateien und räumt den `/data/` Ordner auf, sodass
das System sauber installiert werden kann.

## Nutzung

1. `npm install`
2. `npm start`

## Quelldateien

Es gibt je ein Array für die JS- und die CSS-Dateien, alle diese Dateien müssen die Endung `.dev.js` bzw. `.dev.css`
haben. Die minimierten Inhalte werden dann in Dateien mit dem gleichen Namen und der Endung `.min.js` bzw. `.min.css`
abgelegt.

### JS-BUILD Kommentar

Eine JS-Datei im oben genannten Array kann zuerst einen Kommentar folgender Form haben.
Es werden dann alle genannten Dateien auch minimiert und der Ausgabe hinzugefügt.

**Die Inhalte der Datei mit dem Kommentar selbst werden nicht übernommen!**

```
/*
BUILD-NOTE:
> $(function(){loginsys()});
>> devjs/cla_offlinemanager.js
>> devjs/globals.js
>> devjs/fun_loginsys.js
*/
```

Die Zeichen `>>` stehen vor einem Dateinamen (relativ zur Datei mit dem Kommentar), das Zeichen `>` vor dem direkt
zu übernehmendem Code (nur eine Zeile!).

>
> Die im Kommentar genannten Dateien können selbst keine weitren Dateien zum hinzufügen nennen.
>

>
> Die Reihenfolge der Angaben im Kommentar gibt auch die Reihenfolge im minimierten Code vor.
>

## JSON-Verzeichnis

Auch hier gibt es ein Array, es listet alle Dateien auf, die vohanden sein sollen. Außerdem kann ein Inhalt für die Dateien
vorgegeben werden.

Der Inhalt `<<untouched>>` lässt eine Datei unverändert.
