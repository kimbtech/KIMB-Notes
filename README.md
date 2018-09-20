# KIMB-Notes

>
> This is the old repository, the development takes now place under  
> > **https://github.com/KIMB-technologies/KIMB-Notes/**
>

KIMB-Notes ist ein einfaches Notiztool, welches es erlaubt Notizen online zu erstellen, zu teilen und zu organisieren.

Die Notizen werden in Markdown erstellt und sind über das responsive Interface der WebApp auf allen Geräten erreichbar sowie über die Desktop-Application abrufbar.

Es wird Syntax-Highlighting für die gängigen Programmiersprachen unterstützt sowie die Darstellung von Formeln in (La)Tex.

*Geplante Features sind u.a. Dateianhänge und vollständige Verschlüsselung.*

## Installation & Benutzung
Das Tool kann direkt im Browser ausgefüghrt werden, weiterhin gibt es eine [Desktop-Application](https://github.com/KIMB-technologies/KIMB-Notes-Desktop/). Auf mobilen Geräten kann das Tool als WebApp auf dem Homescreen angezeigt werden.

&rarr; alles weitere im [Wiki](https://github.com/KIMB-technologies/KIMB-Notes/wiki/)

### Testen
Eine Demo des Tools befindet sich [hier](https://KIMB-technologies.github.io/KIMB-Notes/system/).

Username: `admin`  
Passwort: `admin`

>
> **Achtung:** Es handelt sich um eine statische Version (ohne Server), es sind also nicht alle Funktionen verfügbar 
> und keine Änderungen möglich.
>

### Entwicklung
Siehe [Issues](https://github.com/KIMB-technologies/KIMB-Notes/issues)

#### Technisch
Das Tool besteht aus einem HTML, CSS & JavaScript Client, welcher per AJAX mit einer PHP-API kommuniziert.

Die [Desktop-Application](https://github.com/KIMB-technologies/KIMB-Notes-Desktop/) ist mittels des Electron Framework realisiert.

Um auch Verbindungsprobleme ausgleichen zu können wird der `localStorage` genutzt.

Außerdem ist die PHP-API so konzipiert, dass automatisch Notizverläufe angelegt werden und somit alles wieder zurück geholt werden kann.

#### Aufbau des Repository
- `/system/` Hauptsystem
- `/install/` Installer
- `/build/` NodeJS Skript für Buildvorgang (bei getaggten Releases ist dies schon ausgeführt
