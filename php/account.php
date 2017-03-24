<?php

defined("Notestool") or die('No clean Request');

//Salt erstellen
if( check_params( POST, array( 'userid' => 'strAZaz09' ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){
		//Salt machen und ausgeben
		add_output( makepassw( 40 ) );
	}
	else{
		add_error( 'Not allowed' );
	}
}
//Passwort neu setzen
elseif( check_params( POST, array( 'userid' => 'strAZaz09', 'newpass' => 'strAZaz09', 'salt' => 'strAZaz09' ) ) ){

	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){

		//Userdaten laden
		$userlist = new JSONReader( 'userlist' );

		//User suchen
		$id = $userlist->searchValue( [], $userid, 'userid' );
		//gefunden?
		if( $id !== false ){
			//neues Passwort schreiben
			$userlist->setValue( [$id, 'password'], $_POST['newpass'] );
			$userlist->setValue( [$id, 'salt'], $_POST['salt'] );

			//done
			add_output( true );
		}
		else{
			add_error( 'User not found' );
		}
	}
	else{
		add_error( 'Not allowed' );
	}
}
//Authcodes
elseif( check_params( POST, array( 'userid' => 'strAZaz09', 'art' => 'strAZaz09', 'id' => 'strAZaz09' ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){

		//Aufgabe okay?
		$art = $_POST['art'];
		if( in_array( $art, array( 'list', 'new', 'del' ) ) ){

			//Userdaten
			$userlist = new JSONReader( 'userlist' );

			//User suchen
			$id = $userlist->searchValue( [], $userid, 'userid' );
			//gefunden?
			if( $id !== false ){
		
				//Alles Codes des User lesen
				$codes = $userlist->getValue( [$id] );
				$codes = $codes['authcodes'];

				//Uebergebenen Code (ID) prüfen
				$codeID = preg_replace( '/[^a-z0-9]/', '', $_POST['id'] );

				//Nach Aufgabe unterscheiden
				if( $art == 'list' ){
					//Array fuer Ausgabe
					$out = array();
					//Array durchgehen
					foreach( $codes as $code => $time ){
						//Infos über diesen Code
						$out[] = array(
							'time' => date( 'd.m.Y H:i:s', $time ),
							'code' => substr( $code, 0, 10 ),
							'id' => hash( 'sha256', $code )
						);
					}
					//Ausgabe
					add_output( empty( $out ) ? false : $out );

				}
				//Neuen Code?
				elseif(  $art == 'new' ){
					do{
						//neuen Code erstellen
						$newCode = makepassw( 75, 2 );
						//und noch leer?
					} while( isset( $codes[$newCode] ) );

					//Code anfuegen
					$userlist->setValue( [$id, 'authcodes', $newCode], 0 );

					//Code ausgeben
					add_output( $newCode );
				}
				//Löschen
				elseif( $art == 'del' ) {
					//zu löschenden Code bestimmen
					//	alle durchgehen
					foreach( $codes as $code => $time ){
						//stimmen die Hashes?
						if( $codeID == hash( 'sha256', $code ) ){
							//gefunden
							$delcode = $code;
							break;
						}
					}

					//gefunden?
					if( !empty( $delcode ) ){
						//löschen
						$userlist->setValue( [$id, 'authcodes', $delcode], null );

						//Meldung
						add_output( true );
					}
					else{
						add_error( 'Code not found' );
					}
				}
			}
			else{
				add_error( 'User not found' );
			}

		}
		else{
			add_error( 'Unknown task!' );
		}

	}
	else{
		add_error( 'Not allowed' );
	}
}

?>