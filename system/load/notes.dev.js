/*
BUILD-NOTE:
> $(function(){loginsys()});
>> devjs/cla_offlinemanager.js
>> devjs/globals.js
>> devjs/fun_loginsys.js
>> devjs/fun_list.js
>> devjs/fun_maker.js
>> devjs/fun_authCodeManager.js
>> devjs/fun_oldNotesManager.js
>> devjs/fun_shareviewer.js
*/

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

//in der Dev-Phase ist die Seite auf mehrere JS-Dateien verteilt
//	alle Dateien werden zusammen hintereinaner in die notes.min.js überführt!
//	es gibt ein Skript dazu unter /build/
/*
	ganz oben muss
		//Onload
		$(function (){
			loginsys();
		});
	noch dazu !!!
*/

function loadJSFile(file, callback) {
	callback = callback || function () {};
	var filenode = document.createElement('script');
	filenode.src = file;
	filenode.onload = function () { callback(); };
	document.head.appendChild(filenode);
};
var requireFiles = function () {
	var i = 0;
	return function (f, c) {
		i += 1;
		loadJSFile(f[i - 1], cBC);
		function cBC() {
			if (i === f.length) { i = 0; c();
			} else { requireFiles(f, c); }
		};
	};
}();

requireFiles([
		domain + "/load/devjs/cla_offlinemanager.js",
		domain + "/load/devjs/globals.js",
		domain + "/load/devjs/fun_loginsys.js",
		domain + "/load/devjs/fun_list.js",
		domain + "/load/devjs/fun_maker.js",
		domain + "/load/devjs/fun_authCodeManager.js",
		domain + "/load/devjs/fun_oldNotesManager.js",
		domain + "/load/devjs/fun_shareviewer.js"
	], function(){
		loginsys();
});