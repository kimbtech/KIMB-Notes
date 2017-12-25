/**
 * Diese Klasse dient dazu die Änderungen, die Offline gemacht wurden zu verwalten
 * und bei Internetverbindung wieder hochzuladen.
 */
class OfflineManager{

	/**
	 * >> Konstruktor <<
	 * lädt Daten aus dem localStorage sofern verfügbar.
	 */
	constructor(){
		if( localStorage.getItem("notes_offline_storage") !== null ){
			this.data = JSON.parse( localStorage.getItem("notes_offline_storage") );
		}
		else{
			this.data = {};
		}
		this.status = null;
	}
	/*
	 * this.data: JSON mit [NoteID] : {Daten[]}
	 * this.status: Offline? bzw. null, wenn unbekannt
	 */

	/**
	 * Die Klasse über einen neuen Status informieren.
	 * @param {*} newstatus Ist das Tool offline?
	 */
	statusChanged( newstatus ){
		// Objekt noch neu => jetzt Status Online bekannt
		//	bzw. Offline => Online
		if(
			( this.status === true || this.status === null )
				&&
			!newstatus
		){
			this.pushToServer()
		}
		//neuen merken
		this.status = newstatus;
	}

	/**
	 * Über Änderungen an einer Notiz informieren.
	 * (tut nur was, wenn System offline ist)
	 * @param {String} id NoteID der Notiz
	 * @param {String} cont Neuer Inhalt
	 */
	saveNote( id, cont ){
		if( this.status ){
			this.data[id] = {
				content : cont
			};
			this.saveLocalStorage();
		}
	}

	/**
	 * >> PRIVATE <<
	 * Die internen Daten im localStorage ablegen.
	 */
	saveLocalStorage(){
		localStorage.setItem("notes_offline_storage", JSON.stringify( this.data ) );
	}

	/**
	 * Die Änderungen währen der Offline-Zeit hochladen.
	 */
	pushToServer(){
		//leer?
		if( JSON.stringify( this.data ) == "{}" ){
			this.data = {};
			this.saveLocalStorage();
		}
		else{
			//pushen!!!!

			console.log( "Pushe: " + JSON.stringify( this.data ) );
				/*
					this.data = {};
					saveLocalStorage();
				*/

		}
	}
}