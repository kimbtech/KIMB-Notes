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
			loginlocalstorage();
		}
	}
	check_share();

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
