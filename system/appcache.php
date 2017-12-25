<?php
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

//System laden
//	Korrekt so!
define("Notestool", "OKAY");
//	Type Header
header('Content-Type: text/cache-manifest; charset=utf-8');
//	Fehler aus
error_reporting( 0 );

//Systembibilothek laden
require_once( __DIR__ . '/php/systemInit.php' );
//Domain holen
$domain = SystemInit::get( 'domain' );
//JSdivmin
$jsdevmin = SystemInit::get( 'JSdevmin' );

$versnum = json_encode( SystemInit::SYSTEMVERSION );

echo "CACHE MANIFEST"."\r\n";
echo "# Version ".$versnum."\r\n";
if( $jsdevmin == 'dev' ){
	// Weiterer Versionscode für JS dev
	foreach( scandir( __DIR__ . '/load/devjs/' ) as $fona ){
		if( $fona != '.' && $fona != '..' && is_file( __DIR__ . '/load/devjs/'. $fona ) ){
			echo "# ". $fona ." ".filemtime( __DIR__ . '/load/devjs/'. $fona )."\r\n";
		}
	}
}
echo "\r\n";
echo "CACHE:"."\r\n";
echo $domain."/index.php"."\r\n";
echo $domain."/favicon.ico"."\r\n";
echo $domain."/notes.png"."\r\n";
echo $domain."/load/js-libs/qrcode.min.js"."\r\n";
echo $domain."/load/js-libs/sjcl.min.js"."\r\n";
echo $domain."/load/js-libs/jquery.min.js"."\r\n";
echo $domain."/load/js-libs/jquery-ui.min.js"."\r\n";
echo $domain."/load/js-libs/jquery-ui.min.css"."\r\n";
foreach( scandir( __DIR__ . '/load/js-libs/images/' ) as $fona ){
	if( $fona != '.' && $fona != '..' && is_file( __DIR__ . '/load/js-libs/images/'. $fona ) ){
		echo $domain."/load/js-libs/images/".$fona."\r\n";
	}
}
echo $domain."/load/js-libs/fonts.css"."\r\n";
foreach( scandir( __DIR__ . '/load/js-libs/fonts/' ) as $fona ){
	if( $fona != '.' && $fona != '..' && is_file( __DIR__ . '/load/js-libs/fonts/'. $fona ) ){
		echo $domain."/load/js-libs/fonts/".$fona."\r\n";
	}
}
echo $domain."/load/marked.min.js"."\r\n";
echo $domain."/load/codemirror/codemirror.css"."\r\n";
echo $domain."/load/codemirror/codemirror.js"."\r\n";
echo $domain."/load/codemirror/overlay.js"."\r\n";
echo $domain."/load/codemirror/xml.js"."\r\n";
echo $domain."/load/codemirror/markdown.js"."\r\n";
echo $domain."/load/codemirror/gfm.js"."\r\n";
echo $domain."/load/codemirror/javascript.js"."\r\n";
echo $domain."/load/codemirror/css.js"."\r\n";
echo $domain."/load/codemirror/htmlmixed.js"."\r\n";
echo $domain."/load/codemirror/clike.js"."\r\n";
echo $domain."/load/codemirror/meta.js"."\r\n";
echo $domain."/load/katex/katex.min.css"."\r\n";
echo $domain."/load/katex/katex.min.js"."\r\n";
foreach( scandir( __DIR__ . '/load/katex/fonts/' ) as $fona ){
	if( $fona != '.' && $fona != '..' && is_file( __DIR__ . '/load/katex/fonts/'. $fona ) ){
		echo $domain."/load/katex/fonts/".$fona."\r\n";
	}
}
echo $domain."/load/prism/prism.css"."\r\n";
echo $domain."/load/prism/prism.js"."\r\n";
echo $domain."/load/notes.min.css"."\r\n";
echo $domain."/load/notes.min.js"."\r\n";
echo $domain."/load/backend.min.js"."\r\n";
if( $jsdevmin == 'dev' ){
	echo $domain."/load/notes.dev.css"."\r\n";
	echo $domain."/load/notes.dev.js"."\r\n";
	echo $domain."/load/devjs/cla_offlinemanager.js"."\r\n";
	echo $domain."/load/devjs/globals.js"."\r\n";
	echo $domain."/load/devjs/fun_loginsys.js"."\r\n";
	echo $domain."/load/devjs/fun_list.js"."\r\n";
	echo $domain."/load/devjs/fun_maker.js"."\r\n";
	echo $domain."/load/devjs/fun_authCodeManager.js"."\r\n";
	echo $domain."/load/devjs/fun_oldNotesManager.js"."\r\n";
	echo $domain."/load/devjs/fun_shareviewer.js"."\r\n";
	echo $domain."/load/backend.dev.js"."\r\n";
}
echo $domain."/load/notes_bg_sw.png"."\r\n";
echo $domain."/load/loader.gif"."\r\n";
echo $domain."/load/markdownsupport.html"."\r\n";

echo "\r\n";
echo "NETWORK:"."\r\n";
echo $domain."/ajax.php"."\r\n";
echo $domain."/rest.php"."\r\n";
?>