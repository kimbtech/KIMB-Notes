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
			},
			position: {
				my: "center", at: "center", of: $("div.main")
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
			+ '<div class="loading disable" id="authLinkLoading"></div>';
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
					+ '<td><button class="deleteAuthLink" linkid="' + value.id + '" codeteil="' + value.code +'">Link Löschen</button></td>'
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
			var codeteil = $( this ).attr( 'codeteil' );

			if( confirm( 'Wollen sie den Code "'+ codeteil +'" wirklich löschen? ') ){
				$("div#authLinkLoading").removeClass("disable");
				ajax_request("account", { userid: userinformation.id, art: 'del', id: codeid },
					function (data) {
						$("div#authLinkLoading").addClass("disable");
						if (data.status === 'okay') {
							fillDialog();
						}
						else {
							alert('Konnte den Code nicht löschen!');
						}
					});
			}
		});

		//Hinzufügen von Authcodes
		$( "button#addAuthLink" ).click( function () {
			$("div#authLinkLoading").removeClass("disable");
			ajax_request("account", { userid: userinformation.id, art: 'new', id: 'new' },
				function (data) {
					$("div#authLinkLoading").addClass("disable");
					if (data.status === 'okay') {
						showNewCode( data.data );
						fillDialog();
					}
					else {
						alert('Konnte keinen Code erstellen!');
					}
				});

			//Dialog mit neuem Code
			function showNewCode( code ){
				var authlink = domain + '/#' + userinformation.name + ':' + code;
				var html = '<p><b>Neuer Authentifizierungslink wurde erstellt:</b></p>'
					+ '<p><b>Code:</b> <code style="color:black;">' + code + '</code></p>'
					+ '<p><b>URL:</b> <input type="text" value="' + authlink +'" readonly="readonly" style="width:90%;"></p>'
					+ '<p><b>Link:</b> <a href="' + authlink +'" target="_blank" style="color:lightblue;">Aufrufen</a></p>'
					+ '<p><center><div style="background-color:white; padding:15px; border-radius:5px;" id="authCodeManagerNewCodeDialogQR"></div></center></p>'
					+ '<p><em><u>Achtung:</u> Dieser Link und Code wird nur ein einziges Mal angezeigt!!</em></p>';
				//HTML
				$("body").append('<div id="authCodeManagerNewCodeDialog">'+ html +'</div>');
				//Dialog
				$("div#authCodeManagerNewCodeDialog").dialog({
					resizable: false,
					height: "auto",
					width: "auto",
					modal: true,
					title: 'Neuer Authentifizierungslink',
					close: function () {
						$(this).remove();
					},
					position: {
						my: "center", at: "center", of: $("div.main")
					}
				});
				//QR-Code
				new QRCode(
					document.getElementById( "authCodeManagerNewCodeDialogQR" ),
					authlink
				)
			}
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
	function fillDialog(){
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
	fillDialog();

}