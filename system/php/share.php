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
if( check_params( POST, array( 'authcode' => 'strAZaz09', '*cont' => 'strALL' ) ) ){
	
	//Authcode
	$authcode = $_POST['authcode'];

	//Liste aller genutzten Freigabecodes
	$allcodes = new JSONReader( 'notes/sharecodes' );
	
	//Code existent?
	if( $allcodes->searchValue( [], $authcode ) !== false ){

		//Aktuelle Freigaben Liste
		$list = new JSONReader( 'notes/shareslist' );

		//Key suchen
		$key = $list->searchValue( [], $authcode, "authcode" );

		//Key gefunden? => Code noch aktuell
		if( $key !== false ){
			//Infos holen
			$shareinfo = $list->getValue( [ $key ] );

			//ID Liste
			$noteslist = new JSONReader( 'notes/noteslist' );	

			//Pruefen
			if( $shareinfo === false || empty( $shareinfo ) || $noteslist->searchValue( [] , $shareinfo['noteid'] ) === false ){
				add_error( 'Share seems corrupted!' );
			}
			else{
				if( empty( $_SESSION['sharesOpend'] ) || !in_array( $shareinfo['noteid'], $_SESSION['sharesOpend'] ) ){
					$_SESSION['sharesOpend'][] = $shareinfo['noteid'];
					//Aufruf loggen
					$list->setValue( [ $key, 'lastAccessed', null ], time() );
				}

				//Note Öffnen
				$note = new JSONReader( 'notes/note_' . $shareinfo['noteid'] );
			
				//Array holen
				$notearr = $note->getArray();

				//leer?
				if( $notearr !== array() ){
					//NoteID okay?
					if(
						$note->isValue( ['noteid'], $shareinfo['noteid'] )
					){
						if( empty( $_POST['cont'] ) ){
							//Ausgabe
							add_output(
								array(
									'name' => $note->getValue(['name']),
									'id' => $note->getValue(['noteid']),
									'content' => $note->getValue(['content']),
									'edit' => $shareinfo['edit']
								)
							);
						}
						else if( $shareinfo['edit'] ){
							//Änderung?
							if( $note->getValue( ['content'] ) != $_POST['cont'] ){
								//History anlegen (Kopie des Alten)
								//	Ähnlichkeit bestimmen
								similar_text( $_POST['cont'], $note->getValue( ['content'] ), $sim_p );
								if(
									//alle 10 min eine Kopie ablegen
									time() - 600 > $note->getValue( ['geandert'] )
									||
									//weniger als 80% Ähnlichkeit?
									$sim_p < 80
								){
									//Note History öffnen
									$note_hist = new JSONReader( 'notes/note_' . $shareinfo['noteid'] . '.history' );
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
								$note->setValue( ['content'], $_POST['cont'] );
								$note->setValue( ['geandert'], time() );

								add_output( array( true, 'Aenderung', $hist ) );
							}
							else{
								add_output( array( true, 'Keine Aenderung' ) );
							}		
						}
						else{
							add_error( 'Not allowed to edit note.' );
						}
					}
					else{
						add_error( 'Not your note!' );
					}
				}
				else{
					add_error( 'Empty Note.' );
				}
			}
		}
		else{
			add_error( 'Share not found.' );
		}
	}
	else{
		add_error( 'Code not found.' );
	}
}
else{
	add_error( 'Incorrect Request' );
}

?>
