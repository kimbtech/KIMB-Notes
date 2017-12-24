//Allgemein fuer Userid und Namen
var userinformation = { "name": null, "id": null, "admin" : false };
//Speicher fuer Timeout
var errorMessageTimeOut = null;

/**
 * Aktuellen DOM-Bereich sichtbar machen
 * @param review {String} Bereich (aus: login, noteview, noteslist, globalloader)
 */
function review( enabled ){
	//erstmal alles weg
	$( "div.login" ).addClass( "disable" );
	$( "div.noteview" ).addClass( "disable" );
	$( "div.noteslist" ).addClass( "disable" );
	$( "div.globalloader" ).addClass( "disable" );

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

/**
 * Dialog anzeigen
 * @param {String} cont Inhalt des Dialogs
 * @param {JSON} buttons (optional) Buttons auf dem Dilog {Name: Callback}
 * 						(im Callback $(this).dialog("close"); zum schließen)
 * @param {String} title (optional) Titel des Dialogs
 * @returns {function} Inhalt ändern (Parameter ist neuer Inhalt)
 */
function confirmDialog(cont, buttons, title){
	if( typeof buttons == "undefined" ){
		var buttons = {
			"OK" : function (){},
			"Abbrechen" : function (){}
		};
	}
	if( typeof title == "undefined" ){
		var title = "Wichtig!"
	}

	//Element anzeigen
	$("div.globalDialog").removeClass("disable");
	//Dialog erstellen
	$("div.globalDialog").dialog({
		resizable: false,
		height: "auto",
		width: "auto",
		minWidth: 200,
		minHeight: 150,
		modal: true,
		title: title,
		close: function () {
			$("div.globalDialog").html("");
			$("div.globalDialog").addClass("disable");
		},
		position: {
			my: "center", at: "center", of: $("div.main")
		},
		buttons : buttons
	});

	/**
	 * HTML Inhalt des Dialogs ändern
	 * @param {String} content neuer Inhalt
	 */
	function changeHTML( content ){
		$("div.globalDialog").html( content );
	}
	changeHTML(cont);

	return changeHTML;
}
