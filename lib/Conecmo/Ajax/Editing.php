<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Editing extends Base
{

    protected function output()
    {
        $p = $this->post;
        $tid = (int) $p->get('table');
        $this->permitsTable($tid);
        $pk_val_str = $p->get('pk_val_str');
        $save_data = $p->get('save_data');
        $dbid = \Ae\Utl::get($this->cfg->tableDb[$tid]);
        if (!$dbid) {
            throw new \Conecmo\Exception(
            ['System' => 'NO_TABLE_DEFINITION', $tid, ' tableDb']);
        }
        $dbc = \Conecmo\Env::db();
        $db = \Ae\Db::of($dbc);
        $db->open();
        $d = new \Conecmo\Dho($db, 'editing');
        $ret = $d->edit($dbid, $tid, $pk_val_str,
                $_SESSION[\Ae\Login::SESSION_ID], $save_data);
        $j = [
            'state' => 'ok',
            'id' => $ret[0],
            'ticket' => $ret[1],
        ];
        return \json_encode($j);
    }

}
