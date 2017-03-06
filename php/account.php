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
//	list
//	add
//	del

?>