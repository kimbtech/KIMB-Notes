//Login
//	Loginform und Login der Link machen
//	per AJAX auf Server auth. (Session)
function loginsys(){
	//Freigbe prüfen
	function check_share(){
		//allgemeiner Ladebalken
		review('globalloader');

		//Link holen
		var authcode = window.location.hash;
		//Link vorhanden?
		if( authcode != "" ){
			//das # wegmachen
			authcode = authcode.substr( 1 );
			//Soll die korrekte Form haben
			//	https://notes.example.com/#<authcode>
			var expr = new RegExp( '[^A-Za-z0-9]' );
			//okay?
			if( !expr.test( authcode ) ){
				//share laden
				shareviewer( authcode, noshare );
			}
			else{
				noshare();
			}
		}
		else{
			noshare();
		}

		function noshare() {
			//Loginform zeigen
			review( "login" );
	
			//3 Loginmethoden versuchen
			//	bei Fehler wird automatisch nächste gemacht
			loginlocalStorage();
		}
	}
	check_share();

	/**
		LOGINMETHODEN
	**/

	//Login per Userdata in localStorage (wenn Session noch okay)
	function loginlocalStorage(){
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

			//REST?
			if( localStorage.getItem( "userinformation_authcode" ) != '' && localStorage.getItem( "userinformation_authcode" ) != null ){
				userinformation.authcode = localStorage.getItem( "userinformation_authcode" );
				systemRESTAPI = true;

				//gleich zur Liste, kein Login nötig!
				list();
			}
			else{

				$( "div.login div.input div.loading" ).removeClass( "disable" );
				
				//testen
				ajax_request(
					"login",
					{ "status" : userinformation.id },
					function (data){

						$( "div.login div.input div.loading" ).addClass( "disable" );

						//Offline
						if( systemOfflineMode ){
							//Logoutbutton
							logout_enable();
							//Notizliste
							list();
						}
						else{
							if( data.data == true ){

								//Logoutbutton
								logout_enable();

								//Notizliste
								list();
							}
							else{
								loginlink();
							}
						}
					});
			}
		}
		else{
			//wenn offline und keine Infos im localStrorage, dann kann
			//	gleich das Form gezeigt werden, Authcode lässt sich ja nicht prüfen
			if( systemOfflineMode ){
				loginform();
			}
			else{
				loginlink();
			}
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
			//	https://notes.example.com/#<username>:<authcode>
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
							userinformation.authcode = auth;
							//in localStorage
							localStorage.setItem( "userinformation_id", userinformation.id );
							localStorage.setItem( "userinformation_name", userinformation.name );	
							localStorage.setItem( "userinformation_admin", userinformation.admin );
							localStorage.setItem( "userinformation_authcode", userinformation.authcode );

							systemRESTAPI = true;

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
		if( systemOfflineMode ){
			$( "div.login p.message.important.offline" ).removeClass( "disable" );
			$( "div.login p.message.important.online" ).addClass( "disable" );
			$( "div.login div.input div#loginform" ).addClass( "disable" );
			$( "div.login div.input" ).addClass( "disable" );
		}
		else{
			//evtl. doch offline?
			ajax_request(
				"login",
				{ "status" : userinformation.id },
				function ( data ){ if( systemOfflineMode){loginform();} }
			);

			$( "div.login p.message.important.offline" ).addClass( "disable" )
			$( "div.login p.message.important.online" ).removeClass( "disable" );
		}

		$( "div.login p.message.error" ).addClass( "disable" );
		$( "div.login p.message.okay" ).addClass( "disable" );
		$( "div.login div.input div.loading" ).addClass( "disable" );

		if( !systemOfflineMode ){
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
		}

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
			if( !systemOfflineMode ){
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
			}

			//Storage löschen
			//	alles?
			if( $( "input#logouttype:checked" ).length == 0  ){
				localStorage.clear();
			}
			else{
				//nur Loginname
				localStorage.removeItem( "userinformation_id" );
				localStorage.removeItem( "userinformation_name" );
				localStorage.removeItem( "userinformation_authcode" );
			}

			//Userifos zuruecksetzen
			userinformation = { "name": null, "id": null, "admin" : false, "authcode" : null };

			//kein REST mehr
			systemRESTAPI = false;

			//Auch etwaige Links wegnehmen
			window.location.hash = "";

			//Session keep Alive ausschalten
			if( keepAliveInterval !== null ){
				clearInterval( keepAliveInterval );
			}
			//Fehlermeldungen verschwinden lassen
			errorMessage( null );

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
			//		und dabei nach Änderungen in den Notes gucken!
			keepAliveInterval = setInterval( function(){
				//aktuell eine Notiz geöffnet??
				if( localStorage.getItem( "note_maker_reopen" ) != null && localStorage.getItem( "note_maker_reopen" ) != 'none' ){
					var lastopend = JSON.parse( localStorage.getItem( "note_maker_reopen" ) );
					//das zuletzt geändert der Notiz abrufen
					ajax_request(
						"view",
						{ "userid" : userinformation.id, "noteid" : lastopend.noteid, history : 4 },
						function (data){
							if( data.status === 'error' ){
								//Fehler!
								errorMessage( 'Die Session ist abgelaufen!', false );
							}
							else{
								//aktuell geöffnete Notiz im localStorage?
								if( JSON.parse( localStorage.getItem( "note_autosave_"+lastopend.noteid ) ) != null ){
									//Zeitpunkt der letzten Synchronisation bestimmen
									var lastsync = JSON.parse( localStorage.getItem( "note_autosave_"+lastopend.noteid ) ).lastserverchanged;									
									//Notiz auf dem Server aktuelle als Zeitpunkt der letzten
									//	Synchronisierung?
									if( data.data - lastsync > 5 ){
										//console.log( data.data - lastsync, data.data, lastsync);
										newerNoteOnServerFound();
									}
								}
							}
						}
					);
				}
				else{
					//normal wiederherstellen, einfach mal den Status abfragen
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
				}
			}, global_polling_secs * 1000 );
		}

		//Administratoren den Admin-Button
		//	zeigen
		function adminButtons(){
			//Beschriftungen
			$( "div.logout span.usertools" ).tooltip();

			if( systemOfflineMode ){
				//keine Serverdialoge möglich!
				$( "div.logout span.usertools span.ui-icon-wrench" ).addClass( "disable" );
				$( "div.logout span.usertools span.ui-icon-person" ).addClass( "disable" );
			}
			else{
				//Admin?
				if( userinformation.admin ){
					//Systemadministration zeigen
					$( "div.logout span.usertools span.ui-icon-wrench" ).removeClass( "disable" );

					//Auf Click hoeren
					$( "div.logout span.usertools span.ui-icon-wrench" ).unbind('click').click( function() {
						$.ajax({
							type: "GET",
							url: domain + "/load/backend."+ jsdevmin +".js",
							success: function(){
								//AdminDialog öffnen
								adminDialog();
							},
							dataType: "script",
							cache: true
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
		}

		display_and_listen();
		keepSessionAlive();
		adminButtons();
	}
}
