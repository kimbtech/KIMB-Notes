//Onload
$(function (){
	loginsys();
});

//Allgemein fuer Userid und Namen
var userinformation = { "name": null, "id": null, "admin" : false };
//Speicher fuer Timeout
var errorMessageTimeOut = null;

//Ein und Ausblendungen überarbeiten
function review( enabled ){
	//erstmal alles weg
	$( "div.login" ).addClass( "disable" );
	$( "div.noteview" ).addClass( "disable" );
	$( "div.noteslist" ).addClass( "disable" );

	//eins wieder hin
	$( "div." + enabled ).removeClass( "disable" );
}

/**
 * globale Fehlermeldung anzeigen
 * @param {String} message Text der Fehlermeldung
 * @param {int} remove (optional) Wann soll die Nachricht wieder verschwinden (Sekunden oder false; Standard 10)
 */
function errorMessage( message, remove ){
	//Remove gegeben?
	if( typeof remove == "undefined" ){
		remove = 10;
	}
	//Meldung setzen
	$( "div.global.error.message" ).html( message );
	//Medlung anzeigen
	$( "div.global.error.message" ).removeClass( "disable" );

	//altes Timeout weg
	if( errorMessageTimeOut !== null ){
		clearTimeout( errorMessageTimeOut );
	}

	//Soll Meldung ueberhaupt verschwinden
	if( remove !== false ){
		//per timeOut wieder loeschen
		errorMessageTimeOut = setTimeout( function(){
			//wieder weg
			$( "div.global.error.message" ).addClass( "disable" );
		}, remove * 1000 );
	}	
}

/**
 * AJAX Anfrage an Server stellen
 * @param {String} task Aufgabenbereich der Anfage (login, list, view, admin)
 * @param {JSON} post Daten die per POST übertragen werden sollen
 * @param {function (JSON)} callback (optional) Funktion nach erfolgreicher Anfage, JSON Rückgabe als Parameter
 * @param {function (JSON)} errcallback (optional) Funktion bei fehlerhafter Anfrage, JSON Rückgabe wenn möglich
 */
function ajax_request( task, post, callback, errcallback ){
	$.post( domain + "/ajax.php?" + task , post,
		function (data) {
			//Serveranwort okay?
			if( typeof data === "object" ){
				//Fehler?
				if( data.status === 'error' ){
					//log auf Konsole
					console.log( data.error );
				}
				else{
					//Fehlermeldungen wegnehmen
					errorMessage('', 0);
				}
				//Callback vorhanden?
				if( typeof callback === "function" ){
					callback( data );
				}
			}
			else{
				//globale Fehlermeldung
				errorMessage('Sever antwortet nicht korrekt!', false);

				//Callback vorhanden?
				if( typeof errcallback === "function" ){
					errcallback( data );
				}
			}
		}
	).fail( function() {
		//globale Fehlermeldung
		errorMessage('Verbindung zum Sever verloren!', false);

		//Callback vorhanden?
		if( typeof errcallback === "function" ){
			errcallback( {} );
		}
	} );
}

//Login
//	Loginform und Login der Link machen
//	per AJAX auf Server auth. (Session)
function loginsys(){
	//Loginform zeigen
	review( "login" );

	//3 Loginmethoden versuchen
	//	bei Fehler wird automatisch nächste gemacht
	loginlocalstorage();

	/**
		LOGINMETHODEN
	**/

	//Login per Userdata in localStorage (wenn Session noch okay)
	function loginlocalstorage(){
		//noch was drin?
		if(
			localStorage.getItem( "userinformation_id" ) != '' && localStorage.getItem( "userinformation_id" ) != null
			&&
			localStorage.getItem( "userinformation_name" ) != '' && localStorage.getItem( "userinformation_name" ) != null
		){
			//uebernehmen
			userinformation.id = localStorage.getItem( "userinformation_id" );
			userinformation.name = localStorage.getItem( "userinformation_name" );
			userinformation.admin = JSON.parse( localStorage.getItem( "userinformation_admin" ) );

			$( "div.login div.input div.loading" ).removeClass( "disable" );
			
			//testen
			ajax_request(
				"login",
				{ "status" : userinformation.id },
				function (data){

					$( "div.login div.input div.loading" ).addClass( "disable" );

					if( data.data == true ){

						//Logoutbutton
						logout_enable();

						//Notizliste
						list();

				
					}
					else{
						loginlink();
					}
				});
		}
		else{
			loginlink()
		}
	}

	//Login per Link
	function loginlink(){
		//Link holen
		var code = window.location.hash;
		//Link vorhanden?
		if( code != "" ){
			//das # wegmachen
			code = code.substr( 1 );
			//Soll die korrekte Form haben
			//	https://notes.5d7.eu/#<username>:<authcode>
			var expr = new RegExp( '[a-z]+:[a-z0-9]+' );
			//prüfen
			if( expr.test( code ) ){
				//aufteilen
				var parts = code.split( ':' );
				//übernehmen
				var user = parts[0];
				var auth = parts[1];

				//Versuch einzuloggen
				console.log( 'Versuche User "'+user+'" mit Loginlink einzuloggen.' );
				$( "div.login div.input div.loading" ).removeClass( "disable" );
				ajax_request(
					"login",
					{ "username" : user, "authcode" : auth },
					function ( data ){
						$( "div.login div.input div.loading" ).addClass( "disable" );
						if( data.status === 'okay' ){
							//Login okay!

							//global merken
							userinformation.name = user;
							userinformation.id = data.data.id;
							userinformation.admin = data.data.admin;
							//in localStorage
							localStorage.setItem( "userinformation_id", userinformation.id );
							localStorage.setItem( "userinformation_name", userinformation.name );	
							localStorage.setItem( "userinformation_admin", userinformation.admin );

							//Logoutbutton
							logout_enable();

							//Notizliste
							list();
							
						}
						else{
							// naechste Methode
							loginform();
						}
					}
				);
			}
			else{
				// naechste Methode
				loginform();
			}
		}	
		else{
			// naechste Methode
			loginform();
		}		
	}

	//Loginformular
	function loginform(){
		//zeigen
		$( "div.login p.message.important" ).removeClass( "disable" );

		$( "div.login p.message.error" ).addClass( "disable" );
		$( "div.login p.message.okay" ).addClass( "disable" );
		$( "div.login div.input div.loading" ).addClass( "disable" );

		$( "div.login div.input div#loginform" ).removeClass( "disable" );
		$( "div.login div.input" ).removeClass( "disable" );

		//Listener
		//	Klick
		$( "button#userlogin" ).unbind("click").click( try_login );
		//	Enter
		$( "input#userpassword" ).unbind("keyup").keyup( function( event ) {
			if(event.keyCode == 13){
				try_login();
			}
		});

		//Ajax
		function try_login(){
			$( "div.login div.input div.loading" ).removeClass( "disable" );
			$( "div.login div.input div#loginform" ).addClass( "disable" );
			$( "div.login p.message.important" ).addClass( "disable" );
			//Password Hash
			var hashedpw = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( $( "input#userpassword" ).val() ) );

			ajax_request( "login",
				{ "username" : $( "input#username" ).val() , "password" : hashedpw },
				function ( data ){ 

					$( "div.login div.input div.loading" ).addClass( "disable" );

					if( data.status === 'error' ){
						$( "div.login p.message.error" ).removeClass( "disable" );
						$( "div.login div.input div#loginform" ).removeClass( "disable" );
					}
					else if( data.status === 'okay' ){
						//okay
						$( "div.login p.message.okay" ).removeClass( "disable" );
						$( "div.login p.message.error" ).addClass( "disable" );
						$( "div.login div.input" ).addClass( "disable" );

						//Input Felder leeren
						$( "input#username" ).val("");
						$( "input#userpassword" ).val("");

						//global merken
						userinformation.name = data.data.name;
						userinformation.id = data.data.id;
						userinformation.admin = data.data.admin;
						//in localStorage
						localStorage.setItem( "userinformation_id", userinformation.id );
						localStorage.setItem( "userinformation_name", userinformation.name );
						localStorage.setItem( "userinformation_admin", userinformation.admin );	

						//Logoutbutton
						logout_enable();

						//Notizliste
						list();
					}					
				});
		}
	}

	
	/**
		LOGOUT
	**/

	//Logout
	function logout_enable(){
		function display_and_listen(){
			$( "div.logout" ).removeClass( "disable" );

			$( "button#logout" ).unbind("click").click( do_logout );
		}

		var keepAliveInterval = null;

		function do_logout(){
			//ajax
			ajax_request( "login",
				 	{"logout" : null},
					function ( data ) {
						if( data.status === 'okay' ){
							$( "p.message.error.loggedout" ).removeClass( "disable" );
							setTimeout( function() {
									$( "p.message.error.loggedout" ).addClass( "disable" );
								}, 20000 );
						}
					}
				);

			//Storage löschen
			//	alles?
			if( $( "input#logouttype:checked" ).length == 0 ){
				localStorage.clear();
			}
			else{
				//nur Loginname
				localStorage.removeItem( "userinformation_id" );
				localStorage.removeItem( "userinformation_name" );
			}

			//Userifos zuruecksetzen
			userinformation = { "name": null, "id": null, "admin" : false };

			//Auch etwaige Links wegnehmen
			window.location.hash = "";

			//Session keep Alive ausschalten
			if( keepAliveInterval !== null ){
				clearInterval( keepAliveInterval );
			}
			//Fehlermeldungen verschwinden lassen
			errorMessage( "Fehler!", 0);

			//DOM bereinigen
			if( typeof cm_editor !== "undefined" ){
				//CodeMirror leeren
				cm_editor.setValue( 'empty' );
			}
			//Array aller zu bereinigenden DOM Elemente
			[
				'input#userpassword',
				'input#username',
				'input#notename',
				'div#notespreview',
				'textarea#notesinput',
				'input#newnotename',
				'div.listpart div.list'
			].forEach( function( v ){
				$( v ).empty();
				if( v !== 'textarea#notesinput' ){
					$( v ).val('');
				}
			});

			//ausblenden	
			$( "div.logout" ).addClass( "disable" );

			//Loginform zeigen
			loginsys();
		}

		//User soll solange eingeloggt bleiben, bis er sich
		//	ausloggt, Session alle 5 Minuten
		//	erneuern
		function keepSessionAlive(){
			//alle 5 Minuten Session wiederbeleben ;)
			keepAliveInterval = setInterval( function(){
				ajax_request(
					"login",
					{ "status" : userinformation.id },
					function (data){
						if( data.data != true ){
							//Fehler!
							errorMessage( 'Die Session ist abgelaufen!', false );
						}
					}
				);
			//5 Minuten in 1000-stel sec
			}, 300000 );
		}

		//Administratoren den Admin-Button
		//	zeigen
		function adminButtons(){
			//Beschriftungen
			$( "div.logout span.usertools" ).tooltip();

			//Admin?
			if( userinformation.admin ){
				//Systemadministration zeigen
				$( "div.logout span.usertools span.ui-icon-wrench" ).removeClass( "disable" );

				//Auf Click hoeren
				$( "div.logout span.usertools span.ui-icon-wrench" ).unbind('click').click( function() {
					//Admin JS laden
					$.getScript( domain + "/load/backend."+ jsdevmin +".js", function(){
						//AdminDialog offnen
						adminDialog();
					});
				});
			}
			else{
				//keine Administratoion
				$( "div.logout span.usertools span.ui-icon-wrench" ).addClass( "disable" );
			}

			//Useradministration
			$( "div.logout span.usertools span.ui-icon-person" ).unbind('click').click( function() {
				//authocode Manager oeffnen
				authCodeManager();
			});
		}

		display_and_listen();
		keepSessionAlive();
		adminButtons();
	}
}



//Noteslist
function list(){
	//Liste zeigen
	review( "noteslist" );

	//machen
	get_userdata();

	//Userdaten holen 
	//	alle Notizen
	function get_userdata(){
		$( "div.noteslist div.listpart div.loading" ).removeClass( "disable" );
		ajax_request( "list",
		 	{"userid" : userinformation.id},
			function ( data ) {
				$( "div.noteslist div.listpart div.loading" ).addClass( "disable" );
				if( data.status === 'okay' ){
					showlist( data.data );
				}
			}
		);
	}

	//Liste mit allen Notizen zeigen
	function showlist( notes ){

		//Neue Notiz Button
		$( "button#newnote" ).unbind("click").click( function (){
			var name = $( "input#newnotename" ).val();
			if( name != '' ){
				makenew( name )
			}
		});

		//Archivbutton
		$( "button#notesarchive" ).unbind("click").click( function (){
			//Manager fuer alte Notizen laden
			oldNotesManager();
		});

		//Notizen
		//	Liste erstellen
		var table = '<ul>';
		//	alle durchgehen
		$.each( notes, function(k,v){
			//anfügen
			table += '<li class="noteslist_notesnames box" noteid="' + v.noteid + '"><span class="notesnames">'+ v.name +'</span> <span class="noteseditbuttons">'
				+ '<button art="up" title="Nach oben" '+ (k != 0 ? '' : 'disabled="disabled"' ) +'>&uarr;</button>'
				+ '<button art="down" title="Nach unten" '+ ( notes.length - 1 != k ? '' : 'disabled="disabled"' ) +'>&darr;</button>'
				+ '<button art="del" title="Notiz archivieren">&#x21bb;</button>'
				+ '</span></li>';
		});
		table += '</ul>';
		//auf Seite einblenden
		$( "div.noteslist div.listpart div.list" ).html( table );
		//Tooltips fuer hoch, runter, Archiv
		$( "li.noteslist_notesnames" ).tooltip();

		//Liste Design
		$( "div.noteslist div.listpart div.list ul" ).css({ "list-style-type": "none" });
		$( "div.noteslist div.listpart div.list ul li.noteslist_notesnames" ).css({ "line-height": "28px" });
		//Buttons Design
		$( "span.noteseditbuttons" ).css({ "float" : "right", "cursor" : "pointer" });
		//Design Name
		$( "div.noteslist div.listpart div.list ul li span.notesnames" ).css({ "display" : "inline-block", "cursor" : "pointer" });

		//Listener
		//	Open
		$( "div.noteslist div.listpart div.list ul li span.notesnames" ).unbind('click').click(function(){
			var noteid = $( this ).parent().attr( "noteid" );
			var name = $( this ).text();
			//Notiz zeigen
			console.log( 'Oeffne: "'+ name + '" ("' + noteid + '")' );
			maker( noteid, name );
		});
		//	sotieren, delete (nur unsichtbar machen)
		$( "span.noteseditbuttons button" ).unbind("click").click(function(){
			var art = $( this ).attr( "art" );
			var noteid = $( this ).parent().parent().attr( "noteid" );
			
			$( "div.noteslist div.listpart div.loading" ).removeClass( "disable" );

			ajax_request( "list",
		 		{"userid" : userinformation.id, "art" : art, "noteid" : noteid },
				function ( data ) {
					$( "div.noteslist div.listpart div.loading" ).addClass( "disable" );
					if( data.status === 'okay' ){
						//Log
						console.log( 'Notiz: "' + noteid + '" wurde '+ ( art == 'del' ? 'gelöscht' : ( art == 'up' ? 'nach oben verschoben' : 'nach unten verschoben' ) ) );

						//neue Liste machen
						list();
					}
				}
			);
		});


	}

	//Neue Notiz
	function makenew( name ){

		$( "div.noteslist div.listpart div.loading" ).removeClass( "disable" );

		ajax_request( "list",
	 		{"userid" : userinformation.id, "name" : name },
			function ( data ) {
				$( "div.noteslist div.listpart div.loading" ).addClass( "disable" );
				if( data.status === 'okay' ){

					//Log
					console.log( 'Notiz: "' + name + '" ("' + data.data.id + '") angelegt.' );

					//neue Liste machen
					list();
				}
			}
		);
	}
}

var cm_editor;

//Notesmaker
function maker( noteid, notename ){
	//Notiz zeigen
	review( "noteview" );

	//Notiz holen
	var notedata;
	//Besteht die Gefahr, dass die Notiz auf dem Server ueberschrieben
	//	wird?
	//		(zB: wenn Server nicht antwortet, aber noch eine Nachricht im localStorage)
	var noteOverrideDanger = false;
	function get_notedata(){

		//Daten ohne Server aus localStorage oder Vorgabe nehmen
		// empty => Ist der Server leer?
		function getDataWithoutServer( empty ){
			//Dateien 
			if( !empty ){
				//Gefahr merken
				noteOverrideDanger = true;
				//Meldung
				errorMessage( 'Kann die aktuelle Version der Notiz nicht vom Server holen.', 20 );
			}

			//erst in localStorage gucken
			if( localStorage.getItem( "note_autosave_"+noteid ) != null ){
				//localStorage
				notedata = JSON.parse( localStorage.getItem( "note_autosave_"+noteid ) );

				//Eingabefeld
				make_inputfield();
			}
			else{
				//Fallback (Vorgabe)
				notedata = {
					"name" : notename,
					"id" : noteid,
					"content" : "# "+notename+"\nUnd hier dann der Text!!\n"
				};

				//Eingabefeld
				make_inputfield();
			}
		}

		$( "div.noteview div.loading" ).removeClass( "disable" );
		ajax_request( "view",
	 		{"userid" : userinformation.id, "noteid" : noteid },
			function ( data ) {
				$( "div.noteview div.loading" ).addClass( "disable" );
				//Abfrage okay?
				if( data.status === 'okay' ){
					//neue Notiz (dann Server noch leer)
					if( !data.data.empty ){

						//Daten übernehmen
						notedata = {
							"name" : data.data.name,
							"id" : data.data.id,
							"content" : data.data.content
						};
					
						//Eingabefeld
						make_inputfield();
					}
					else{
						getDataWithoutServer( true );	
					}
				}
				else{
					getDataWithoutServer( false );
				}
			},
			function ( data ){
				getDataWithoutServer( false );
			}
		);
		

	}

	//Schließen Button (und Freigabe) nutzbar machen
	function closebutton(){
		$( "button#closenote" ).unbind("click").click(function (){
			//schließen und speichern

			//die EventListener weg machen
			//	Parser
			cm_editor.off( "change", here_parser_reparse );
			//	Speicherung
			cm_editor.off( "change", here_codemi_save );
		
	
			//save (hier nur expliziet per AJAX)
			//	localStorage wird ja immer bei jeder Änderung gemacht
			ajaxsave( function ( okay ){
				if( okay ){
					//zur Notizliste
					list();
				}
				else{
					//Fehlermeldung
					$( "body" ).append( '<div id="errorMessageNoteSave">Die Speicherung der Notiz auf dem Server schlug fehl!<br />Wollen Sie den Editor verlassen und einen Verlust der Änderungen in Kauf nehmen oder abbrechen?</div>' );
					$( "#errorMessageNoteSave" ).dialog({
						resizable: false,
						height: "auto",
						width: "auto",
						modal: true,
						title : 'Fehler beim Speichern!',
						buttons: {
							"Änderungen verwerfen": function() {
								$( this ).dialog( "close" );
								list();
							},
							"Abbrechen" : function() {
								$( this ).dialog( "close" );
							}
						},
						close : function(){
							$( this ).remove();
						}
					});
				}
			});		
		});

		//Freigabe Manager laden
		$( "button#publishnote" ).unbind( 'click' ).click( freigabeManager );

		//Verlaufs Manager laden
		$( "button#notehistory" ).unbind( 'click' ).click( historyManager );
	}
	// Die internen Funktione, die per Event von CodeMirror aufgerufen werden,
	// müssen am Ende wieder aus dem Event (on...) weg.
	var here_parser_reparse, here_codemi_save;


	//Codemirror laden
	//Textarea und Notizname setzen
	function make_inputfield(){
		$( "input#notename" ).val( notedata.name );
		$( "textarea#notesinput" ).text( notedata.content );
		//CodeMirror schon geladen (von einer anden Notiz)?
		if( typeof cm_editor !== "object" ){
			//Nein, dann neu laden
			cm_editor = CodeMirror.fromTextArea(document.getElementById( "notesinput" ) ,{
				mode: 'gfm',
				lineNumbers: true,
				theme: "default"
			});
		}
		else{
			//Ja, einfach Inhalt neu schreiben
			cm_editor.setValue( $( "textarea#notesinput" ).val() );
		}

		//Parser soll immer Änderungen übernhemen
		//und darsetllen
		load_parser_preview();
		//Änderungen sollen in localStorage abgeleget werden und
		//auch regemläßig per AJAX auf Server
		autosave_changes();
	}
	//Parser aktivieren
	//bei jeder Änderung der Texte ausführen
	function load_parser_preview(){


		//Mit eigenem Renderer etwas am Markdown rumspielen
		var markRend = new marked.Renderer();
		//	Überschriften erst bei H3 beginnen
		markRend.heading = function (text, level) {
			//einfach Level + 2
			return '<h' + ( level + 2 ) + '>' + text + '</h' + ( level + 2 ) + '>';
		}
		//	Links sollen immer _blank sein!
		markRend.link = function (href, title, text) {
			return '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>';
		}
		//Markdown Parser init.
		marked.setOptions({
			renderer: markRend,
			gfm: true,
			tables: true
		});

		//Funktion, um immer aktuellen Inhalt zu parsen
		function reparse(){
			$( "div#notespreview" ).html( marked( cm_editor.getValue() ) );
		}
		//	einmal zu Beginn
		reparse();
		//	bei jeder Änderung
		cm_editor.on( "change", reparse );

		//	Funtktion für spätere Enfernung festhalten
		here_parser_reparse = reparse;
	}
	//Änderungen speichern
	var lastajaxsave = 0;
	function autosave_changes(){
		//Funktion fuer Speicherung
		function save(){
			//Datensatz erstellen
			var savedata = {
				"name" : $( "input#notename" ).val(),
				"id" : notedata.id,
				"content" : cm_editor.getValue()
			};
			//als JSON in localStorage
			localStorage.setItem( "note_autosave_"+notedata.id , JSON.stringify( savedata ) );

			//auch per ajax sichern (aber nicht allzu oft, alle 30sec)
			if( Date.now() - ( 30 * 1000 ) > lastajaxsave ){
				ajaxsave();
			}
		}
		//einmal zu Beginn
		save();
		//bei jeder Änderung
		cm_editor.on( "change", save );

		//	Funtktion für spätere Enfernung festhalten
		here_codemi_save = save;
	}
	//Speicherung per AJAX durchführen
	function ajaxsave( callback ){
		//Gefahr des Überschreibens?
		if( noteOverrideDanger ){
			//User darauf hinweisen

			$( "body" ).append( '<div id="dangerMessageNoteSave">Beim Speichern der Notiz kann es eventuell zu Datenverlust kommen, da die aktuellste Version nicht vom Server geladen werden konnte!</div>' );
			$( "#dangerMessageNoteSave" ).dialog({
				resizable: false,
				height: "auto",
				width: "auto",
				modal: true,
				title : 'Gefahr des Datenverlustes!',
				buttons: {
					"Trotzdem Speichern": function() {
						$( this ).dialog( "close" );
						//jetzt keine Gefahr mehr
						noteOverrideDanger = false;
						//Speichern
						doSave();
					},
					"Erstmal nicht" : function() {
						$( this ).dialog( "close" );
					}
				},
				close : function(){
					$( this ).remove();
				}
			});
		}
		else{
			//immer speichern!
			doSave();
		}

		//Die Speicherung ausführen
		function doSave(){
			$( "div.noteview div.loading" ).removeClass( "disable" );
			ajax_request( "view",
				{"userid" : userinformation.id, "noteid" : noteid, "note" : { "name" : $( "input#notename" ).val(), "cont" : cm_editor.getValue() } },
				function ( data ) {
					$( "div.noteview div.loading" ).addClass( "disable" );
					if(
						data.status === 'okay'
					){

						console.log( 'Notiz: "' + notename + '" ("' + noteid + '") auf Server gespeichert.' );

						//Zeitpunkt merken
						lastajaxsave = Date.now();

					}

					//Callback vorhnaden?
					if( typeof callback === "function" ){
						callback( ( data.status === 'okay' ) );
					}
				},
				function ( data ){
					//Callback vorhnaden?
					if( typeof callback === "function" ){
						callback( false );
					}
				}
			);
		}
	}

	//Daten holen
	// => dann automatisch Eingabefeld
	get_notedata();
	//Schließen Button funktionstüchtig machen
	closebutton();
	
	//Manager fuer das Freigeben von Notizen
	function freigabeManager(){
		alert( '\n!!!Funktion noch nicht vorhanden!!!\n' );
	}

	//Manager fuer Notizverläufe
	function historyManager(){
		alert( '\n!!!Funktion noch nicht vorhanden!!!\n' );
	}
}

//Manager Dialog das Management der
//	Authcodes des Users
function authCodeManager(){
	//Dialog dem DOM hinzufügen
	function initDialog(){
		$( "body" ).append( '<div id="authCodeManagerDialog">Lädt ...</div>' );
		$( "div#authCodeManagerDialog" ).dialog({
			resizable: false,
			height: "auto",
			width: "auto",
			modal: true,
			title : 'Authentifizierungslinks und Passwort',
			close : function(){
				$( this ).remove();
			}
		});
	}
	//Inhalt des Dialogs defineren
	function dialogSetContent( cont ){
		$( "div#authCodeManagerDialog" ).html( cont );
	}

	//Erste Ansicht des Dialogs laden und
	//	mit Listenern versehen
	function loadContent( authcodes ){

		//HTML Inhalte
		var html = '<h3>Authentifizierungslinks</h3>'
		if( authcodes !== false ){
			html += '<table>'
				+ '<tr>'
				+ '<th>Code (Anfang)</th>'
				+ '<th>Letzte Nutzung</th>'
				+ '<th>Löschen</th>'
				+ '</tr>';
			//Tabelle füllen
			authcodes.forEach( function( value ) {
				html += '<tr>'
					+ '<td><code style="color:black;">'+ value.code +'</code></td>'
					+ '<td>'+ value.time +'</td>'
					+ '<td><button class="deleteAuthLink" linkid="'+ value.id +'">Link Löschen</button></td>'
					+ '</tr>';
			});

			html += '</table>'
		}
		else{
			html += '<p>Sie haben noch keine Authentifizierungslinks!</p>';
		}
		html += '<button id="addAuthLink">Neuen Link hinzufügen</button>'
			+ '<p>&nbsp;</p>';
		html += '<h3>Passwort ändern</h3>'
			+'<div id="newPasswordLoader" class="loading disable"></div>'
			+'<input class="newPassword" type="password" id="newPasswordA" placeholder="Neues Passwort"> <span class="newPasswordIndikator" id="newPasswordAIndikator">Bitte geben Sie ein Passwort ein!</span><br />'
			+'<input class="newPassword" type="password" id="newPasswordB" placeholder="Neues Passwort"> <span class="newPasswordIndikator" id="newPasswordBIndikator">Bitte geben Sie das Passwort ein!</span><br />'
			+'<button id="newPasswordSet">Ändern</button>'
			+'<div id="newPasswordDone" class="disable"></div>';

		dialogSetContent( html );

		//Passwort Button aus
		$( "button#newPasswordSet" ).prop('disabled', true);
		//Passwort Indikator Design
		$( "span.newPasswordIndikator" ).css( { 'border-radius' : '5px', 'padding' : '2px' } );

		//Listener
		$( "button#newPasswordSet" ).click( function(){
			var pA = $( "input#newPasswordA" ).val();
			var pB = $( "input#newPasswordB" ).val();

			//Passwörter testen
			if( testPasswords(pA, pB ) ){
				//Loading Indikator
				$( "div#newPasswordLoader" ).removeClass( "disable" );
				//Anfrage Salt
				ajax_request( "account", { userid : userinformation.id }, function (data) {
					if( data.status === 'okay' ){
						//Salt lesen
						var salt = data.data;
						//Passwort Hash erzeugen
						var password = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( pA ) );
						password = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( password + "+" + salt ) );

						//Passwort setzen
						ajax_request( "account", { userid : userinformation.id, newpass : password, salt : salt  }, function (data) {
							//Loader
							$( "div#newPasswordLoader" ).addClass( "disable" );
							if( data.status === 'okay' ){
								//Fehlermeldung
								$( "div#newPasswordDone" ).removeClass( "disable error" );
								$( "div#newPasswordDone" ).addClass( "okay" );
								$( "div#newPasswordDone" ).text( "Passwort geändert!" );						
							}
							else{
								//Fehlermeldung
								$( "div#newPasswordDone" ).removeClass( "disable okay" );
								$( "div#newPasswordDone" ).addClass( "error" );
								$( "div#newPasswordDone" ).text( "Konnte Passwort nicht ändern!" );						
							}
						});
					}
					else{
						$( "div#newPasswordLoader" ).addClass( "disable" );
						//Fehlermeldung
						$( "div#newPasswordDone" ).removeClass( "disable okay" );
						$( "div#newPasswordDone" ).addClass( "error" );
						$( "div#newPasswordDone" ).text( "Konnte Passwort nicht ändern!" );						
					}
				});				
			}
			else{
				return false;
			}
			
		});
		//Indikatoren
		$( "input.newPassword" ).on( 'keyup', function (){
			var pA = $( "input#newPasswordA" ).val();
			var pB = $( "input#newPasswordB" ).val();

			//Passwörter testen
			if( testPasswords(pA, pB ) ){
				$( "button#newPasswordSet" ).prop('disabled', false);
			}
			else{
				$( "button#newPasswordSet" ).prop('disabled', true);
			}
		});

		//Löschen von Authcodes
		$( "button.deleteAuthLink" ).click( function () {
			var codeid = $( this ).attr( 'linkid' );

			alert( 'Löschen noch nicht möglich!\n\n' +codeid );

			// Wirklich sicher Dialog
		});

		//Hinzufügen von Authcodes
		$( "button#addAuthLink" ).click( function () {
			alert( 'Hinzufügen noch nicht möglich!' );

			//Dialog mit vollständigem Code und Link, wenn
			//	erstellt 
		});

		//Funktionen
		function testPasswords( pA, pB ){
			//erstmal okay
			var error = false;
			//Textfarbe
			$( "span#newPasswordAIndikator" ).css({ 'color' : 'white' });
			//überhaupt gefüllt
			if( pA == "" ){
				$( "span#newPasswordAIndikator" ).css({ 'background-color' : 'inherit' });
				$( "span#newPasswordAIndikator" ).text( 'Bitte geben Sie ein Passwort ein!' );
				error = true;
			}
			//überhaupt gefüllt
			if( pB == "" ){
				$( "span#newPasswordBIndikator" ).css({ 'background-color' : 'inherit' });
				$( "span#newPasswordBIndikator" ).text( 'Bitte geben Sie das Passwort ein!' );
				error = true;
			}
			//passwort A gefüllt
			//	=> Indikator
			if( pA != "" ){
				//Variablen
				var inputval = pA
				var inputvallen = pA.length;
				var passbarval = 0;
				var text;

				//Länge ausreichend
				if( inputvallen > 5 ){
					//Länge beachten:
					inputvallen = inputvallen - 5;
					passbarval += inputvallen * 5;
					//	aber nicht übertreiben
					if( passbarval > 20 ){
						passbarval = 20;
					}

					//Zeichen betrachten:
					if( inputval.match(/([a-zA-Z])/) ){
						passbarval += 10;
					}
					if( inputval.match(/([A-Z])/) ){
						passbarval += 5;
					}
					if( inputval.match(/([0-9])/) ){
						passbarval += 5;
					}
					if( inputval.match(/([0-9].*[0-9])/) ){
						passbarval += 10;
					}
					if( inputval.match(/([0-9].*[0-9].*[0-9])/) ){
						passbarval += 10;
					}			
					if( inputval.match(/([!,%,&,@,#,*,?,_,])/) ){
						passbarval += 15;
					}
					if( inputval.match(/([!,%,&,@,#,*,?,_,].*[!,%,&,@,#,*,?,_,])/) ){
						passbarval += 15;
					}
					if( inputval.match(/([!,%,&,@,#,*,?,_,].*[!,%,&,@,#,*,?,_,].*[!,%,&,@,#,*,?,_,])/) ){
						passbarval += 15;
					}
				}
				else{
					//zu kurz
					passbarval = 0;
				}

				//Aussage
				if( passbarval <= 25 ){
					text = "Das soll ein Passwort sein?";
					$( "span#newPasswordAIndikator" ).css({ 'background-color' : 'red' });
				}
				else if( passbarval <= 50 ){
					text = "Gut, aber es geht noch besser!";
					$( "span#newPasswordAIndikator" ).css({ 'background-color' : 'orange' });
					$( "span#newPasswordAIndikator" ).css({ 'color' : 'black' });
				}
				else if( passbarval <= 75 ){
					text = "Das sieht doch super aus!";
					$( "span#newPasswordAIndikator" ).css({ 'background-color' : 'yellow' });
					$( "span#newPasswordAIndikator" ).css({ 'color' : 'black' });
				}
				else if( passbarval <= 100 ){
					text = "Da werden die Hacker schwitzen!";
					$( "span#newPasswordAIndikator" ).css({ 'background-color' : 'green' });
				}
				//Text setzen
				$( "span#newPasswordAIndikator" ).text( text );
			}
			//verschieden und gefüllt?
			if( pA != pB && pA != "" && pB != "" ){
				$( "span#newPasswordBIndikator" ).css({ 'background-color' : 'red' });
				$( "span#newPasswordBIndikator" ).text( 'Die Passwörter stimmen nicht überein!' );
				error = true;
			}

			//Rückgabe
			if( !error ){
				$( "span#newPasswordBIndikator" ).css({ 'background-color' : 'green' });
				$( "span#newPasswordBIndikator" ).text('Passwörter stimmen überein!');
				return true;
			}
			else{
				return false;
			}
		}

	}

	//Dialog erstellen
	initDialog();
	//Inhalt
	ajax_request( "account", { userid : userinformation.id, art : 'list', id : 'list' },
		function( data ){
			if( data.status === 'okay' ){
				loadContent( data.data );
			}
			else{
				dialogSetContent( 'Kann nicht laden!' );
			}
		});

}

//Manager Dialog fuer das Wiederherstellen
//	von alten Notizen
function oldNotesManager(){
	alert( '\n!!!Funktion noch nicht vorhanden!!!\n' );
}

