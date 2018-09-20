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

//System laden
//	Korrekt so!
define("Notestool", "OKAY");
//	Type Header
header( 'Content-type: application/json; charset=utf-8' );
//	Fehler aus
error_reporting( 0 );

//Systembibilothek laden
require_once( __DIR__ . '/php/systemInit.php' );

//REST API ohne Session
define("RESTMODE", true);
//Funktionen
require_once( __DIR__ . '/php/func.php' );
//GET preufen
check_params( array_keys( $_GET ), array( 0 => 'strAZaz09' ), 'GET Parameter error' );

//Kein "share" (ist per AJAX REST-Konform)
//und kein "login", da keine Session erstellt werden soll!
//	dafür aber "auth" (Passwort, Username zu UserID und Authcode,
//		sowie Status des Authcode)
//
// einfach einen POST-Parameter "authcode" anhängen
// dazu dann noch "userid" (wie bei AJAX)


//Aufgaben
$tasks = array(
	'auth', //Paramterptüfung erfolgt in DATEI!
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

	//Authentification Parameters
	$ok = false;
	if( $task !== 'auth' ){
		// UserID
		if( !empty( $_POST['userid'] ) && is_string( $_POST['userid'] ) ){
			$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );
			if( $_POST['userid'] === $userid ){
				//Authcode
				if( !empty( $_POST['authcode'] ) && is_string( $_POST['authcode'] ) ){
					$authcode = preg_replace( '/[^a-z0-9]/', '', $_POST['authcode'] );
					if( $_POST['authcode'] === $authcode ){

						//Userdaten laden
						$userlist = new JSONReader( 'userlist' );

						//User suchen
						$id = $userlist->searchValue( [], $userid, 'userid' );
						//gefunden?
						if( $id !== false ){
							//Authcodes des Users lesen
							$authcodes = $userlist->getValue( [$id, 'authcodes'] );
							//	Array ( "Code" => "time() [last used]" )

							//Leeres Array in JSON?
							//Leerer Authcode?
							//Authcode lang genug?
							if( $authcodes !== array() && !empty( $authcode ) && strlen( $authcode ) > 20 ){
								//Code vorhanden
								if( in_array( $authcode, array_keys( $authcodes ) ) ){
		
									/*
										ZUGRIFF OK
									*/
									$ok = true;
									log_user_in( $userid );
		
									//Last used ändern
									$userlist->setValue( [$id, 'authcodes', $authcode], time() );

									//jetzt akzeptiert und im authcode weiteren Programm egal
									//		userID wird noch weiter benötigt
									unset( $_POST["authcode"] );
								}	
							}
						}			
					}	
				}
			}
		}
	}
	else{
		//hier muss UserID nicht gegeben sein!
		$ok = true;
	}

	//Authentification ok?
	if( $ok ){
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
		add_error( 'Incorrect Authentification Parameters' );
	}
}
else{
	add_error( 'Unknow Task' );
}

output_sys();
?>
