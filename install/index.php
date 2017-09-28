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

//Schritte
if( $step == 1 ){
	$out->addBox( '<h2>Willkommen beim KIMB-Notes Installer</h2>' );

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
	$abfr .= '<p><input type="hidden" value="yes" name="from2"></p>';
	$abfr .= '<p><input type="submit" value="&rarr; Weiter"></p></form>';

	$out->addBox( $abfr );

	//Konfiguration Gerüst erstellen:
	$_SESSION['confarray'] = array(
		"config" => array(
			"domain" => "",
			"JSdevmin" => "",
			"impressumURL" => "",
			"impressumName" => "",
			"showMarkdownInfo" => ""
		),
		"externeLibs" => array(
			"",
			array(
			    "fonts" => "",
			    "jqueryuiCSS" => "",
			    "jqueryui" => "",
			    "jquery" => "",
			    "sjcl" => "",
			    "qrcode" => ""
			)
		)
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
		)
	){
		if( !empty( $_POST['from2'] ) ){
			//Werte von 2 verarbeiten
			$_SESSION['confarray']["config"] = array(
				"domain" => $_POST['domain'],
				"JSdevmin" => ( $_POST['JSdemvin'] == "dev" ? "dev" : "min" ),
				"impressumURL" => $_POST["impressumURL"],
				"impressumName" => $_POST["impressumName"],
				"showMarkdownInfo" => ( $_POST['showMarkdownInfo'] == 'false' ? false : true )
			);
		}

		//Libraries abfragen
		$out->addBox( '<h2>External Libraries</h2>' );

		$out->addBox(
			 'KIMB-Notes benötigt externe JS-Bibilotheken, die Quelle dieser muss hier angegeben werden.<br />'
			.'Siehe <a href="https://github.com/kimbtech/KIMB-Notes/blob/master/js-libs/README.md" target="_blank">ReadMe</a><br />'
			.'Es gibt zwei Möglichkeiten, entweder geben Sie zu jeder dieser Bibilotheken die genaue URL an oder Sie definieren ein Verzeichnis'
			.'in dem die Bibilotheken nach vorgegebener Struktur liegen (ein solches Verzeichnis finden sie unter <code>/js-libs/</code>).'
		);

		$abfr = '<form action="?step=4" method="post">';
		$abfr .= '<p><input type="radio" value="verzeichnis" name="modus" checked="checked"> Verzeichnis angeben <input type="radio" value="einzeln" name="modus"> Einzeln angeben</p>';
		
		/**
			TODO
			
			extLibs Eingabe
		**/

		$abfr .= '<p><input type="submit" value="&rarr; Weiter"></p></form>';
	
		$out->addBox( $abfr );

	}
	else{
		$out->addBox( '<div class="message error">Konnte Systemkonfiguration nicht sichern!</div>' );
		$out->addBox( '<a href="?step=2"><button>&larr; Zurück</button></a>' );
	}
}
else if( $step == 4 ){
	//Übergaben okay?
	if(
		!empty( $_POST['modus'] )
		&&
		!empty( $_POST['xxx'] )
	){
		//Werte von 3 verarbeiten
		$_SESSION['confarray']["externeLibs"] = array();

		/**
			TODO

			extlibs in JSON
			alles schreiben
		**/

	}
	else{
		$out->addBox( '<div class="message error">Konnte Systemkonfiguration nicht sichern!</div>' );
		$out->addBox( '<a href="?step=3"><button>&larr; Zurück</button></a>' );
	}
}
else if( $step == 5 ){
	//Admin-Account
	$out->addBox( '<h2>Adminiostrator einrichten</h2>' );
	
	$abfr = '<form action="?step=6" method="post">';
	$abfr .= '<p>Username: <input type="text" value="admin" name="username"></p>';
	$abfr .= '<p>Passwort: <input type="password" value="" name="pass1"></p>';
	$abfr .= '<p>Passwort (wdh.): <input type="password" value="" name="pass2"></p>';
	$abfr .= '<p><input type="submit" value="Weiter"></p></form>';
		
	$out->addBox( $abfr );
}
else if( $step == 6 ){
	$out->addBox( '<h2>KIMB-Notes wurde installiert!</h2>' );
	
	/**
		TODO
		User erstellen
	**/
	

	$out->addBox( '<a href="'.$_SESSION['confarray']["config"]["domain"].'"><button>Notes aufrufen</button></a>' );
}


$out->addBox( '<pre>'. print_r( $_SESSION['confarray'], true ) .'</pre>' );


?>