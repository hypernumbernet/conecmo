<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo;

/**
 * テーブル情報クラス
 */
class TableInfo
{

    /** @var int  */
    public $db;

    /** @var string  */
    public $name;

    /** @var string  */
    public $caption;

    /** @var string[]  */
    public $pKColArr;

    /** @var object[]  */
    public $columns;

}
