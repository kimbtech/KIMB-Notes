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
	'account',
	'share'
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
