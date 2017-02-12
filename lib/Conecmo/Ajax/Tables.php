<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

/**
 * テーブルを列挙する。
 */
class Tables extends Base
{

    /** @var \Ae\Db\DbcBase[] openしたDBの保存 */
    private $dbStore = [];

    protected function output()
    {
        $r = [];
        foreach ($this->cfg->tables as $tid => $cap) {
            if (!$this->permitsTable($tid)) {
                continue;
            }
            $t = new \Conecmo\TableInfo;
            $t->db = \Ae\Utl::get($this->cfg->tableDb[$tid]);
            $t->name = \Ae\Utl::get($this->cfg->tableName[$tid]);
            $t->caption = $cap;
            $db = $this->getDb($t->db);
            $t->pKColArr = $db->pKeyColumns($t->name);
            $t->columns = $db->columnInfo($t->name);
            $r[$tid] = $t;
        }
        $j = [
            'state' => 'ok',
            'tables' => $r,
        ];
        return \json_encode($j);
    }

    /**
     * DBをopenする。すでに開いているDBはopenしない。
     *
     * @param int $db_id
     * @return \Ae\Db\DbcBase
     */
    private function getDb($db_id)
    {
        if (isset($this->dbStore[$db_id])) {
            return $this->dbStore[$db_id];
        }
        $dbc = \Ae\Utl::get($this->cfg->dbs[$db_id]);
        $db = \Ae\Db::of($dbc);
        $db->open();
        $this->dbStore[$db_id] = $db;
        return $db;
    }

}
