/**
 * Laden einer Freigabe unter Angabe des Freigabecodes
 * @param {String} authcode Authcode der Freigabe
 * @param {function} errorcallback (optional) wird bei Fehler aufgerufen
 */
function shareviewer( authcode, errorcallback ) {
	var sharepoll;
	var lastchanged = 0;
	var editable = false;

	function openShare(){
		//Nachricht abrufen
		ajax_request( 'share', { "authcode" : authcode },
			function (data){
				if( data.status === "okay" ){
					lastchanged = data.data.geandert;
					editable = data.data.edit;
					//Aufrufen
					if( data.data.edit ){
						maker(
							data.data.id,
							data.data.name,
							{
								content : data.data.content,
								lastchanged : data.data.geandert
							},
							function ( newcont, close ){
								$( "div.noteview div.loading" ).removeClass( "disable" );
								//neuen Inhalt sichern
								ajax_request( 'share', { "authcode" : authcode, "cont" : newcont },
									function (data){
										$( "div.noteview div.loading" ).addClass( "disable" );
										lastchanged = data.data[3];

										if( data.status === "okay" ){
											//jetzt wieder gespeichert
											$("span.notesaved").removeClass("disable");
											$("span.noteunsaved").addClass("disable");
										}
										else{
											errorMessage( "Konnte Notiz nicht speichern!" );
										}

										//Schließen
										doClose( !(data.status === "okay") );									
									},
									function (data){
										$( "div.noteview div.loading" ).addClass( "disable" );

										errorMessage( "Konnte Notiz nicht speichern!" );

										doClose( true );
									}
								);
								
								function doClose( error ){
									//Schließen
									if( close ){
										if( !error || confirm( "Konnte nicht Notiz speichern, trotzdem schließen?" ) ){
											clearInterval( sharepoll );
											//neues Login
											window.location.hash = "";
											loginsys();
										}
									}
								}
							}
						);
						checkForChanges();
					}
					else{
						maker(
							data.data.id,
							data.data.name,
							{
								content : data.data.content,
								lastchanged : data.data.geandert
							}
						);
						checkForChanges();
					}
				}
				else{
					errorMessage( "Nachricht lässt sich mittels Freigabelink nicht öffnen.", false );
					shareerror();
				}
			},
			function (data){
				shareerror();
			}
		);
	}
	openShare();

	//Fehlercallback
	function shareerror(){
		if( typeof errorcallback === "function" ){
			errorcallback();
		}
	}

	function checkForChanges(){
		sharepoll = setInterval( function(){	
			ajax_request( 'share', { "authcode" : authcode },
				function (data){
					if( data.status === 'error' ){
						//Fehler!
						errorMessage( 'Die Freigabe kann nichtmehr erreicht werden', false );
					}
					else{
						console.log( data.data.geandert - lastchanged, data.data.geandert, lastchanged )
						//Notiz auf dem Server aktueller als Zeitpunkt der letzten
						//	Synchronisierung?
						if( data.data.geandert - lastchanged > 5 ){
							clearInterval( sharepoll );
							if( editable ){
								confirmDialog("<p>Die Notiz ist auf dem Server verändert worden.<br>Wollen Sie die neue Version laden?</p><p class='small'>Dadurch können Ihre Änderungen verloren gehen!</p>", {
									"Ja": function () {
										//neu öffnen!
										openShare();
										$(this).dialog("close");
									},
									"Abbrechen": function () {
										$(this).dialog("close");
									}
								}, "Änderung auf Server");
							}
							else{
								//keine Änderungen, die verlogen gehen können,
								//	einfach neu laden!
								openShare();
							}
						}
					}
				}
			);
		}, global_polling_secs * 1000 );
	}
}