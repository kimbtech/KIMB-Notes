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