<?php
//System laden
//	Korrekt so!
define("Notestool", "OKAY");
//	Type Header
header( 'Content-type: application/json; charset=utf-8' );
//	Session
session_name( "Notestool" );
session_start();
//	Fehler aus
error_reporting( 0 );

//Klassen
require_once( __DIR__.'/php/json.php' );
//	Einstellungen zu json.php
JSONReader::changepath( __DIR__.'/data' );

//Systembibilothek laden
require_once( __DIR__ . '/php/systemInit.php' );

//Funktionen
require_once( __DIR__ . '/php/func.php' );
//GET preufen
check_params( array_keys( $_GET ), array( 0 => 'strAZaz09' ), 'GET Parameter error' );

//Aufgaben
$tasks = array(
	'login',
	'list',
	'view',
	'admin',
	'account'
);
//	Task aus URL holen
$task = array_keys( $_GET );
$task = $task[0];
//	Task okay?
if( in_array( $task, $tasks ) ){
	//passende Datei gefunden
	if( is_file( __DIR__ . '/php/' . $task . '.php' ) ){

		//Exception Handler
		try{
			require_once( __DIR__ . '/php/' . $task . '.php' );
		}
		catch( Exception $e ){
			//add_error( $e->getMessage() );
			add_error( 'Can not do job.' );
		}
	}
	else{
		add_error( 'Unable to load Task' );
	}
}
else{
	add_error( 'Unknow Task' );
}

output_sys();
?>
