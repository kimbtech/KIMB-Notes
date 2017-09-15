<?php

defined("Notestool") or die('No clean Request');

/**
	PARAMETER CHECKER
**/
//Die Inhalte einer Uebergabe pruefen
//	$type => 'GET', 'POST', zu prüfendes Array
//	$schema => Array der Übergestruktur
//		Array( 'Feldname' => Inhalt (weiteres Array, 'strAZaz09', 'strALL' 'int', 'empty' (leer), 'noarr'[alles nur kein weiteres Array] )
//	$diemsg => Bei Fehler eine Meldung geben und die; (null, um nur false zurückzugeben)
//	Return => true (okay) // false bzw. 'die( $diemsg );' (Fehler)
//	Diese Funktion lässt nur die Typen
//	als Inhlate von Übergabeparametern zu!
define('GET', 345635745);
define('POST', 367567868);
function check_params( $type, $schema, $diemsg = null ){

	//zu überprüfenden Datensatz holen
	if( $type == GET ){
		$data = $_GET;
	}
	elseif( $type == POST ){
		$data = $_POST;
	}
	elseif( is_array( $type ) ){
		$data = $type;
	}
	else{
		$return = false;
	}

	//Prüfung
	//	leer übergeben und gewünscht?
	if( empty( $data ) && empty( $schema ) ){
		//okay
		$return = true;
	}
	//	Daten übergeben und gewünscht
	elseif( is_array( $data ) && is_array( $schema ) ){

		//Anzahlen übereinbstimmend?
		if( count( $data ) === count( $schema ) ){

			$data_checked = array();

			//alle einzenln  prüfen
			foreach( $schema as $f_name => $f_type ){

				if( isset( $data[$f_name] ) ){
		
					//Array?
					//	also Unterarray prüfen!
					if( is_array( $f_type ) ){
						//machen
						if( check_params( $data[$f_name], $f_type, $errormsg ) ){
							//okay -> Daten merken
							$data_checked[$f_name] = $data[$f_name];
						}
						else{
							//Fehler -> beenden
							$return = false;
							break;
						
						}
					}
					//alle anderen hier erlaubten
					elseif(
						empty( $data[$f_name] )
						||
						is_string( $data[$f_name] )
						||
						is_numeric( $data[$f_name] )
						||
						is_bool( $data[$f_name] )
					){
						if( $f_type === 'strAZaz09' ){
							//erstmal einfach ein String?
							if( !empty( $data[$f_name] ) && is_string( $data[$f_name] ) ){
								//Zeichen okay?			
								if( $data[$f_name] === preg_replace( '/([^A-Za-z0-9])/', '', $data[$f_name] ) ){
									//okay -> Daten merken
									$data_checked[$f_name] = $data[$f_name];
								}
								else{
									//Fehler -> beenden
									$return = false;
									break;
								}
							}
							else{
								//Fehler -> beenden
								$return = false;
								break;
							}

						}
						elseif( $f_type === 'strALL' ){
							//einfach String?
							if( !empty( $data[$f_name] ) && is_string( $data[$f_name] ) ){
								//okay -> Daten merken
								$data_checked[$f_name] = $data[$f_name];
							}
							else{
								//Fehler -> beenden
								$return = false;
								break;
							}
					
						}
						elseif( $f_type === 'empty' ){
							//leer?
							if( empty( $data[$f_name] ) ){
								//okay -> Daten merken
								$data_checked[$f_name] = $data[$f_name];
							}
							else{
								//Fehler -> beenden
								$return = false;
								break;
							}

						}
						elseif( $f_type === 'int' ){
							//Zahl?
							if( !empty( $data[$f_name] ) && is_numeric( $data[$f_name] ) ){
								//okay -> Daten merken
								$data_checked[$f_name] = $data[$f_name];
							}
							else{
								//Fehler -> beenden
								$return = false;
								break;
							}

						}
						//einfach nur kein Array
						//	muss es hier schon sein!
						elseif( $f_type === 'noarr' ){
								$data_checked[$f_name] = $data[$f_name];
						}
						//Fehler
						else{
							throw new Exception( 'Unknown Type' );
						}
					}
					//nicht erlaubter Typ
					else{
						//Fehler -> beenden
						$return = false;
						break;
					}
				}
				//nicht definierter Wert (-> Fehler)
				else{
					//Fehler -> beenden
					$return = false;
					break;
				}				
			}

			//noch keinen Fehler gefunden
			//alles erfolgreich geprüft
			if( $return !== false && $data_checked === $data ){
				$return = true;
			}
			else{
				$return = false;
			}
		}
		//da stimmt was nicht
		else{
			$return = false;
		}
	}
	//da stimmt was nicht
	else{
		$return = false;
	}

	//Rückgabe
	//	okay?
	if( $return ){
		return true;
	}
	//	Fehler?
	else{
		//direkt mit Medlung die?
		if( is_null( $diemsg ) ){
			//nein
			return false;
		}
		//ja
		else{
			die( $diemsg );
		}
	}
}


/**
	LOGIN
**/

//User per Session einloggen
//	USERID wird benutzt!
function log_user_in( $id ){
	$_SESSION['loggedin'] = true;
	$_SESSION['loggedintime'] = time();
	$_SESSION['userid'] = $id;
	$_SESSION['browserid'] = sha1( $_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR'] );
}

//User Login pruefen 
//	Session wird um ein
//	$id => fuer einen bestimmten User pruefen (Userid)
//		= 'null' fuer alle User
//	Return => true/ false
function check_logged_in( $id = null ){
	//allgemein preufen
	if(
			$_SESSION['loggedin'] 
		&&
			$_SESSION['loggedintime'] + 600 > time()
		&&
			$_SESSION['browserid'] == sha1( $_SERVER['HTTP_USER_AGENT'] . $_SERVER['REMOTE_ADDR'] )
	){
		//Zeit neu setzen
		$_SESSION['loggedintime'] = time();
		//Rueckgabe
		return ( is_null( $id ) ? true : ( $_SESSION['userid'] == $id ) ); 
	}
	else{
		return false;
	}
}

//User ausloggen (einfach Session destroy)
function log_user_out(){
	//Session leeren
	session_unset();
	//Session zerstören
	session_destroy();
	//Session neu aufesetzen
	//	jetzt ist alles, was mit dem User zu tun hatte weg
	session_start();
}


/**
	AUSGABE
**/

//Ausgabearray
$system_output_array = array(
	'error' => array(),
	'status' => 'okay',
	'data' => array()
);

function add_output( $data, $replace = true ){
	global $system_output_array;
	if( $replace ){
		$system_output_array['data'] = $data;
	}
	else{
		$system_output_array['data'][] = $data;
	}
}

function add_error( $data ){
	global $system_output_array;

	$system_output_array['error'][] = $data;
	$system_output_array['status'] = 'error';
}

function output_sys(){
	global $system_output_array;
	
	//Ausgabe
	//	"error" => Fehler
	//	"data" => Daten
	echo json_encode( $system_output_array, JSON_PRETTY_PRINT );
}

/**
	ADMIN
*/
function makepassw( $laenge, $typ = 0 ){
	if( $typ === 0 ){
		$chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	}
	elseif( $typ === 1 ){
		$chars = 'abcdefghijklmnopqrstuvwxyz';
	}
	elseif( $typ == 2 ){
		$chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	}
	else{
		$chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_/&%$:.;,|<>"!*+-()={[]}#';
	}
	$anzahl = strlen($chars);
	$i = 0;
	$output = '';
	while($i < $laenge){
		$stelle = random_int(0, $anzahl-1);
		$output .= $chars{$stelle};
		$i++;
	}
	return $output;
}

//Adminrechte preufen
function checkAdminLogin( $userid, $userlist ){
	//Loginstatus
	if( check_logged_in( $userid ) ){
		//Admin?

		//User suchen
		$id = $userlist->searchValue( [], $userid, 'userid' );
		//gefunden?
		if( $id !== false ){
			//Admin lesen und auf wahr pruefen
			if( $userlist->isValue( [$id, 'admin'], true ) ){
				return true;
			}
		}
	}
	
	return false;
}


?>
