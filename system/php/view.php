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

defined("Notestool") or die('No clean Request');

//Datei lesen?
if( check_params( POST, array( 'userid' => 'strAZaz09', 'noteid' => 'strAZaz09', 'history' => 'int' ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){

		//Noteid
		//	=> Konvention nur kleine Buchstaben und Zahlen!
		$noteid = preg_replace( '/[^a-z0-9]/', '', $_POST['noteid'] );

		//ID Liste
		$list = new JSONReader( 'notes/noteslist' );

		//ID okay?
		if( $list->searchValue( [] , $noteid ) !== false ){ 

			//Note Öffnen
			$note = new JSONReader( 'notes/note_' . $noteid );
			
			//Array holen
			$notearr = $note->getArray();

			//leer?
			if( $notearr !== array() ){
				//UserID und NoteID okay?
				if(
					$note->isValue( ['noteid'], $noteid )
					&&
					$note->isValue( ['userid'], $userid )
				){
					//Notiz normal öffnen, keinen Verlauf
					//	0 und 1 überspringen, da diese true, false repräsentieren
					if( $_POST['history'] == 2 ){

						//Ausgabe
						add_output(
							array(
								'name' => $note->getValue(['name']),
								'id' => $note->getValue(['noteid']),
								'content' => $note->getValue(['content']),
								'geandert' => $note->getValue(['geandert']),
								'empty' => false
							)
						);
					}
					//Diffs des Verlauf erzeugen
					else if( $_POST['history'] == 3 ){
						//Verlauf öffnen
						$noteHistory = new JSONReader( 'notes/note_' . $noteid . '.history' );
						$allHistory = $noteHistory->getArray();

						//aktuelle Notiz
						$now = $note->getValue(['content']);

						//Diffs in Array
						$difflist = array();
						//erstellen
						foreach( $allHistory as $key => $hist ){
								
							$difflist[] = array(
								 'diff' => KIMBNotesGenerateDiff( $now, $hist[0] ),
								 'time' => $hist[1],
								 'text' => $hist[0]
							);

							//$now = $hist[0];
						}

						//Ausgeben, anders herum, da chronologisch dazu geschrieben wurde
						add_output( array_reverse( $difflist ) );
					}
					//Zeitpunkt der letzten Änderung feststellen
					else if( $_POST['history'] == 4 ){
						//Zeitpunkt letzte Änderung
						add_output( $note->getValue(['geandert']) );
					}
					else{
						add_error( 'Unknown History Parameter' );
					}
				}
				else{
					add_error( 'Not your note!' );
				}
			}
			else{
				//leer Meldung (JS soll Vorgabe nutzen)
				add_output( array( 'empty' => true ) );
				//jetzt Grunggerüst erstellen
				$notearr = array(
					'noteid' => $noteid,
					'userid' => $userid,
					'name' => "",
					'content' => "",
					'geandert' => time(),
					'erstellt' => time()
				);
				//und speichern
				$note->setArray( $notearr );
			}
		}
		else{
			add_error( 'Unknown Note' );
		}
	}
	else{
		add_error( 'Not allowed' );
	}
}
//Änderungen schreiben
elseif( check_params( POST, array( 'userid' => 'strAZaz09', 'noteid' => 'strAZaz09', 'note' => array( 'name' => 'strALL', 'cont' => 'strALL' ) ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){

		//Noteid
		//	=> Konvention nur kleine Buchstaben und Zahlen!
		$noteid = preg_replace( '/[^a-z0-9]/', '', $_POST['noteid'] );

		//ID Liste
		$list = new JSONReader( 'notes/noteslist' );

		//ID okay?
		if( $list->searchValue( [] , $noteid ) !== false ){ 
		
			//Note Öffnen
			$note = new JSONReader( 'notes/note_' . $noteid );

			//Array holen
			$notearr = $note->getArray();

			//leer?
			if( $notearr !== array() ){
				//UserID und NoteID okay?
				if(
					$note->isValue( ['noteid'], $noteid )
					&&
					$note->isValue( ['userid'], $userid )
				){

					//Änderung?
					if( $note->getValue( ['content'] ) != $_POST['note']['cont'] ){
						//History anlegen (Kopie des Alten)
						//	Ähnlichkeit bestimmen
						similar_text( $_POST['note']['cont'], $note->getValue( ['content'] ), $sim_p );
						if(
							//alle 10 min eine Kopie ablegen
							time() - 600 > $note->getValue( ['geandert'] )
							||
							//weniger als 80% Ähnlichkeit?
							$sim_p < 80
						){
							//Note History öffnen
							$note_hist = new JSONReader( 'notes/note_' . $noteid . '.history' );
							//eine Zeile anfügen
							$note_hist->setValue( [null], array(
								( !is_array( $note->getValue(['content']) ) ? $note->getValue(['content']) : '<empty>' ),
								date( 'H:i:s d.m.Y', $note->getValue( ['geandert'] ) ) 
							));
							//Meldung, dass History geschrieben
							$hist = 'History geschrieben! (Aehnlichkeit: '.$sim_p.'% | Zeitdifferenz: '.( time() - $note->getValue( ['geandert'] ) ).'sec)';
						}
						else{
							//Meldung, dass keine History geschrieben
							$hist = 'Keine History geschrieben! (Aehnlichkeit: '.$sim_p.'% | Zeitdifferenz: '.( time() - $note->getValue( ['geandert'] ) ).'sec)';
						}

						//neue Werte sichern
						$note->setValue( ['name'], $_POST['note']['name'] );
						$note->setValue( ['content'], $_POST['note']['cont'] );
						$note->setValue( ['geandert'], time() );

						add_output( array( true, 'Aenderung', $hist ) );
					}
					else{
						add_output( array( true, 'Keine Aenderung' ) );
					}		

				}
				else{
					add_error( 'Not your note!' );
				}
			}
			else{
				add_error( 'Empty Note, please open before writing!' );
			}

		}
		else{
			add_error( 'Unknown Note' );
		}
	}
	else{
		add_error( 'Not allowed' );
	}
}
//Datei lesen?
else if( check_params( POST, array( 'userid' => 'strAZaz09', 'noteid' => 'strAZaz09', '*share' => array( 'authcode' => 'strAZaz09', 'edit' => 'strAZaz09', 'name' => 'strALL' ) ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );
	
	//Loginstatus
	if( check_logged_in( $userid ) ){
	
		//Noteid
		//	=> Konvention nur kleine Buchstaben und Zahlen!
		$noteid = preg_replace( '/[^a-z0-9]/', '', $_POST['noteid'] );
	
		//ID Liste
		$list = new JSONReader( 'notes/noteslist' );
	
		//ID okay?
		if( $list->searchValue( [] , $noteid ) !== false ){ 
	
			//Note Öffnen
			$note = new JSONReader( 'notes/note_' . $noteid );
				
			//Array holen
			$notearr = $note->getArray();

			//leer?
			if( $notearr !== array() ){
				//UserID und NoteID okay?
				if(
					$note->isValue( ['noteid'], $noteid )
					&&
					$note->isValue( ['userid'], $userid )
				){
					//Aktuelle Freigaben Liste
					$shareslist = new JSONReader( 'notes/shareslist' );

					// Neue Freigabe erstellen oder löschen?
					if( isset( $_POST['share'] ) ){

						//Liste aller genutzten Freigabecodes
						$authcodeslist = new JSONReader( 'notes/sharecodes' );

						//neu oder löschen?
						if( $_POST['share']['authcode'] != 'leer' ){
							// Löschen, da Authcode gegeben

							$authcode = $_POST['share']['authcode'];

							//Authcode vorhanden?
							if( $authcodeslist->searchValue( [], $authcode ) !== false ){
								//Key suchen
								$key = $shareslist->searchValue( [], $authcode, "authcode" );
		
								//Key gefunden?
								if( $key !== false ){
									//löschen
									$shareslist->setValue( [$key], null );

									add_output( 'done' );
								}
								else{
									add_error( 'Authcode already outdated.' );
								}
							}
							else{
								add_error( 'Unknown authcode!' );
							}
						}
						else{
							//neu erstellen, da kein Authcode, aber Name und Bearbeiten bool.
							if( $_POST['share']['edit'] == 'true' || $_POST['share']['edit'] == 'false' ){

								do{
									//Code erstellen
									$authcode = makepassw( 75 );
								//solange, bis freien Code gefunden
								}
								while( $authcodeslist->searchValue( [], $authcode ) !== false );

								//Freigabe erstellen
								$shareslist->setValue( [null], 
									array(
										"authcode" => $authcode,
										"noteid" => $noteid,
										"edit" => ( $_POST['share']['edit'] == 'true' ? true : false ),
										"lastAccessed" => array(),
										"created" => time(),
										"name" => $_POST['share']['name']
									)
								);

								//Authcode loggen
								$authcodeslist->setValue( [null], $authcode );

								add_output( 'added' );
							}
							else{
								add_error( 'Incorrect Request.' );
							}
						}
					}
					else{
						//Liste aller Freigaben der Notiz erstellen.
						$outputlist = array();

						//durchgehen
						foreach( $shareslist->getArray() as $value ){
							//Freigabe dieser Notiz?
							if( $value['noteid'] == $noteid ){
								//Inhalt optimieren
								unset( $value['noteid'] );
								$value['created'] = date( 'H:i:s d.m.Y', $value['created'] );
								$value['accesses'] = count( $value['lastAccessed'] );
								$value['lastAccessed'] = date( 'H:i:s d.m.Y', array_pop( $value['lastAccessed'] ) );

								$outputlist[] = $value;
							}
						}

						add_output( $outputlist );
					}
				}
				else{
					add_error( 'Not your note.' );
				}
			}
			else{
				add_error( 'Note is Empty!' );
			}
		}
		else{
			add_error( 'Unknown NoteID.' );
		}
	}
	else{
		add_error( 'Not loggend in!' );
	}
}
else{
	add_error( 'Incorrect Request' );
}

?>
