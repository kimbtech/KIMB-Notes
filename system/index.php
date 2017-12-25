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
header('Content-Type: text/html; charset=utf-8');
//	Session
session_name( "Notestool" );
session_start();
//	Fehler aus
error_reporting( 0 );

/**
 * =============================================================
 * Webanalyse-Code <<HERE>>
 * =============================================================
 */

//Systembibilothek laden
require_once( __DIR__ . '/php/systemInit.php' );
//Domain holen
$domain = SystemInit::get( 'domain' );
//JSdevmin
$jsdevmin = SystemInit::get( 'JSdevmin' );
//AppCache
$manifest = SystemInit::get( 'AppCache' ) ? ' manifest="'.$domain.'/appcache.php"' : '';

?>
<!DOCTYPE html>
<html<?php echo $manifest ?>>
	<head>
		<title>KIMB-Notes</title>
		<link rel="shortcut icon" href="<?php echo $domain; ?>/favicon.ico" type="image/x-icon; charset=binary">
		<link rel="icon" href="<?php echo $domain; ?>/favicon.ico" type="image/x-icon; charset=binary">
		<link rel="apple-touch-icon" href="<?php echo $domain; ?>/notes.png">

		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<meta name="apple-mobile-web-app-title" content="KIMB-Notes">

		<meta charset="utf-8">
		<meta name="robots" content="none">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" type="text/css" href="<?php echo $domain; ?>/load/js-libs/fonts.css">
		<link rel="stylesheet" type="text/css" href="<?php echo $domain; ?>/load/js-libs/jquery-ui.min.css">		

		<script src="<?php echo $domain; ?>/load/js-libs/jquery.min.js"></script>
		<script src="<?php echo $domain; ?>/load/js-libs/jquery-ui.min.js"></script>
		<script src="<?php echo $domain; ?>/load/js-libs/sjcl.min.js"></script>
		<script src="<?php echo $domain; ?>/load/js-libs/qrcode.min.js"></script>
		<script src="<?php echo $domain; ?>/load/marked.min.js"></script>	

		<link rel="stylesheet" href="<?php echo $domain; ?>/load/codemirror/codemirror.css">
		<script src="<?php echo $domain; ?>/load/codemirror/codemirror.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/overlay.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/xml.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/markdown.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/gfm.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/javascript.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/css.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/htmlmixed.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/clike.js"></script>
		<script src="<?php echo $domain; ?>/load/codemirror/meta.js"></script>

		<link rel="stylesheet" href="<?php echo $domain; ?>/load/katex/katex.min.css">
		<script src="<?php echo $domain; ?>/load/katex/katex.min.js"></script>

		<link rel="stylesheet" href="<?php echo $domain; ?>/load/prism/prism.css">
		<script src="<?php echo $domain; ?>/load/prism/prism.js"></script>

		<link rel="stylesheet" type="text/css" href="<?php echo $domain; ?>/load/notes.<?php echo $jsdevmin; ?>.css">
		<script>var domain = "<?php echo $domain; ?>", jsdevmin = "<?php echo $jsdevmin; ?>", global_polling_secs = <?php echo SystemInit::get( 'sysPoll' ); ?> </script>
		<script src="<?php echo $domain; ?>/load/notes.<?php echo $jsdevmin; ?>.js"></script>
	</head>
	<body>
<?php
	/**
	* =============================================================
	* Banner-Code
	* =============================================================
	*/
?>
		<div class="main">
			<h1>KIMB-Notes</h1>

			<div class="global error message disable">
				Fehler!
			</div>

			<div class="globalloader loading message disable">
			</div>

			<p class="message error loggedout disable">Logout erfolgreich!</p>
			<div class="login">
				<p class="message important online">Sie müssen sich einloggen!</p>
				<p class="message important offline">Sie können sich leider offline nicht einloggen!</p>
				<p class="message error disable">Login nicht erfolgreich!</p>
				<p class="message okay disable">Login erfolgreich!</p>
				<div class="input box">
					<div class="loading disable"></div>
					<div id="loginform">
						<input type="text" id="username" placeholder="Username"><br />
						<input type="password" id="userpassword" placeholder="Password"><br />
						<button id="userlogin">Login</button><br />
					</div>
				</div>
			</div>
			<div class="logout disable box">
				<button id="logout">Logout</button><br />
				<span class="small">
					<input type="checkbox" id="logouttype" checked="checked"> Inhalte im Browser behalten
				</span>
				<span class="usertools">
					<span class="ui-icon ui-icon-person ui-state-hover ui-corner-all" title="Authentifizierungslinks verwalten sowie Passwort ändern"></span>
					<span class="ui-icon ui-icon-wrench ui-state-hover ui-corner-all disable" title="Administration des Systems"></span>
				</span>
			</div>

			<div class="noteview disable box">
				Notiz: <input type="text" readonly="readonly" id="notename">
				<button id="closenote">Schließen</button>
				<button id="publishnote">Freigabe</button>
				<button id="notehistory">Verlauf</button>
				<div class="parsed box">
					<div class="loading"></div>

					<div id="notespreview">
					</div>
   
				</div>
				<div class="input box">
					<div class="loading"></div>

					<textarea id="notesinput">
					</textarea>
					<div style="height:0.8em;">
						<span style="float:left;">
							<span class="notesaved" title="Aktuelle Version auf dem Server gespeichert!">&#10004;</span>
							<span class="noteunsaved disable" title="Aktuelle Version nicht auf dem Server gespeichert! (Klicken zum abspeichern.)">&#10008;</span>
						</span>

<?php
						if( SystemInit::get('showMarkdownInfo') ){
							echo "\t\t\t\t\t\t".'<a href="'.$domain.'/load/markdownsupport.html" target="_blank" style="float:right;" class="small">Über Markdown</a>'."\r\n";
						}
?>
					</div>
				</div>
			</div>

			<div class="noteslist disable box">
				<div class="toolbar">
					<input type="text" id="newnotename" placeholder="Notizname">
					<button id="newnote">Neu</button>
					<button id="notesarchive">Notizarchiv</button>
				</div>

				<div class="listpart">
					<div class="loading"></div>
					<div class="list"></div>
				</div>
			</div>		
		</div>
		<div class="footer small">
			<a href="<?php echo SystemInit::get('impressumURL'); ?>" target="_blank"><?php echo SystemInit::get('impressumName'); ?></a>
		</div>
		<div class="globalDialog disable">
		</div>
	</body>
</html>
