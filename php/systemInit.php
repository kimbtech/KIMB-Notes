<?php
// Klasse zur Speicherung von Systemeinstellungen
abstract class SystemInit{

	//Array der Einstellungen
	private static $config = array(
		'domain' => 'http://kimb-technologies.eu:8000',
		'JSdevmin' => 'dev'
	);

	//Getter fuer Einstellungen
	//	$key => Schluessel
	//	Return => Wert oder false
	public static function get( $key ){
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