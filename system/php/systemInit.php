<?php

/*************************************************/
// KIMB-Notes
// Copyright (c) 2017 by KIMB-technologies
// https://github.com/KIMB-technologies/KIMB-Notes/
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

defined("Notestool") or die('No clean Request');

//*************************
//Klassen

//	JSONReader
require_once( __DIR__.'/json.php' );
//		Einstellungen zu JSONReader
JSONReader::changepath( __DIR__.'/../data' );

//	FineDiff
require_once( __DIR__ . '/finediff.php' );

// Klasse zur Speicherung von Systemeinstellungen
abstract class SystemInit{

	/*
		Konfigurationswerte Vorgabe
		===========================
	*/

	//Array der Einstellungen
	private static $config = array(
		//URL unter der das Tool liegt 
		'domain' => 'http://localhost:8000/system',
		//laden der minimierten oder der vollen JavaScript Dateien (min/ dev)
		'JSdevmin' => 'dev',
		//URL zu Impressum
		'impressumURL' => 'https://impressum.example.com',
		//Name für Impressum
		'impressumName' => 'Impressum &amp; Datenschutz',
		//Markdown Info Link anzeigen
		'showMarkdownInfo' => true,
		//Polling mittels JS des Servers für Änderungen (Zeit in sec.)
		'sysPoll' => 60,
		//AppCache aktivieren?
		'AppCache' => false
	);

	//Sytemversion
	//	[ Hauptversionsnummer, Unternummer, Patch, Zusatz (Alpha, Beta, Final) ] => [1, 23, 5, 'B'] -> 1.23.5 Beta
	const SYSTEMVERSION = [ 1, 0, 0, 'Beta' ];

	/*
		Auslesen der Konfiguration
		==========================
	*/
	//schon Konfiguration eingelesen?
	private static $readConfFile = false;

	//ConfFile einlesen
	private static function readConfig(){
		if( self::$readConfFile == false ){
			$json = new JSONReader( 'config' );

			//Konfigurationsarray leer?
			$cf = $json->getValue([], true);
			if( !empty($cf) ){
				self::$config = $cf;	
			}

			//fertig eingelesen
			self::$readConfFile = true;
		}
	}

	/*
		Methoden zur Abfrage
		===================
	*/

	//Getter fuer Einstellungen
	//	$key => Schluessel
	//	Return => Wert oder false
	public static function get( $key ){
		//KonfFile einlesen
		self::readConfig();

		//Wert vorhanden?
		if( isset(self::$config[$key]) ){
			return self::$config[$key];
		}
		else{
			return false;
		}
	}
}
?>