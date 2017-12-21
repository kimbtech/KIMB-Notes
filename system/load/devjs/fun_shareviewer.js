/**
 * Laden einer Freigabe unter Angabe des Freigabecodes
 * @param {String} authcode Authcode der Freigabe
 * @param {function} errorcallback (optional) wird bei Fehler aufgerufen
 */
function shareviewer( authcode, errorcallback ) {
	//Nachricht abrufen
	ajax_request( 'share', { "authcode" : authcode },
		function (data){
			if( data.status === "okay" ){
				//Aufrufen
				if( data.data.edit ){
					maker(
						data.data.id,
						data.data.name,
						data.data.content,
						function ( newcont, close ){
							$( "div.noteview div.loading" ).removeClass( "disable" );
							//neuen Inhalt sichern
							ajax_request( 'share', { "authcode" : authcode, "cont" : newcont },
								function (data){
									$( "div.noteview div.loading" ).addClass( "disable" );

									if( data.status === "okay" ){
										
									}
									else{
										errorMessage( "Konnten Notiz nicht speichern!" );
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
										//neues Login
										window.location.hash = "";
										loginsys();
									}
								}
							}
						}
					);
				}
				else{
					maker(
						data.data.id,
						data.data.name,
						{
							content : data.data.content,
							lastchanged : data.data.geaendert
						}
					);
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

	//Fehlercallback
	function shareerror(){
		if( typeof errorcallback === "function" ){
			errorcallback();
		}
	}
}