<?php

defined("Notestool") or die('No clean Request');

//Userdaten laden
$userlist = new JSONReader( 'userlist' );

//Login per Pass und Name?
if( check_params( POST, array( 'username' => 'strAZaz09', 'password' => 'strAZaz09' ) ) ){

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
			
			//Ausgabe
			add_output( array(
					"name" => $userdata['username'],
					"id" => $userdata['userid']
			));

			//do Login via Session
			log_user_in( $userdata['userid'] );
		}
		else{
			add_error( 'Password incorrect' );
		}
	}
	else{
		add_error( 'User not found' );
	}
}
//Authcode
elseif( check_params( POST, array( 'username' => 'strAZaz09', 'authcode' => 'strAZaz09' ) ) ){
	//Authocode pruefen und evtl. Login machen

	//Reinigen
	//	=> ist hier schon ein Hash
	$authcode = preg_replace( '/[^a-z0-9]/', '', $_POST['authcode'] );
	//	=> Konvention nur kleine Buchstaben!
	$username = preg_replace( '/[^a-z]/', '', $_POST['username'] );

	//User suchen
	$id = $userlist->searchValue( [], $username, 'username' );
	//gefunden?
	if( $id !== false ){
		//Authcodes des Users lesen
		$authcodes = $userlist->getValue( [$id, 'authcodes'] );
		//	Array ( "Code" => "time() [last used]" )

		//Leeres Array in JSOn?
		//Leerer Authcode?
		//Authcode lang genug?
		if( $authcodes !== array() && !empty( $authcode ) && strlen( $authcode ) > 20 ){
			//Code vorhanden
			if( in_array( $authcode, array_keys( $authcodes ) ) ){
				//do Login via Session
				log_user_in( $userlist->getValue( [$id, 'userid'] ) );
				//UserID ausgeben!
				add_output(
					array(
						'id' => $userlist->getValue( [$id, 'userid'] )
					)
				);
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
	else{
		add_error( 'User not found' );
	}
}
//Statusabfrage?
elseif( check_params( POST, array( 'status' => 'strAZaz09' ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['status'] );

	add_output( check_logged_in( $userid ) );
}
//Logout
elseif( check_params( POST, array( 'logout' => 'empty' ) ) ){
	log_user_out();
}
//Fehler
else{
	add_error( 'Give Authcode or Logindata else ask for Status or logout' );
}



?>
