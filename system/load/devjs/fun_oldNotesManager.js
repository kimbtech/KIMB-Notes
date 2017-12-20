//Manager Dialog fuer das Wiederherstellen
//	von alten Notizen
function oldNotesManager(){
	//jQuery-UI Dialog erstellen
	function loadDialog(){
		//HTML
		$("body").append('<div id="oldNotesDialog"></div>');
		//Dialog
		$("div#oldNotesDialog").dialog({
			resizable: false,
			height: "auto",
			width: "auto",
			modal: true,
			title: 'Notizarchiv',
			close: function () {
				$(this).remove();
			},
			position: {
				my: "center", at: "center", of: $("div.main")
			}
		});
		setHTML( 'Lädt ...' );
	}

	//Inhalt setzen
	function setHTML( h ){
		h = '<div id="oldNotesDialogLoader" class="loading disable"></div>' + h;
		$("div#oldNotesDialog").html( h );
	}

	//Liste Notizen der laden
	function loadList(){
		$("div#oldNotesDialogLoader").removeClass( "disable" );
		ajax_request( 'list', { userid : userinformation.id, reload : 'none' },
			function (data){
				$("div#oldNotesDialogLoader").addClass("disable");
				if( data.status === "okay" ){
					//Tabelle erzeugen
					var html = '<table>'
						+ '<tr>'
						+ '<th>Name</th>'
						+ '<th>Zuletzt geändert</th>'
						+ '<th>Wiederherstellen</th>'
						+ '</tr>';
					//Reihen
					data.data.forEach( function ( value ) {
						html += '<tr>'
							+ '<td>'+ value.name +'</td>'
							+ '<td>'+ value.geaendert +'</td>'
							+ '<td><button class="oldNotesDialogReload" noteid="' + value.noteid +'">&#x21bb;</button></td>'
							+ '</tr>';
					});
					//Ende
					html += '</table>';

					//ausgeben
					setHTML( html );

					//Wiederherstellen Button
					$( "button.oldNotesDialogReload" ).click(function (){
						var noteid = $( this ).attr( 'noteid' );
						$("div#oldNotesDialogLoader").removeClass("disable");

						ajax_request('list', { userid: userinformation.id, reload: noteid },
							function (data) {
								$("div#oldNotesDialogLoader").addClass("disable");

								if ( data.status === "okay" ){
										//Liste der Notizen neu laden
										list();
										//Dialog schließen
										$( "div#oldNotesDialog" ).dialog("close");
									}
									else{
										alert( 'Konnte die Notiz nicht wiederherstellen!' );
									}
								});
					});
				}
				else{
					setHTML( 'Konnte nicht laden!!' );
				}
			}
		);
	}

	//onStartUp
	//	Dialog laden
	loadDialog();
	//	Liste laden
	loadList();

}