// Datei zur Erstellung eines Builds von KIMB-Notes
var fs = require('fs');

// alle .dev. zu .min.

{
	//JS
	var UglifyJS = require("uglify-js");

	[
		"./../system/load/backend",
		"./../system/load/notes",
	].forEach( function ( file ){
		var fileSrc = file + ".dev.js";
		var fileDest = file + ".min.js";
		var fileData = "";

		fs.readFile( fileSrc, 'utf8', function (err, filecont) {
			if( err ) {
				return console.log("Error on reading:" + fileSrc);
			}
		
			fileData += UglifyJS.minify( filecont );

			fs.writeFile( fileDest, fileData, function(err) {
				if(err) {
					console.log( "Error writing: " + fileDest  );
				}
			});
		});
	});
}


// JSONs unter /system/data/ anpassen