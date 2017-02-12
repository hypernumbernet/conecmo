<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo;

/**
 * DB接続設定クラス
 */
class AppConf
{

    /** @var \Ae\Db\DbcBase[] DB接続先 */
    public $dbs;

    /** @var array table id をキーとしてDB接続先id */
    public $tableDb;

    /** @var array table id をキーとしてtableDB名 */
    public $tableName;

    /** @var array table id をキーとしてtable表示名 */
    public $tables;

    /** @var array form id をキーとしてform表示名 */
    public $forms;

}
