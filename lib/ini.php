<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

ini_set('html_errors', 0);
set_time_limit(1200);
ini_set('display_errors', 0);

define('APPHOME', dirname(__DIR__) . '/');
define('AE_LANG', 'ja');
require '../../appespresso/lib/Ae/autoload.php';

spl_autoload_register(function ($class) {
	$prefix = 'Conecmo\\';
	$len = strlen($prefix);
	if (strncmp($prefix, $class, $len) !== 0) {
		return;
	}
	$f = __DIR__ . '/' . str_replace('\\', '/', $class) . '.php';
	if (file_exists($f)) {
		require $f;
	}
});

if (\Conecmo\Env::LOGFILE) {
    ini_set('log_errors', 1);
    ini_set('error_log', \Conecmo\Env::LOGFILE);
}
