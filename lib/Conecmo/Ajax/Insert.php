<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Insert extends Base
{

    protected function output()
    {
        $p = $this->post;
        $tid = (int) $p->get('table');
        $this->openDb($tid);

        $dbc = \Conecmo\Env::db();
        $db = \Ae\Db::of($dbc);
        $db->open();
        $cdho = new \Conecmo\Dho($db, 'editing');

        $editing_id = (int) $p->get('editing_id');
        $ticket = $p->get('ticket');
        $record = \json_decode($p->get('data'), true);
        $column_types = \json_decode($p->get('column_types'), true);

        $pk_val_str = $cdho->ticket($editing_id, $ticket);
        if ($pk_val_str === false) {
            throw new \Conecmo\Exception(['System' => 'TICKET_INSERT']);
        }

        $param = new \Ae\Db\SqlParam($this->table);
        $param->values = [];
        foreach ($record as $rk => $rv) {
            $val = new \Ae\Db\SqlValue($rv);
            $val->type = $this->db->paramType($column_types[$rk]);
            $param->values[$rk] = $val;
        }
        $adho = new \Ae\Db\Dho($this->db);
        $adho->insert($param, false);
        $cdho->finish($editing_id, $ticket);
        $cdho->notifyChange($tid, $pk_val_str, 'I');
        $j = [
            'state' => 'ok',
        ];
        return \json_encode($j);
    }

}
