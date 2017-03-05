# KIMB-Notes

KIMB-Notes ist ein einfaches Notiztool, welches es erlaubt Notizen online zu erstellen, zu teilen und zu organisieren.

Die Notizen werden in Markdown erstellt und sind über das responsive Interface der WebApp auf allen Geräten erreichbar.

*Geplante Features sind u.a. Dateianhänge und vollständige Verschlüsselung.*

### Entwicklung und Features
Siehe [Issues](https://github.com/kimbtech/KIMB-Notes/issues)

### Testen
Das Tool ist unter [notes.5d7.eu](https://notes.5d7.eu/) in der aktuellsten Version verfügbar.

## Technisch
Das Tool besteht aus einem HTML, CSS & JavaScript Client, welcher per AJAX mit einer PHP-API kommuniziert.

Um auch Verbindungsprobleme ausgleichen zu können wird der `localStorage` genutzt.
Außerdem ist die PHP-API so konzipiert, dass automatisch Notizverläufe angelegt werden und statt etwas zu löschen,
es einfach nur versteckt wird.

## Veröffentlichung
Nach Erreichen der Version 1 ist eine Veröffentlichung des Tools unter der GPLv3 geplant.
Dazu wird noch ein [Installer und LibraryHoster](https://github.com/kimbtech/KIMB-Notes/issues/9) integriert.
