//Noteslist
function list(){
	//Liste zeigen
	review( "noteslist" );

	//jetzt korrekt eingeloggt
	systemOfflineManager.pushToServer();

	//Eine bestimmte Notiz zuletzt geöffnet, dann zu dieser zurückkehren
	if( localStorage.getItem( "note_maker_reopen" ) != null && localStorage.getItem( "note_maker_reopen" ) != 'none' ){
		var lastopend = JSON.parse( localStorage.getItem( "note_maker_reopen" ) );
		maker( lastopend.noteid, lastopend.name );
	}
	

	//machen
	get_userdata();

	//Userdaten holen 
	//	alle Notizen
	function get_userdata(){
		if( systemOfflineMode ){
			errorfallback();
		}
		else{
			$( "div.noteslist div.listpart div.loading" ).removeClass( "disable" );
			ajax_request( "list",
				{"userid" : userinformation.id},
				function ( data ) {
					$( "div.noteslist div.listpart div.loading" ).addClass( "disable" );
					if( data.status === 'okay' ){
						localStorage.setItem( "note_list_notes", JSON.stringify( data.data ) );
						showlist( data.data );
					}
					else{
						errorfallback();
					}
				},
				errorfallback
			);
		}

		//wenn keiner Serveranfrage möglich, versuche Liste aus localStorage zu beziehen
		function errorfallback(){
			$( "div.noteslist div.listpart div.loading" ).addClass( "disable" );
			if( localStorage.getItem( "note_list_notes" ) != null ){
				showlist( JSON.parse( localStorage.getItem( "note_list_notes" ) ) );
			}
		}
	}

	//Liste mit allen Notizen zeigen
	function showlist( notes ){

		if( systemOfflineMode ){
			$( "div.toolbar" ).addClass("disable");
		}
		else{
			$( "div.toolbar" ).removeClass("disable");

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
		}

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

		//Resize JS UI Helper
		function list_resize_ui_helper() {
			$( "div.noteslist div.listpart div.list ul li span.notesnames" ).css({ "display" : "inline-block", "cursor" : "pointer", "width" :
				( $("div.noteslist div.listpart div.list ul li").width() - $("div.noteslist div.listpart div.list ul li span.noteseditbuttons").width() - 5 ) + "px"
			});

			var notesarchive = $("button#notesarchive").width();
			var toolbar = $("div.toolbar").width();
			var newnote = $("input#newnotename").width() + $("button#newnote").width() + 36;

			if( toolbar - ( notesarchive + newnote ) < 10 ){
				$("button#notesarchive").css("float", "none");
				$("div.toolbar").css("line-height", "28px" );
			}
			else{
				$("button#notesarchive").css("float", "right");
				$("div.toolbar").css("line-height", "inherit" );
			}
		}
		// hefte resize an
		if( list_first_load ){
			$( window ).resize( list_resize_ui_helper );
			//nicht mehr der erste Durchgang
			list_first_load = false;
		}
		//einmal aufrufen
		list_resize_ui_helper();

		//Listener
		//	Open
		$( "div.noteslist div.listpart div.list ul li span.notesnames" ).unbind('click').click(function(){
			var noteid = $( this ).parent().attr( "noteid" );
			var name = $( this ).text();
			//Notiz zeigen
			console.log( 'Oeffne: "'+ name + '" ("' + noteid + '")' );
			maker( noteid, name );
		});

		if( systemOfflineMode ){
			$( "span.noteseditbuttons" ).addClass("disable");
		}
		else{
			$( "span.noteseditbuttons" ).removeClass("disable");
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

//das erste mal, dass list() aufgerufen wird
var list_first_load = true;