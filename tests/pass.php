<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */
require '../lib/ini.php';

$dbpass = '';
if (isset($_POST['pass'])) {
    $dbpass = password_hash($_POST['pass'], PASSWORD_DEFAULT);
}
?>
<!DOCTYPE html>
<meta charset="utf-8">
<title>Pass Generator</title>
<h1>Pass Generator</h1>
<p>* Ae Framework ユーザー認証に使用するDB格納用暗号化文字列の生成を行います。</p>
<h2><?= $dbpass ?></h2>
<form action="" method="post">
    <p><input name="pass">
</form>
