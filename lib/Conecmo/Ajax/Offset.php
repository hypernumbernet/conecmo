<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Offset extends Base
{

    protected function output()
    {
        $p = $this->post;
        $tid = (int) $p->get('table');
        $this->openDb($tid);

        $pk_col_arr = \json_decode($p->get('pk_col'));
        $offset = $p->get('offset');

        $d = new \Ae\Db\Dho($this->db);
        $d->fetchStyle = \PDO::FETCH_NUM;

        $param = new \Ae\Db\SqlParam($this->table);
        $param->columns = $pk_col_arr;
        $param->where = $p->get('where');
        $param->order = $this->order($p);
        $param->limit = $p->get('limit');
        $param->offset = $offset;
        $r = $d->records($param);

        $map = [];
        if (\count($pk_col_arr) == 1) {
            foreach ($r as $v) {
                $map[$offset++] = (string) $v[0];
            }
        } else {
            foreach ($r as $v) {
                $map[$offset++] = \implode(\Conecmo\Cst::DELIMITER, $v);
            }
        }
        $j = [
            'state' => 'ok',
            'map' => $map,
        ];
        return \json_encode($j, \JSON_FORCE_OBJECT);
    }

    /**
     * @param \Ae\Db\SqlParam $p
     * @return \Ae\Db\SqlOrderBy[]
     */
    private function order($p)
    {
        $o = $p->get('order');
        $j = \json_decode($o);
        $r = [];
        foreach ($j as $v) {
            $r[] = new \Ae\Db\SqlOrderBy($v);
        }
        return $r;
    }

}
