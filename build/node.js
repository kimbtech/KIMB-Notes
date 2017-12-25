// Datei zur Erstellung eines Builds von KIMB-Notes
var fs = require('fs');

console.log( "===============================================================" );
console.log( "                    STARTE BUILD PROZESS                       " );
console.log( "---------------------------------------------------------------" );
console.log( "=> 1. Minify" );

// alle .dev. zu .min.

{
	//JS
	console.log( "===> 1.1 JavaScript" );
	var UglifyJS = require("uglify-es");

	[
		__dirname + "/../system/load/backend",
		__dirname + "/../system/load/notes"
	].forEach( function ( file ){
		var fileSrc = file + ".dev.js";
		var fileDest = file + ".min.js";
		var fileData = "";

		fs.readFile( fileSrc, 'utf8', function (err, filecont) {
			if( err ) {
				return console.log("Error on reading:" + fileSrc);
			}

			// mehrere Dateien bündeln?
			if( ( /\/\*[\r\n]{1,2}BUILD-NOTE:[\r\n]{1,2}(>>? (.*)[\r\n]{1,2})+\*\// ).test( filecont ) ){
				//nur die Hinweisgruppe
				var match = filecont.match( /\/\*[\r\n]{1,2}BUILD-NOTE:[\r\n]{1,2}(>>? (.*)[\r\n]{1,2})+\*\// )[0];
				//Zeilenumbrüche einheitlich machen
				match = match.replace('\r\n', '\n');
				match = match.replace('\r', '\n');
				match = match.split('\n');

				//Array für Inhalte beginnen
				var fileConts = [];

				match.forEach( function (line){
					if( line != '/*' && line != 'BUILD-NOTE:' && line != '*/' ){
						line = line.trim();

						var newcont = "";

						if( line.charAt(0) == '>' && line.charAt(1) != '>' ){
							newcont = line.substr( 1 ).trim();
						}
						else if( line.charAt(0) == '>' && line.charAt(1) == '>' ){
							var loadpath = file.substr(0, file.lastIndexOf('/') ) + '/' + line.substr( 2 ).trim();
							newcont = fs.readFileSync( loadpath, 'utf8' );
						}

						fileConts.push( newcont );
					}
				});
			}
			else{
				var fileConts = [ filecont ];
			}
		
			fileConts.forEach( function ( cont ) {
				fileData += UglifyJS.minify( cont ).code;
			});

			fs.writeFile( fileDest, fileData, function(err) {
				if(err) {
					return console.log( "Error writing: " + fileDest  );
				}
			});
		});
	});
}

{
	// CSS
	console.log( "===> 1.2 CSS" );
	var CleanCSS = require('clean-css');

	[
		__dirname + "/../system/load/notes"
	].forEach( function ( file ){
		var fileSrc = file + ".dev.css";
		var fileDest = file + ".min.css";
		var fileData = "";

		fs.readFile( fileSrc, 'utf8', function (err, filecont) {
			if( err ) {
				return console.log("Error on reading:" + fileSrc);
			}
			fileData = new CleanCSS({}).minify(filecont).styles;

			fs.writeFile( fileDest, fileData, function(err) {
				if(err) {
					return console.log( "Error writing: " + fileDest  );
				}
			});
		});
	});
}


// JSONs unter /system/data/ anpassen
{
	console.log( "=> 2. JSONs in data-Verzeichnis aufräumen" );

	var rootpath = __dirname + "/../system/data/";

	var needed = {
		'/config.example.json' : '<<untouched>>',
		'/config.json' : '[]',
		'/userlist.json' : '[]',
		'/notes/noteslist.json' : '[]',
		'/notes/sharecodes.json' : '[]',
		'/notes/shareslist.json' : '[]',
		'/user/userslist.json'  : '[]'
	};

	function readdir( path, relpath ){
		fs.readdirSync( path , 'uft8').forEach( function( file ){
			if( fs.lstatSync( path + "/" + file ).isDirectory() ){
				readdir( path + "/" + file, relpath + file + "/" );
			}
			else if( file.substr( file.length - 5 ) == '.json' ){
				if( typeof needed[relpath + file] === "string" ){
					if(  needed[relpath + file] != '<<untouched>>' ){
						fs.writeFileSync( path + "/" + file , needed[relpath + file], 'utf8' );
					}
				}
				else{
					fs.unlinkSync( path + "/" + file );
				}
			}
		});
	}
	readdir( rootpath, '/' );

}

console.log( "===============================================================" );