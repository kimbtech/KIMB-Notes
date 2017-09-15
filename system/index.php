<?php
error_reporting(0);
header('Content-Type: text/html; charset=utf-8');

/**
 * =============================================================
 * Webanalyse-Code
 * =============================================================
 */

//Systembibilothek laden
require_once( __DIR__ . '/php/systemInit.php' );
//Domain holen
$domain = SystemInit::get( 'domain' );
//JSdivmin
$jsdevmin = SystemInit::get( 'JSdevmin' );
?>
<!DOCTYPE html>
<html>
	<head>
		<title>5d7.eu - Notes</title>
		<link rel="shortcut icon" href="<?php echo $domain; ?>/favicon.ico" type="image/x-icon; charset=binary">
		<link rel="icon" href="<?php echo $domain; ?>/favicon.ico" type="image/x-icon; charset=binary">
		<link rel="apple-touch-icon" href="<?php echo $domain; ?>/notes.png">

		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<meta name="apple-mobile-web-app-title" content="5d7.eu - Notes">

		<meta charset="utf-8">
		<meta name="robots" content="none">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" type="text/css" href="//data.5d7.eu/fonts.css">
		<link rel="stylesheet" type="text/css" href="//data.5d7.eu/jquery-ui.min.css">		

		<script src="//data.5d7.eu/jquery.min.js"></script>
		<script src="//data.5d7.eu/jquery-ui.min.js"></script>

		<script src="//data.5d7.eu/sjcl.min.js"></script>
		<script src="//data.5d7.eu/qrcode.min.js"></script>

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

		<link rel="stylesheet" type="text/css" href="<?php echo $domain; ?>/load/notes.<?php echo $jsdevmin; ?>.css">
		<script src="<?php echo $domain; ?>/load/notes.<?php echo $jsdevmin; ?>.js"></script>
		<script>var domain = "<?php echo $domain; ?>", jsdevmin = "<?php echo $jsdevmin; ?>"; </script>
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
			<h1>5d7.eu - Notes</h1>

			<div class="global error message disable">
				Fehler!
			</div>

			<p class="message error loggedout disable">Logout erfolgreich!</p>
			<div class="login">
				<p class="message important">Sie müssen sich einloggen!</p>
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
					<span class="ui-icon ui-icon-person" title="Authentifizierungslinks verwalten sowie Passwort ändern"></span>
					<span class="ui-icon ui-icon-wrench disable" title="Administration des Systems"></span>
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
			<a href="https://about.5d7.eu" target="_blank">About, Datenschutz, Kontakt</a>
		</div>
	</body>
</html>
