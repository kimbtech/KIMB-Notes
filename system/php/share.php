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
if( check_params( POST, array( 'authcode' => 'strAZaz09' ) ) ){
	
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
				//Aufruf loggen
				$list->setValue( [ $key, 'lastAccessed', null ], time() );

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
