# KIMB-Notes

KIMB-Notes ist ein einfaches Notiztool, welches es erlaubt Notizen online zu erstellen, zu teilen und zu organisieren.

Die Notizen werden in Markdown erstellt und sind über das responsive Interface der WebApp auf allen Geräten erreichbar sowie über die Desktop-Application abrufbar.

Es wird Syntax-Highlighting für die gängigen Programmiersprachen unterstützt sowie die Darstellung von Formeln in (La)Tex.

*Geplante Features sind u.a. Dateianhänge und vollständige Verschlüsselung.*

### Entwicklung
Siehe [Issues](https://github.com/kimbtech/KIMB-Notes/issues)

### Testen
> Es soll Testversion mittles GitHub Pages realisiert werden, welche keine
> PHP-API benutzt und somit nichts speichern kann, aber ein Gefühl für das Tool > vermittelt.

## Installation
Im Ordner `/install/` befindet sich ein Installer, der einen durch die Installation leitet. Währenddessen muss die orginale Ordnerstruktur des Repository
unverändert bleiben. Anschließend kann der Installer inklusive Ordner gelöscht werden, man muss nurnoch auf die Dateien in `\system\`
zugreifen. (die JS-Bibilotheken ausgenommen)

Achten Sie darauf, dass der Ordner `\system\data\` aus dem Web nicht zugreifbar ist, für PHP muss er schreibbar sein.

## Benutzung
Das Tool kann direkt im Browser ausgefüghrt werden, dabei die URL zum Ordner `\system\` eingeben.
Weiterhin gibt es eine [Desktop-Application](https://github.com/kimbtech/KIMB-Notes-Desktop/).
Auf mobilen Geräten kann das Tool als WebApp auf dem Homescreen angezeigt werden (erstellen sie einen Authcode und fügen sie die
vollständige URL als Link dem Homesreen hinzu).

## Technisch
Das Tool besteht aus einem HTML, CSS & JavaScript Client, welcher per AJAX mit einer PHP-API kommuniziert.

Die [Desktop-Application](https://github.com/kimbtech/KIMB-Notes-Desktop/) ist mittels des Electron Framework realisiert.

Um auch Verbindungsprobleme ausgleichen zu können wird der `localStorage` genutzt.

Außerdem ist die PHP-API so konzipiert, dass automatisch Notizverläufe angelegt werden und somit alles wieder zurück geholt werden kann.

## Aufbau des Repository
- `/system/` Hauptsystem
- `/install/` Installer
- `/js-libs/` benötigte JS-Bibilotheken (extern und somit CDN-Nutzung möglich)
