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
		'showMarkdownInfo' => true
	);

	//Array Externe Libs
	//	Relative Angabe für globalen Ordner
	private static $externeLibs = array(
		'fonts' => '/fonts.css',
		'jqueryuiCSS' => '/jquery-ui.min.css',
		'jqueryui' => '/jquery-ui.min.js',
		'jquery' => '/jquery.min.js',
		'sjcl' => '/sjcl.min.js',
		'qrcode' => '/qrcode.min.js',
	);

	//Ordner mit allen Libs
	//	false oder URL
	private static $globalfolder = 'http://localhost:8000/js-libs';

	//Sytemversion
	//	[ Hauptversionsnummer, Unternummer, Patch ] => [1, 23, 5] -> 1.23.5
	const SYSTEMVERSION = [ 0, 0, 0 ];

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

			//Konfigurationsarray
			try{
				self::$config = $json->getValue(['config'], true);
			}catch( Exception $e ){
				//nicht vorhanden, dann Standardwerte von oben
			}

			//Externe Bibilotheken Array
			try{
				//Ordner der Libs einlesen
				$folder = $json->getValue(['externeLibs',0], true);
			}catch( Exception $e ){
				//keiner gegeben
				$folder = self::$globalfolder;
			}

			//Folder == false => Array enthält vollständiges URLs
			if( $folder === false ){
				try{
					//Array so übernehmen
					self::$externeLibs = $json->getValue(['externeLibs',1], true);
				}catch( Exception $e ){
					//Installation fehlerhaft
					die( 'This Version of KIMB-Notes is not installed properly!' );
				}
			}
			else{
				foreach( self::$externeLibs as $key => $val ){
					$new_array[$key] = $folder . $val;
				}
				self::$externeLibs = $new_array;
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

	//Getter fuer Externe Bibilotheken
	//	$key => Schlüssel
	//	Return => Wert oder false
	public static function getExtLib( $key ){
		//KonfFile einlesen
		self::readConfig();

		//Wert vorhanden?
		if( !empty( self::$externeLibs[$key] ) ){
			return self::$externeLibs[$key];
		}
		else{
			return false;
		}
	}
}
?>