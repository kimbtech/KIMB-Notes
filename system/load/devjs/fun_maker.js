var cm_editor;

//Notesmaker
function maker(noteid, notename, sharecont, savecallback) {
	//sharecont enthält Freigabeinhalt, wenn Freigabe geladen werden soll
	//savecallback ist Funktion um veränderungen des Shares zu speichern

	//	Erstelle zwei Variablen, die Zustand darstellen
	if (typeof sharecont === "undefined") {
		var share = false;
		var shareeditable = false;

		//diese Notiz als geöffnete speichern
		localStorage.setItem("note_maker_reopen", JSON.stringify({ noteid: noteid, name: notename }));
	}
	else {
		if (typeof savecallback === "function") {
			var shareeditable = true;
		}
		else {
			var shareeditable = false;
		}
		var share = true;
	}

	//Notiz zeigen
	review("noteview");

	//Notiz holen
	var notedata;
	//SHA256 des Inhaltes der Notiz
	var noteconthash;
	//Besteht die Gefahr, dass die Notiz auf dem Server ueberschrieben
	//	wird?
	//		(zB: wenn Server nicht antwortet, aber noch eine Nachricht im localStorage)
	var noteOverrideDanger = false;
	function get_notedata() {

		//Daten ohne Server aus localStorage oder Vorgabe nehmen
		// empty => Ist der Server leer?
		function getDataWithoutServer(empty, geandert) {
			//Datei konnte nicht synchroniesert werden, hätte aber klappen müssen
			if ( !empty && !systemOfflineMode ) {
				//Gefahr merken
				noteOverrideDanger = true;
				//Meldung
				errorMessage('Kann die aktuelle Version der Notiz nicht vom Server holen.', 20);
			}

			//erst in localStorage gucken
			if (localStorage.getItem("note_autosave_" + noteid) != null) {
				//localStorage
				notedata = JSON.parse(localStorage.getItem("note_autosave_" + noteid));

				//Eingabefeld
				make_inputfield();
			}
			else {
				//leer
				if( !systemOfflineMode ){
					//Fallback (Vorgabe)
					notedata = {
						"name": notename,
						"id": noteid,
						"content": "# " + notename + "\nUnd hier dann der Text!!\n",
						"lastserverchanged": (typeof geandert != "undefined") ? geandert : 0
					};

					//Eingabefeld
					make_inputfield();
				}
				else{
					//Offline nicht verfügbar
					confirmDialog('Die gewäöhlte Notiz ist auf diesem Gerät leider nicht offline verfügbar!',
						{ "OK" : function (){$(this).dialog("close");} },
						'Offlinemodus'
					);
					list();
				}
			}
		}

		if (share) {
			//Daten übernehmen
			notedata = {
				"name": notename,
				"id": noteid,
				"content": sharecont.content,
				"lastserverchanged": sharecont.lastchanged
			};

			//kein Ladebalken
			$("div.noteview div.loading").addClass("disable");

			//Eingabefeld
			make_inputfield();
		}
		else if( systemOfflineMode ){
			getDataWithoutServer(false);
		}
		else {
			$("div.noteview div.loading").removeClass("disable");
			ajax_request("view",
				{ "userid": userinformation.id, "noteid": noteid, "history": 2 },
				function (data) {
					$("div.noteview div.loading").addClass("disable");
					//Abfrage okay?
					if (data.status === 'okay') {
						//neue Notiz (dann Server noch leer)
						if (!data.data.empty) {

							//Daten übernehmen
							notedata = {
								"name": data.data.name,
								"id": data.data.id,
								"content": data.data.content,
								"lastserverchanged": data.data.geandert
							};

							//Eingabefeld
							make_inputfield();
						}
						else {
							getDataWithoutServer(true, data.data.geandert);
						}
					}
					else {
						getDataWithoutServer(false);
					}
				},
				function (data) {
					getDataWithoutServer(false);
				}
			);
		}
	}

	function removeCodeMirrorListeners(){
		//die EventListener weg machen
		//	Parser
		cm_editor.off("change", here_parser_reparse);
		//	Speicherung
		cm_editor.off("change", here_codemi_save);

		//keine Notiz mehr geöffnet
		newerNoteOnServerFound = function (){};
	}

	//Schließen Button (und Freigabe) nutzbar machen
	function closebutton() {
		$("button#closenote").unbind("click").click(function () {
			//schließen und speichern

			removeCodeMirrorListeners();

			if (share && shareeditable) {
				savecallback(cm_editor.getValue(), true);
			}
			else if (share) {
				//neues Login
				window.location.hash = "";
				loginsys();
			}
			else if (share === false) {
				//save (hier nur expliziet per AJAX)
				//	localStorage wird ja immer bei jeder Änderung gemacht
				ajaxsave(function (okay) {
					if (okay) {
						//zur Notizliste
						localStorage.setItem("note_maker_reopen", 'none');
						list();
					}
					else {
						//Fehlermeldung
						$("body").append('<div id="errorMessageNoteSave">Die Speicherung der Notiz auf dem Server schlug fehl!<br />Wollen Sie den Editor verlassen und einen Verlust der Änderungen in Kauf nehmen oder abbrechen?</div>');
						$("#errorMessageNoteSave").dialog({
							resizable: false,
							height: "auto",
							width: "auto",
							modal: true,
							title: 'Fehler beim Speichern!',
							buttons: {
								"Änderungen verwerfen": function () {
									localStorage.setItem("note_maker_reopen", 'none');
									list();
									$(this).dialog("close");
								},
								"Abbrechen": function () {
									$(this).dialog("close");
								}
							},
							close: function () {
								$(this).remove();
							}
						});
					}
				});
			}
		});

		if (share || systemOfflineMode ) {
			//Keine Freigabe und keinen Verlauf Button bei aufgerufener Freigabe,
			//	bzw. wenn offline
			$("button#publishnote").addClass('disable');
			$("button#notehistory").addClass('disable');
		}
		else {
			$("button#publishnote").removeClass('disable');
			$("button#notehistory").removeClass('disable');

			//Freigabe Manager laden
			$("button#publishnote").unbind('click').click(freigabeManager);

			//Verlaufs Manager laden
			$("button#notehistory").unbind('click').click(historyManager);
		}
	}
	// Die internen Funktionen, die per Event von CodeMirror aufgerufen werden,
	// müssen am Ende wieder aus dem Event (on...) weg.
	var here_parser_reparse, here_codemi_save;

	//Codemirror laden
	//Textarea und Notizname setzen
	function make_inputfield() {
		//Inhalt der Notiz am Anfang merken
		noteconthash = sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( notedata.content ) );
		//Notiz auch als JSON in localStorage
		localStorage.setItem("note_autosave_" + notedata.id, JSON.stringify(notedata));
		//Daten laden
		$("input#notename").val(notedata.name);
		$("textarea#notesinput").text(notedata.content);
		//CodeMirror schon geladen (von einer anden Notiz)?
		if (typeof cm_editor !== "object") {
			//Nein, dann neu laden
			cm_editor = CodeMirror.fromTextArea(document.getElementById("notesinput"), {
				mode: 'gfm',
				lineNumbers: true,
				theme: "default"
			});
		}
		else {
			//Ja, einfach Inhalt neu schreiben
			cm_editor.setValue($("textarea#notesinput").val());
		}

		//Parser soll immer Änderungen übernhemen
		//und darsetllen
		load_parser_preview();
		//Änderungen sollen in localStorage abgeleget werden und
		//auch regemläßig per AJAX auf Server
		autosave_changes();
	}
	//Parser aktivieren
	//bei jeder Änderung der Texte ausführen
	function load_parser_preview() {

		//Mit eigenem Renderer etwas am Markdown rumspielen
		var markRend = new marked.Renderer();
		//	Überschriften erst bei H3 beginnen
		markRend.heading = function (text, level) {
			//einfach Level + 2
			return '<h' + (level + 2) + '>' + text + '</h' + (level + 2) + '>';
		}
		//	Links sollen immer _blank sein!
		markRend.link = function (href, title, text) {
			return '<a href="' + href + '" title="' + title + '" target="_blank">' + text + '</a>';
		}

		//Markdown Parser init.
		marked.setOptions({
			renderer: markRend,
			gfm: true,
			tables: true,
			highlight: function (code, lang) {
				//Languages Prism supports
				var prismlanguages = ['markup', 'css', 'clike', 'javascript', 'c', 'bash', 'cpp', 'csharp', 'ruby', 'git', 'ini', 'java', 'json', 'lua', 'markdown', 'matlab', 'objectivec', 'perl', 'php', 'python', 'r', 'sql', 'swift'];

				//LaTex Support für Codeblocks mit LaTex als Sprache
				if (lang == 'tex') {
					try {
						return katex.renderToString(code);
					} catch (e) {
						return '<span style="color:red;">' + e.message + '</span>';
					}
				}
				//andere Sprachen mit Prism.js
				else if (prismlanguages.indexOf(lang) !== -1) {
					return Prism.highlight(code, Prism.languages[lang]);
				}
				else {
					return code;
				}
			}
		});

		//Funktion, um immer aktuellen Inhalt zu parsen
		function reparse(instance, change) {

			//Caps Lock Bug wokaround (dirty)
			//	see https://github.com/kimbtech/KIMB-Notes/issues/16

			//only for iOS
			var isSafariOrWebview = /(iPhone|iPod|iPad).*AppleWebKit/i.test(navigator.userAgent);

			//only after CodeMirror change
			if (isSafariOrWebview && typeof change !== "undefined") {
				if (
					change.text.length === 1
					&&
					(/^[A-Z]$/).test(change.text[0])
				) {
					var focused = $(':focus');
					focused.blur();
					focused.focus();
				}
			}

			$("div#notespreview").html(marked(cm_editor.getValue()));
		}
		//	einmal zu Beginn
		reparse();
		//Bei Freigabe ohne Bearbeitung Editor ausblenden
		if (share && !shareeditable) {
			$("div.input.box").addClass('disable');
		}
		else {
			//Editor sichtbar
			$("div.input.box").removeClass('disable');
			//	bei jeder Änderung Vorschau updaten
			cm_editor.on("change", reparse);
		}

		//	Funtktion für spätere Enfernung festhalten
		here_parser_reparse = reparse;
	}
	//Änderungen speichern
	var lastajaxsave = 0;
	function autosave_changes() {
		$("span.noteunsaved").tooltip();
		$("span.notesaved").tooltip();

		//Funktion fuer Speicherung
		function save() {
			//jetzt wieder per AJAX sichern?
			var newajaxsave = Date.now() - (30 * 1000) > lastajaxsave;
			//Datensatz erstellen
			var savedata = {
				"name": $("input#notename").val(),
				"id": notedata.id,
				"content": cm_editor.getValue(),
				"lastserverchanged": notedata.lastserverchanged
			};
			//als JSON in localStorage
			localStorage.setItem("note_autosave_" + notedata.id, JSON.stringify(savedata));

			//auch per ajax sichern (aber nicht allzu oft, alle 30sec)
			if (newajaxsave) {
				ajaxsave();
			}
			else{
				//jetzt nicht gespeichert
				$("span.noteunsaved").removeClass("disable");
				$("span.notesaved").addClass("disable");
			}
		}
		//			einmal zu Beginn					--- erstmal nichtmehr
		//			save();
		//bei jeder Änderung
		cm_editor.on("change", save);

		//	Funtktion für spätere Enfernung festhalten
		here_codemi_save = save;

		//Speichern aktiv mittles Button möglich
		$("span.noteunsaved").unbind('click').click( ajaxsave );
	}
	//Speicherung per AJAX durchführen
	function ajaxsave(callback) {
		//überhaupt Änderungen?
		if( noteconthash == sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( cm_editor.getValue() ) ) ){
			//Callback vorhnaden?
			if (typeof callback === "function") {
				callback(true);
			}
		}
		else{
			//Gefahr des Überschreibens?
			if (noteOverrideDanger) {
				//User darauf hinweisen

				$("body").append('<div id="dangerMessageNoteSave">Beim Speichern der Notiz kann es eventuell zu Datenverlust kommen, da die aktuellste Version nicht vom Server geladen werden konnte!</div>');
				$("#dangerMessageNoteSave").dialog({
					resizable: false,
					height: "auto",
					width: "auto",
					modal: true,
					title: 'Gefahr des Datenverlustes!',
					buttons: {
						"Trotzdem Speichern": function () {
							$(this).dialog("close");
							//jetzt keine Gefahr mehr
							noteOverrideDanger = false;
							//Speichern
							doSave();
						},
						"Erstmal nicht": function () {
							$(this).dialog("close");
						}
					},
					close: function () {
						$(this).remove();
					}
				});
			}
			else {
				//immer speichern!
				doSave();
			}

			//Die Speicherung ausführen
			function doSave() {
				if (share && shareeditable) {
					//Zeitpunkt merken
					lastajaxsave = Date.now();

					//als Freigabe sichern
					savecallback(cm_editor.getValue(), false);
				}
				else if (share === false) {
					if( systemOfflineMode ){
						//Änderunge merken, um später zu pushen
						systemOfflineManager.saveNote( noteid, cm_editor.getValue() );

						//Zeitpunkt merken
						lastajaxsave = Date.now();

						//Callback vorhnaden?
						if (typeof callback === "function") {
							callback( true );
						}
					}
					else{
						$("div.noteview div.loading").removeClass("disable");
						ajax_request("view",
							{ "userid": userinformation.id, "noteid": noteid, "note": { "name": $("input#notename").val(), "cont": cm_editor.getValue() } },
							function (data) {
								$("div.noteview div.loading").addClass("disable");
								if (
									data.status === 'okay'
								) {
									console.log('Notiz: "' + notename + '" ("' + noteid + '") auf Server gespeichert.');

									//Zeitpunkt merken
									lastajaxsave = Date.now();

									//nur bei Änderung sinnvoll
									if (data.data.length == 4) {
										//lastsync dieser Notiz anpassen
										notedata.lastserverchanged = data.data[3];
										//JSON in localStorage (lastserverch) updaten
										var newdat = JSON.parse(localStorage.getItem("note_autosave_" + noteid));
										newdat.lastserverchanged = data.data[3];
										localStorage.setItem("note_autosave_" + noteid, JSON.stringify(newdat));
									}

									//jetzt wieder gespeichert
									$("span.notesaved").removeClass("disable");
									$("span.noteunsaved").addClass("disable");
								}

								//Callback vorhnaden?
								if (typeof callback === "function") {
									callback((data.status === 'okay'));
								}
							},
							function (data) {
								//Callback vorhnaden?
								if (typeof callback === "function") {
									callback(false);
								}
							}
						);
					}
				}
			}
		}
	}

	//Daten holen
	// => dann automatisch Eingabefeld
	get_notedata();
	//Schließen Button funktionstüchtig machen
	closebutton();

	//Manager fuer das Freigeben von Notizen
	function freigabeManager() {
		function errorOnLoading() {
			errorMessage('Freigaben konnten nicht geladen werden.');
			$("div.noteview div.loading").addClass("disable");
		}

		//Loading Balken
		$("div.noteview div.loading").removeClass("disable");
		//Diff vom Server holen
		ajax_request("view",
			{ "userid": userinformation.id, "noteid": noteid },
			function (data) {
				if (data.status === 'okay') {
					//Dialog Inhalt bauen

					//	LISTE
					var html = '<div class="message error freigabeDialog disable">Konnte Aktion nicht durchführen.</div>'
						+ '<table><tr><th>Link</th><th>Name</th><th>Erstellt</th><th>Bearbeiten</th><th>Letzter Aufruf (Anzahl)</th><th>Löschen</th></tr>';
					var inhalt = false;
					$.each(data.data, function (k, v) {
						inhalt = true;
						html += '<tr><td><a href="' + domain + '/#' + v.authcode + '" target="_blank">Aufrufen</a> <button authcode="' + v.authcode + '" class="freigabeQR">QR-Code</button></td>';
						html += '<td>' + v.name + '</td>';
						html += '<td>' + v.created + '</td>';
						html += '<td><code style="color:black;">' + v.edit + '</code></td>';
						html += '<td>' + v.lastAccessed + ' (' + v.accesses + ')</td>';
						html += '<td><button authcode="' + v.authcode + '" class="deleteFreigabe">Löschen</button></td></tr>'
					});
					html += '</table>';
					if (inhalt === false) {
						html += '<p>Noch keine Freigaben!</p>';
					}

					//	NEU
					html += '<h3>Neue Freigabe</h3>'
						+ '<div class="loading freigabeDialog disable"></div>'
						+ '<input type="text" placeholder="Name" id="freigabeManagerNewName"><br />'
						+ '<input type="radio" id="freigabeManagerNewEdit" name="freigabeManagerNewEdit" value="true"> Bearbeiten erlauben '
						+ '<input type="radio" id="freigabeManagerNewEdit" name="freigabeManagerNewEdit" value="false" checked="checked"> Nur lesen <br />'
						+ '<button id="addFreigabe">Erstellen</button>';

					//an Seite anfügen
					$("body").append('<div id="freigabeManagerDialog">' + html + '</div>');
					//Ladebalken weg
					$("div.noteview div.loading").addClass("disable");
					//Dialog öffnen
					$("div#freigabeManagerDialog").dialog({
						resizable: false,
						height: "auto",
						width: "auto",
						modal: true,
						title: 'Freigaben',
						close: function () {
							$(this).remove();
						},
						position: {
							my: "center", at: "center", of: $("div.main")
						}
					});

					//Texte aus Verlauf laden
					$("button.deleteFreigabe").click(function () {
						var authcode = $(this).attr('authcode');

						$("div.freigabeDialog.loading").removeClass('disable');

						ajax_request("view",
							{ "userid": userinformation.id, "noteid": noteid, "share": { "authcode": authcode, "edit": "leer", "name": "leer" } },
							function (data) {
								if (data.status === 'okay') {
									$("div#freigabeManagerDialog").dialog('close');
									freigabeManager();
								}
								else {
									$("div.freigabeDialog.loading").addClass('disable');
									$("div.freigabeDialog.error").removeClass('disable');
								}
							});
					});

					//Neue Freigabe erstellen
					$("button#addFreigabe").click(function () {
						var name = $("input#freigabeManagerNewName").val();
						var edit = ($("input#freigabeManagerNewEdit:checked").val() == 'true' ? true : false);
						if (name == '') {
							return;
						}

						$("div.freigabeDialog.loading").removeClass('disable');

						ajax_request("view",
							{ "userid": userinformation.id, "noteid": noteid, "share": { "authcode": "leer", "edit": edit, "name": name } },
							function (data) {
								if (data.status === 'okay') {
									$("div#freigabeManagerDialog").dialog('close');
									freigabeManager();
								}
								else {
									$("div.freigabeDialog.loading").addClass('disable');
									$("div.freigabeDialog.error").removeClass('disable');
								}
							});
					});

					//Neue Freigabe erstellen
					$("button.freigabeQR").click(function () {
						var code = $(this).attr('authcode');
						var authlink = domain + '/#' + code;

						var html = '<p><b>Code:</b> <code style="color:black;">' + code + '</code></p>'
							+ '<p><b>URL:</b> <input type="text" value="' + authlink + '" readonly="readonly" style="width:90%;"></p>'
							+ '<p><b>Link:</b> <a href="' + authlink + '" target="_blank">Aufrufen</a></p>'
							+ '<p><center><div style="background-color:white; padding:15px; border-radius:5px;" id="freigabeManagerQR"></div></center></p>';
						//HTML
						$("body").append('<div id="freigabeManagerQRDialog">' + html + '</div>');
						//Dialog
						$("div#freigabeManagerQRDialog").dialog({
							resizable: false,
							height: "auto",
							width: "auto",
							modal: true,
							title: 'Freigabelink',
							close: function () {
								$(this).remove();
							},
							position: {
								my: "center", at: "center", of: $("div.main")
							}
						});
						//QR-Code
						new QRCode(
							document.getElementById("freigabeManagerQR"),
							authlink
						)
					});
				}
				else {
					errorOnLoading();
				}
			},
			errorOnLoading
		);
	}

	//Manager fuer Notizverläufe
	function historyManager() {
		function errorOnLoading() {
			errorMessage('Notizverlauf konnte nicht geladen werden.');
			$("div.noteview div.loading").addClass("disable");
		}

		//Loading Balken
		$("div.noteview div.loading").removeClass("disable");
		//Diff vom Server holen
		ajax_request("view",
			{ "userid": userinformation.id, "noteid": noteid, "history": 3 },
			function (data) {
				if (data.status === 'okay') {
					//Dialog Inhalt bauen
					var html = '<table><tr><th>Änderungen</th><th>Zeitpunkt</th></tr>';
					$.each(data.data, function (k, v) {
						html += '<tr><td>' + v.diff + '</td>';
						html += '<td>' + v.time + '<button key="' + k + '" class="takeInputFromHistory">Zurückkehren</button></td></tr>'
					});
					html += '</table>';
					//an Seite anfügen
					$("body").append('<div id="historyManagerDialog">' + html + '</div>');
					//Ladebalken weg
					$("div.noteview div.loading").addClass("disable");
					//Dialog öffnen
					$("div#historyManagerDialog").dialog({
						resizable: false,
						height: "auto",
						width: "auto",
						modal: true,
						title: 'Notizverlauf',
						close: function () {
							$(this).remove();
						},
						position: {
							my: "center", at: "center", of: $("div.main")
						}
					});

					//Texte aus Verlauf laden
					$("button.takeInputFromHistory").click(function () {
						var key = $(this).attr('key');
						var newtext = data.data[key]["text"];

						cm_editor.setValue(newtext);
						$("div#historyManagerDialog").dialog("close");

					});
				}
				else {
					errorOnLoading();
				}
			},
			errorOnLoading
		);
	}

	/**
	 * Notiz auf Server neuer als im Client, User befragen was zu tun.
	 * (nur wenn er die Notiz geändert hat!)
	 */
	newerNoteOnServerFound = function() {
		newerNoteOnServerFoundDialogOpen = true;
		//Keine Änderungen??
		if( noteconthash == sjcl.codec.hex.fromBits( sjcl.hash.sha256.hash( cm_editor.getValue() ) ) ){
			//neu öffnen
			removeCodeMirrorListeners();
			maker(noteid, notename);
		}
		else{
			noteOverrideDanger = true;
			confirmDialog("<p>Die Notiz ist auf dem Server verändert worden.<br>Wollen Sie die neue Version laden?</p><p class='small'>Dadurch können Ihre Änderungen verloren gehen! Andernfalls die Änderungen auf dem Server.</p>", {
				"Ja": function () {
					//neu öffnen!
					removeCodeMirrorListeners();
					maker(noteid, notename);
					newerNoteOnServerFoundDialogOpen = false;
					$(this).dialog("close");
				},
				"Nein": function () {
					//definitiv speichern
					noteOverrideDanger = false;
					ajaxsave();
					newerNoteOnServerFoundDialogOpen = false;
					$(this).dialog("close");
				}
			}, "Änderung auf Server");
		}
	}
	var newerNoteOnServerFoundDialogOpen = false;
}

//Placeholder for global Fuktion definiert in maker()
var newerNoteOnServerFound = function (){};