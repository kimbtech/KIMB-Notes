/*************************************************/
// KIMB-Notes
// Copyright (c) 2017 by KIMB-technologies
// https://github.com/kimbtech/KIMB-Notes/
/*************************************************/
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License version 3
// published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.
/*************************************************/
// http://www.gnu.org/licenses/gpl-3.0
// http://www.gnu.org/licenses/gpl-3.0.txt
/*************************************************/

/**
 * Funktion zum Anzeigen des Administrationsdialog
 */
function adminDialog(){

	/**
	 * jQuery-UI Dialog laden
	 */
	function init(){
		$("body").append( '<div id="mainAdminDialog"></div>' );
		$("div#mainAdminDialog").dialog({
			modal : true,
			title : "Notes - Administration",
			close: function( event, ui ) {
				$("div#mainAdminDialog").remove();
			}, 
			position :{
				my: "center", at: "center", of: $("div.main")
			},
			resizable : false,
			width : $("div.main").width(),
			height: 500
		});
		setContent( 'Loading ...' );	
	}
	init();

	/**
	 * Inhalt des Dialog definieren
	 */
	function setContent( html ){
		$("div#mainAdminDialog").html( html );
	}

	/**
	 * Dialog mit Leben fullen
	 * (Liste aller User)
	 */
	function mainView(){
		var salt;
		//AJAX Anfrage
		ajax_request( 'admin', { userid : userinformation.id, art : 'list'  }, function( data ){
			if( data.status === "okay" ){
				//Salt merken
				salt = data.data.salt;

				var html = "<h3>Userliste</h3>"
					+ "<table> <tr><th>UserId</th><th>Username</th><th>Admin</th><th>Löschen</th> </tr>";
				//Array der User durchgehen
				data.data.list.forEach( function( value ){
					html += '<tr userid="' + value.userid + '" class="'+(value.userid == userinformation.id ? 'important' : '')+'">'
						+ "<td>" + value.userid.substr( 0, 20 ) + "</td>"
						+ "<td>" + value.username + "</td>"
						+ '<td><code style="color:black;">' + value.admin + "</code></td>"
						+ '<td><button class="delUser">Löschen</button></td>'
						+ "</tr>";
				});
				html += "</table>";

				//User hinzufuegen
				html += "<h3>Hinzufügen</h3>"
					+ '<input type="text" id="newUserName" placeholder="Username"><br />'
					+ 'Admin: <input type="radio" id="newUserAdmin" name="newUserAdmin" value="true"> true '
						+ '<input type="radio" id="newUserAdmin" name="newUserAdmin" value="false" checked="checked"> false <br />'
					+ '<input type="password" id="newUserPasswordA" placeholder="Passwort"><br />'
					+ '<input type="password" id="newUserPasswordB" placeholder="Passwort"><br />'
					+ '<button id="newUserButton">Erstellen</button>'

				setContent( html );

				//Listenenr Add
				$( "button#newUserButton" ).click(function(){
					//Felder geflüllt
					if(
						$( "input#newUserPasswordA" ).val() == ""
						||
						$( "input#newUserName" ).val() == ""
					){
						alert( 'Sie müssen alle Felder füllen!' );
						return;
					}

					var username = $( "input#newUserName" ).val();
					var match = /[^a-z]+/;
					//Name okay?
					if( match.test( username ) ){
						alert( 'Der Usernamen darf nur aus Kleinbuchstaben bestehen!' );
						return;
					}

					//Passwörter okay?
					if( $( "input#newUserPasswordA" ).val() != $( "input#newUserPasswordB" ).val() ){
						alert( 'Die Passwörter stimmen nicht überein!' );
						return;
					}

					//Passwort Hash erzeugen
					var password = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( $( "input#newUserPasswordA" ).val() ) );
					password = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( password + "+" + salt ) );

					//Daten fuer POST erzeugen
					var userdata = {
						name : $( "input#newUserName" ).val(),
						admin : ( $("input#newUserAdmin:checked").val() == 'true' ? true : false ),
						password : password,
						salt : salt
					};
					
					//Request
					ajax_request( 'admin', { userid : userinformation.id, art : 'add', user : userdata  }, function( data ){
						//okay?
						if( data.data.done == true ){
							//Liste neu laden
							mainView();
						}
					});
				});

				//Listener Del
				$( "button.delUser" ).click(function(){
					//UserID holen
					var userId = $( this ).parent().parent().attr('userid');

					//Noch einmale fragen
					if( confirm( "Wollen Sie den User mit der ID: '"+ userId +"' wirklich löschen?" ) ){
						//Sich selbst löschen?
						if( userId == userinformation.id ){
							if( !confirm( "Sie löschen Ihren eigenen Account!! (Achten Sie darauf, dass immer ein Administrator bestehen bleibt!)" ) ){
								return;
							}
						}

						//Löschen AJAX
						ajax_request( 'admin', { userid : userinformation.id, art : 'del', deluserid : userId  }, function( data ){
							//okay?
							if( data.data.done == true ){
								//Liste neu laden
								mainView();
							}
						});
					}

				});
			}
			else{
				setContent( "Fehler!" );
			}
		});
	}
	mainView();

}