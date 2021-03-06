<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Delete extends Base
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
        $pk_col_json = $p->get('pk_col');
        $column_types = \json_decode($p->get('column_types'), true);

        $pk_val_str = $cdho->ticket($editing_id, $ticket);
        if ($pk_val_str === false) {
            throw new \Conecmo\Exception(['System' => 'TICKET_DELETE']);
        }
        $pk_val_arr = \explode(\Conecmo\Cst::DELIMITER, $pk_val_str);
        $pk_col_arr = \json_decode($pk_col_json);
        if (\count($pk_val_arr) != \count($pk_col_arr)) {
            throw new \Conecmo\Exception(['System' => 'DELETE_PKEY']);
        }

        $param = new \Ae\Db\SqlParam($this->table);
        $i = 0;
        foreach ($pk_col_arr as $pk_col) {
            $param->where[] = $this->db->iqc($pk_col) . ' = ?';
            $val = new \Ae\Db\SqlValue($pk_val_arr[$i]);
            $val->type = $this->db->paramType($column_types[$pk_col]);
            $param->binds[] = $val;
            ++$i;
        }
        $adho = new \Ae\Db\Dho($this->db, $this->table);
        $n = $adho->delete($param);
        if ($n !== 1) {
            throw new \Conecmo\Exception(['System' => 'DELETE']);
        }
        $cdho->finish($editing_id, $ticket);
        $cdho->notifyChange($tid, $pk_val_str, 'D');
        $j = [
            'state' => 'ok',
        ];
        return \json_encode($j);
    }

}
