<?php

defined("Notestool") or die('No clean Request');

//Liste holen
if( check_params( POST, array( 'userid' => 'strAZaz09' ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){
		//Notes lesen
		$notesfile = new JSONReader( 'user/user_'. $userid );

		//Notes holen
		$notesarray = $notesfile->getArray();

		//sortieren
		array_multisort( $notesarray, SORT_DESC, SORT_NUMERIC,
			array_column( $notesarray, 'position'), SORT_DESC, SORT_NUMERIC );

		//ausgeben
		add_output( $notesarray );
	}
	else{
		add_error( 'Not allowed' );
	}
}
//Bearbeiten
elseif( check_params( POST, array( 'userid' => 'strAZaz09', 'art' => 'strAZaz09', 'noteid' => 'strAZaz09' ) ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){

		//Task holen
		$art = $_POST['art'];

		//Noteid
		//	=> Konvention nur kleine Buchstaben und Zahlen!
		$noteid = preg_replace( '/[^a-z0-9]/', '', $_POST['noteid'] );

		//Task prüfen
		if( in_array( $art, array( 'del', 'up', 'down' ) ) ){
			//Notes lesen
			$notesfile = new JSONReader( 'user/user_'. $userid );

			//Aufgabe
			if( $art == 'up' || $art == 'down' ){
				//Notes holen
				$notesarray = $notesfile->getArray();

				//sortieren
				array_multisort( $notesarray, SORT_DESC, SORT_NUMERIC,
					array_column( $notesarray, 'position'), SORT_DESC, SORT_NUMERIC );

				//Array, welches später das verschobene Array haben soll
				$newnotes = array();
				//Key des Array, welche übersprungen werden müssen
				$nottodo = false;

				//noch keine Fehler
				$err = false;

				//Array durchgehen
				foreach( $notesarray as $key => $note ){
					//einer der Keys, welcher zu überspringen ist
					if( $key !== $nottodo ){
						//nach unten?
						//und gerade die zu verschiebende Notiz?
						if( $art == 'down' && $note['noteid'] == $noteid ){
							//überhaupt möglich?
							if( isset( $notesarray[$key + 1] ) ){
								//also die Position von einem drunter hier hin
								$notesarray[$key]['position'] = $notesarray[$key + 1]['position'];
								//und die aktuelle Position einen weiter unten hin
								$notesarray[$key + 1]['position'] = $note['position'];

								//den nächsten Key einfach überspringen!!
								$nottodo = $key + 1;
							}
							else{
								add_error( 'Kann nicht verschieben!' );
								$err = true;
							}
						}
						//nach oben?
						//und gerade einen über der zu verschiebenden Notiz?
						elseif( $art == 'up' && $notesarray[$key + 1]['noteid'] == $noteid ){
							//überhaupt möglich?
							if( isset( $notesarray[$key + 1] ) ){
								//
								$notesarray[$key]['position'] = $notesarray[$key + 1]['position'];
								//
								$notesarray[$key + 1]['position'] = $note['position'];

								//den nächsten Key einfach überspringen!!
								$nottodo = $key + 1;
							}
							else{
								add_error( 'Kann nicht verschieben!' );
								$err = true;
							}
						}
					}
				}

				//nur wenn keine Fehler
				if( !$err && $nottodo !== false ){
					//speichern
					$notesfile->setArray( $notesarray );

					//fertig
					add_output( array( true, 'Notiz wurde verschoben!' ) );
				}
				else{
					add_error( 'Kann nicht verschieben!' );
				}
			}
			else{
				//löschen muss es sein
				//	=> einfach nur die ID aus der Notizliste des Users löschen
				//		Notiz selbst bleibt auf Server und das soll auch so sein

				//suchen, nach Noteid
				$stelle = $notesfile->searchValue( [], $noteid, 'noteid' );
				//wenn gefunden
				if( $stelle !== false ){
					//löschen
					$notesfile->setValue( [$stelle], null );
					add_output( array( true, 'Notiz wurde geschloescht!' ) );
				}
				else{
					add_error( 'Unknown NoteID' );
				}
			}

		}
		else{
			add_error( 'Unknown Task' );
		}
	}
	else{
		add_error( 'Not allowed' );
	}
}
//Neu
elseif( check_params( POST, array( 'userid' => 'strAZaz09', 'name' => 'strALL') ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){
		//Notes lesen
		$notesfile = new JSONReader( 'user/user_'. $userid );
		//Notesliste
		$list = new JSONReader( 'notes/noteslist' );

		//Neue ID erstellen
		do{
			$newid = bin2hex( random_bytes( 50 ) );
		}while( $list->searchValue( [] , $newid) !== false );
		//neue ID merken
		$list->setValue( [null], $newid );

		//die groeßte Position suchen
		$pos = 0;
		foreach( $notesfile->getArray() as $note ){
			if( $note['position'] > $pos ){
				$pos = $note['position'];
			}
		}

		//neue Notiz dem User zuordnen
		//	ganz oben
		$notesfile->setValue( [null], array(
			'name' => $_POST['name'],
			'noteid' => $newid,
			'position' => $pos + 1
		));

		//Okay Ausgabe
		add_output( array( 'id' => $newid ) );
	}
	else{
		add_error( 'Not allowed' );
	}	
}
//Archiv?
elseif(check_params( POST, array( 'userid' => 'strAZaz09', 'reload' => 'strAZaz09') ) ){
	//Userid
	//	=> Konvention nur kleine Buchstaben!
	$userid = preg_replace( '/[^a-z]/', '', $_POST['userid'] );

	//Loginstatus
	if( check_logged_in( $userid ) ){

		//Liste aller Notes des Systems
		$allNotesList = new JSONReader( 'notes/noteslist' );
		//Liste aller aktiver Notes des Users
		$activeNotesList = new JSONReader( 'user/user_'. $userid );

		//Liste?
		if( $_POST['reload'] == 'none' ){
			//Liste aller aktiver Notes des Users
			//	IDs => in Array
			$activeIds = array_column( $activeNotesList->getArray(), 'noteid' ); 

			//Array fuer alle deaktivierten Notes des Users
			$out = array();

			//alle IDs des System durchgehen
			foreach( $allNotesList->getArray() as $noteId ){
				//Notiz schon aktiv?
				if( !in_array( $noteId, $activeIds ) ){
					//Notiz diese Users?
					//	Notzi laden
					$note = new JSONReader( 'notes/note_' . $noteId );
					//	nicht leer?
					if( $note->getArray() !== array() ){
						//UserID passend?
						if( $userid == $note->getValue(['userid']) ){
							$out[] = array(
								'noteid' => $noteId,
								'name' => $note->getValue(['name']),
								'geaendert' => date( 'H:i:s d.m.Y', $note->getValue(['geandert']) )
							);
						}
					}
				}
			}

			//Ausgabe
			add_output( $out );

		}
		//aus Archiv retten
		else{
			//Noteid
			//	=> Konvention nur kleine Buchstaben und Zahlen!
			$noteid = preg_replace( '/[^a-z0-9]/', '', $_POST['reload'] );

			//NoteID vorhanden
			if( $allNotesList->searchValue( [], $noteid ) !== false ){
				//die zu ladende Notiz einlesen
				$newNote = new JSONReader( 'notes/note_' . $noteid );

				//User okay?
				if( $newNote->isValue( ['userid'], $userid ) ){

					//die groeßte Position suchen
					$pos = 0;
					foreach( $activeNotesList->getArray() as $note ){
						if( $note['position'] > $pos ){
							$pos = $note['position'];
						}
					}

					//neue Notiz dem User zuordnen
					//	ganz oben
					$activeNotesList->setValue( [null], array(
						'name' => $newNote->getValue(['name']),
						'noteid' => $noteid,
						'position' => $pos + 1
					));
				}
				else{
					add_error( 'UserID not owner of NoteID' );
				}
			}
			else{
				add_error( 'NoteID unknown' );
			}
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
