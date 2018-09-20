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
if( !RESTMODE ) die('Only for REST Mode');

//Userdaten laden
$userlist = new JSONReader( 'userlist' );

//Mittels Name und Authcode ID holen
if( check_params( POST, array( 'username' => 'strAZaz09', 'authcode' => 'strAZaz09' ) ) ){
	//Reinigen
	$authcode = preg_replace( '/[^a-z0-9]/', '', $_POST['authcode'] );
	$username = preg_replace( '/[^a-z]/', '', $_POST['username'] );

	//User suchen
	$id = $userlist->searchValue( [], $username, 'username' );
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
				//Daten ausgeben
				add_output( array(
					"id" => $userlist->getValue( [$id, 'userid'] ),
					"admin" => $userlist->getValue( [$id, 'admin'] )
				) );
				//Last used ändern
				$userlist->setValue( [$id, 'authcodes', $authcode], time() );
			}
			else{
				add_error( 'No valid Authcode!' );
			}
		}
		else{
			add_error( 'No valid Authcode!' );
		}
	}
}
//Mittels Username und Passwort einen Authcode anfordern
elseif( check_params( POST, array( 'username' => 'strAZaz09', 'password' => 'strAZaz09', '*authcode' => 'empty' ) ) ){

	//Reinigen
	//	=> ist hier schon ein Hash
	$password = preg_replace( '/[^a-z0-9]/', '', $_POST['password'] );
	//	=> Konvention nur kleine Buchstaben!
	$username = preg_replace( '/[^a-z]/', '', $_POST['username'] );

	//User suchen
	$id = $userlist->searchValue( [], $username, 'username' );
	//gefunden?
	if( $id !== false ){
		//alles über User lesen
		$userdata = $userlist->getValue( [$id] );
		
		//Eingebenes Passwort wie in JSON hashen
		// sha256( sha256( "passwort" ) "+" salt );
		//	sha256( "passwort" ) schon per JS
		$saltedpw = hash( 'sha256', $password . '+' . $userdata['salt'] );
		
		//Passwort korrekt?
		if( $saltedpw == $userdata['password'] ){
			//Authcode erstellen

			//Alles Codes des User lesen
			$codes = $userlist->getValue( [$id,'authcodes'] );

			do{
				//neuen Code erstellen
				$newCode = makepassw( 75, 2 );
				//und noch leer?
			} while( isset( $codes[$newCode] ) );

			//Code anfuegen
			$userlist->setValue( [$id, 'authcodes', $newCode], 0 );

			//Code ausgeben
			add_output( array(
				"name" => $userdata['username'],
				"id" => $userdata['userid'],
				"admin" => $userdata['admin'],
				"authcode" => $newCode
			) );
		}
		else{
			add_error( 'Password incorrect' );
		}
	}
	else{
		add_error( 'User not found' );
	}
}
else{
	add_error( 'Incorrect Request' );
}
?>