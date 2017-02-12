<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Read extends Base
{

    protected function output()
    {
        $p = $this->post;
        $tid = (int) $p->get('table');
        $this->openDb($tid);

        $pk_col_arr = \json_decode($p->get('pk_col'));
        $offset = $p->get('offset');

        $d = new \Ae\Db\Dho($this->db);

        $param = new \Ae\Db\SqlParam($this->table);
        $param->where = $p->get('where');
        $param->order = $this->order($p);
        $param->limit = $p->get('limit');
        $param->offset = $offset;
        $r = $d->records($param);

        $map = [];
        if (\count($pk_col_arr) == 1) {
            foreach ($r as $v) {
                $map[$v[$pk_col_arr[0]]] = $v;
            }
        } else {
            foreach ($r as $v) {
                $pk_val_str = $this->joinKeyValue($v, $pk_col_arr);
                $map[$pk_val_str] = $v;
            }
        }
        $j = [
            'state' => 'ok',
            'records' => $map,
        ];
        return \json_encode($j, \JSON_UNESCAPED_UNICODE);
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

    /**
     * 複数の主キーデータを結合
     *
     * @param mixed[] $record
     * @param string[] $pk_col_arr
     * @return string
     */
    private function joinKeyValue($record, $pk_col_arr)
    {
        $pk_val_str = '';
        $l = \count($pk_col_arr);
        for ($i = 0; $i < $l; ++$i) {
            if ($i) {
                $pk_val_str .= \Conecmo\Cst::DELIMITER;
            }
            $pk_val_str .= $record[$pk_col_arr[$i]];
        }
        return $pk_val_str;
    }

}
