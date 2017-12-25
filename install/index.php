<?php

/*************************************************/
// KIMB-Notes
// Copyright (c) 2017 by KIMB-technologies
// https://github.com/kimbtech/KIMB-Notes/
/*************************************************/
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 3
// published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.
/*************************************************/
// http://www.gnu.org/licenses/gpl-3.0
// http://www.gnu.org/licenses/gpl-3.0.txt
/*************************************************/

//Session
//	Session
session_name( "NotestoolInstaller" );
session_start();

//	Fehler aus
error_reporting( 0 );
//	Type Header
header('Content-Type: text/html; charset=utf-8');

//Ausgabe
class Output{

	private $templatehtml;

	private $boxes = array();

	public function __construct(){
		$this->templatehtml = file_get_contents( __DIR__ . '/template.html' );
	}

	public function addBox( $cont ){
		$this->boxes[] = '<div class="box">' . $cont . '</div>';
	}

	public function __destruct(){
		$boxes = implode ( $this->boxes, "\r\n\r\n\r\n" );
		echo str_replace( '<<<--BOXES-->>>', $boxes, $this->templatehtml );
	}
}
$out = new Output();

//Zugriff prüfen
$access = false;
if(
	is_dir( __DIR__.'/../system/data/' )
){
	if(
		is_file( __DIR__.'/../system/data/config.json' )
		&&
		file_get_contents( __DIR__.'/../system/data/config.json' ) == '[]'
	){
		$access = true;
	}
	else if( !is_file( __DIR__.'/../system/data/config.json' ) ){
		$access = true;
	}
	else if( !empty($_SESSION['config-allowed']) && $_SESSION['config-allowed'] + 600 > time() ){
		$access = true;
	}
}
if( !$access ){
	$out->addBox( '<h2 class="error">Das Installationstool ist gesperrt!</h2>' );
	$out->addBox( '<div class="message">Zum Freischalten löschen Sie die <code>config.json</code>.</div>' );
	die();
}
else{
	//nach dem Schreiben der Konfiguratiosndatei ist noch ein User zu erstellen,
	//	daher Zugriff beibehalten!
	$_SESSION['config-allowed'] = time();
}

//SiteURL
//URL bestimmen
if(isset($_SERVER['HTTPS'])){
	$urlg = 'https://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
}
else{
	$urlg = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
}
//	Slash am Ende
$siteurl = substr($urlg, 0, - strlen(strrchr($urlg, '/')));
//	Installer Ordner zu System Ordner
$siteurl = substr($siteurl, 0, - strlen(strrchr($siteurl, '/installer')));

//Installer
if( !empty( $_GET['step'] ) && is_numeric( $_GET['step'] ) && $_GET['step'] < 10 ){
	$step = $_GET['step'];
}
else{
	$step = 1;
}

//JSON-Klasse
define("Notestool", "OKAY");
require_once( __DIR__ . '/../system/php/json.php' );
require_once( __DIR__ . '/../system/php/func.php' );
//Pfad
JSONReader::changepath( __DIR__ . '/../system/data/' );

//Schritte
if( $step == 1 ){
	$out->addBox( '<h2>Willkommen beim KIMB-Notes Installer</h2>' );

	$testout = '';
	//PHP - Version OK?
	if (version_compare(PHP_VERSION, '7.0.0' ) >= 0 ) {
		$testout .= '<div class="message okay">Sie verwenden PHP 7</div>';
	}
	else{
		$testout .= '<div class="message error">Dieses System wurde f&uuml;r PHP 7 entwickelt, bitte f&uuml;hren Sie ein PHP-Update durch!</div>';
	}

	//Schreibrechte
	//nötige schreibbare Verzeichnisse und Dateien
	$checkfolders = array(
		'data/',
		'data/userlist.json',
		'data/config.json',
		'data/user/',
		'data/user/userslist.json',
		'data/notes/',
		'data/notes/noteslist.json',
		'data/notes/sharecodes.json',
		'data/notes/shareslist.json',
	);
	//alle Verzeichnisse testen und Meldung
	$noerr = true;
	foreach( $checkfolders as $folder ){
		if( !is_writable( __DIR__.'/../system/'.$folder ) ){
			$testout .= '<div class="message error">"'.$folder.'" ist nicht schreibbar</div>';
			$noerr = false;
		}
	}
	if( $noerr ){
		$testout .= '<div class="message okay">Die benötigten Verzeichnisse sind schreibbar</div>';
	}

	$out->addBox( $testout );
	$out->addBox( '<a href="?step=2"><button>&rarr; Weiter</button></a>' );
}
else if( $step == 2 ){
	$out->addBox( '<h2>Systemkonfiguration</h2>' );


	$abfr = '<form action="?step=3" method="post">';
	$abfr .= '<p>URL des Notes-Systems: <input type="text" value="'.$siteurl.'/system" name="domain"></p>';
	$abfr .= '<p>Modus: <input type="radio" value="min" name="JSdevmin" checked="checked"> Benutzung <input type="radio" value="dev" name="JSdevmin"> Entwicklung/ Debugging </p>';
	$abfr .= '<p>URL zu Impressum/ Support: <input type="text" value="http://example.com/impressum-datenschutz" name="impressumURL"></p>';
	$abfr .= '<p>Beschriftung des Links zu Impressum/ Support: <input type="text" value="Impressum &amp; Datenschutz" name="impressumName"></p>';
	$abfr .= '<p>Hinweise zur Syntax der Notizen anzeigen: <input type="radio" value="true" name="showMarkdownInfo" checked="checked"> Anzeigen <input type="radio" value="false" name="showMarkdownInfo"> Ausblenden </p>';
	$abfr .= '<p>Prüfen nach Ändrungen alle <input type="number" value="60" name="sysPoll"> Sekunden.</p>';
	$abfr .= '<p>OfflineApp durch CacheManifest anbieten: <input type="radio" value="true" name="AppCache" checked="checked"> Aktvieren <input type="radio" value="false" name="AppCache"> Deaktivieren</p>';
	$abfr .= '<p><input type="hidden" value="yes" name="from2"></p>';
	$abfr .= '<p><input type="submit" value="&rarr; Weiter"></p></form>';

	$out->addBox( $abfr );

	//Konfiguration Gerüst erstellen:
	$_SESSION['confarray'] = array(
		"domain" => "",
		"JSdevmin" => "",
		"impressumURL" => "",
		"impressumName" => "",
		"showMarkdownInfo" => "",
		"sysPoll" => "",
		"AppCache" => ""
	);
}
else if( $step == 3 ){
	//Übergaben okay?
	if(
		empty( $_POST['from2'] )
		||
		(
			!empty( $_POST['domain'] )
			&&
			!empty( $_POST['JSdevmin'] )
			&&
			!empty( $_POST['impressumURL'] )
			&&
			!empty( $_POST['impressumName'] )
			&&
			( $_POST['showMarkdownInfo'] == 'true' || $_POST['showMarkdownInfo'] == 'false' )
			&&
			is_numeric( $_POST['sysPoll'] )
			&&
			( $_POST['AppCache'] == 'true' || $_POST['AppCache'] == 'false' )
		)
	){
		if( !empty( $_POST['from2'] ) ){
			//Werte von 2 verarbeiten
			$_SESSION['confarray'] = array(
				"domain" => $_POST['domain'],
				"JSdevmin" => ( $_POST['JSdemvin'] == "dev" ? "dev" : "min" ),
				"impressumURL" => $_POST["impressumURL"],
				"impressumName" => $_POST["impressumName"],
				"showMarkdownInfo" => ( $_POST['showMarkdownInfo'] == 'false' ? false : true ),
				"sysPoll" => intval( $_POST['sysPoll'] ),
				"AppCache" => ( $_POST['AppCache'] == 'false' ? false : true ),
			);
		
		}
		
		//neue Config öffnen und schreiben
		$conf = new JSONReader( 'config' );
		//	schreiben
		if( $conf->setArray( $_SESSION['confarray'] ) ){
			$out->addBox( '<div class="message okay">Konfigurationsdatei geschrieben!</div>' );
			$out->addBox( '<a href="?step=5"><button>&rarr; Weiter</button></a>' );
		}
		else{
			$out->addBox( '<div class="message error">Konnte Konfigurationsdatei nicht erstellen!</div>' );
			$out->addBox( 'Bitte erstellen Sie eine Datei <code>/system/data/config.json</code> mit folgendem Inhalt: <pre>'. json_encode( $_SESSION['confarray'], JSON_PRETTY_PRINT) .'</pre>' );
			$out->addBox( '<a href="?step=5"><button>&rarr; Weiter</button></a>' );
		}
	}
	else{
		$out->addBox( '<div class="message error">Konnte Systemkonfiguration nicht sichern!</div>' );
		$out->addBox( '<a href="?step=2"><button>&larr; Zurück</button></a>' );
	}
}
else if( $step == 5 ){
	//Admin-Account
	$out->addBox( '<h2>Administrator einrichten</h2>' );
	
	$abfr = '<form action="?step=6" method="post">';
	$abfr .= '<p>Username: <input type="text" value="admin" name="username"> (Kleinbuchstaben)</p>';
	$abfr .= '<p>Passwort: <input type="password" value="" name="pass1"></p>';
	$abfr .= '<p>Passwort (wdh.): <input type="password" value="" name="pass2"></p>';
	$abfr .= '<p><input type="submit" value="Weiter"></p></form>';
		
	$out->addBox( $abfr );
}
else if( $step == 6 ){
	//Username Konvention
	$name = preg_replace( '/[^a-z]/', '', $_POST['username'] );
	$password = $_POST['pass1'];

	if( 
		!empty( $name )
		&&
		!empty( $password )
		&&
		$password === $_POST['pass2']
	){
		$out->addBox( '<h2>KIMB-Notes wurde installiert!</h2>' );
		
		//Userdaten laden
		$userlist = new JSONReader( 'userlist' );

		//UserID Liste laden
		$list = new JSONReader( '/user/userslist' );
		
		//Neue ID erstellen
		do{
			$newid = makepassw(30, 1);
		}while( $list->searchValue( [] , $newid) !== false );
		
		//neue ID merken
		$list->setValue( [null], $newid );

		//Passwort Hash
		$salt = makepassw( 40 );
		$passhash = hash( 'sha256', hash( 'sha256', $password ) . '+' . $salt );

		//Neuen User erstellen
		$userarray = array(
			"username" => $name,
			"password" => $passhash,
			"salt" => $salt,
			"userid" => $newid,
			"admin" => true,
			"authcodes" => array()
		);
	
		//User erstellen
		$userlist->setValue( [null], $userarray );

		$out->addBox( '<a href="'. ( empty( $_SESSION['confarray']["config"]["domain"] ) ? $siteurl . '/system/' : $_SESSION['confarray']["config"]["domain"] ) .'"><button>Notes aufrufen</button></a>' );
	}
	else{
		$out->addBox( '<div class="message error">Bitte füllen Sie alle Felder und geben Sie zwei identsiche Passwörter ein!</div>' );
		$out->addBox( '<a href="?step=5"><button>&larr; Zurück</button></a>' );
	}
}

?>