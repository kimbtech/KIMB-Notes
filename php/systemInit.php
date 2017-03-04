<?php

class SystemInit{

	private static $config = array(
		'domain' => 'http://kimb-technologies.eu:8000',
		'JSdivmin' => 'dev'
	);


	public static function get( $key ){
		if( !empty(self::$config[$key]) ){
			return self::$config[$key];
		}
		else{
			return false;
		}
	}


}


?>