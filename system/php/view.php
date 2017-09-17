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
if( check_params( POST, array( 'userid' => 'strAZaz09', 'noteid' => 'strAZaz09' ) ) ){
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
					//Ausgabe
					add_output(
						array(
							'name' => $note->getValue(['name']),
							'id' => $note->getValue(['noteid']),
							'content' => $note->getValue(['content']),
							'empty' => false
						)
					);
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
					'erstellt' => time(),
					'freigaben' => array()
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
else{
	add_error( 'Incorrect Request' );
}

?>
