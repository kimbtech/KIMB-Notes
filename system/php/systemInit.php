<?php
defined("Notestool") or die('No clean Request');

//Klassen
require_once( __DIR__.'/json.php' );
//	Einstellungen zu json.php
JSONReader::changepath( __DIR__.'/../data' );

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
		'impressumURL' => 'https://about.5d7.eu',
		//Name für Impressum
		'impressumName' => 'About, Datenschutz, Kontakt'
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