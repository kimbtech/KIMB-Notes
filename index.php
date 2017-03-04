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
$jsdivmin = SystemInit::get( 'JSdivmin' );
?>
<!DOCTYPE html>
<html>
	<head>
		<title>***REMOVED*** - Notes</title>
		<link rel="shortcut icon" href="<?php echo $domain; ?>/favicon.ico" type="image/x-icon; charset=binary">
		<link rel="icon" href="<?php echo $domain; ?>/favicon.ico" type="image/x-icon; charset=binary">
		<link rel="apple-touch-icon" href="<?php echo $domain; ?>/notes.png">

		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-status-bar-style" content="black">
		<meta name="apple-mobile-web-app-title" content="***REMOVED*** - Notes">

		<meta charset="utf-8">
		<meta name="robots" content="none">
		<meta name="viewport" content="width=device-width, initial-scale=1">

		<link rel="stylesheet" type="text/css" href="//data.***REMOVED***/fonts.css">
		<link rel="stylesheet" type="text/css" href="//data.***REMOVED***/jquery-ui.min.css">		

		<script src="//data.***REMOVED***/jquery.min.js"></script>
		<script src="//data.***REMOVED***/jquery-ui.min.js"></script>

		<script src="//data.***REMOVED***/sjcl.min.js"></script>

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

		<link rel="stylesheet" type="text/css" href="<?php echo $domain; ?>/load/notes.<?php echo $jsdivmin; ?>.css">
		<script src="<?php echo $domain; ?>/load/notes.<?php echo $jsdivmin; ?>.js"></script>
		<script>var domain = "<?php echo $domain; ?>"; </script>
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
			<h1>***REMOVED*** - Notes</h1>

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
			</div>

			<div class="noteview disable box">
				Notiz: <input type="text" readonly="readonly" id="notename">
				<button id="closenote">Schließen</button>
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
				</div>

				<div class="listpart">
					<div class="loading"></div>
					<div class="list"></div>
				</div>
			</div>		
		</div>
		<div class="footer small">
			<a href="https://about.***REMOVED***" target="_blank">About, Datenschutz, Kontakt</a>
		</div>
	</body>
</html>
