<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Record extends Base
{

    protected function output()
    {
        $p = $this->post;
        $tid = (int) $p->get('table');
        $this->openDb($tid);
        $d = new \Ae\Db\Dho($this->db);
        $param = new \Ae\Db\SqlParam($this->table);
        $param->binds = $this->binds($p);
        $param->where = $this->where($p);
        $r = $d->record($param);
        $a = [
            'state' => 'ok',
            'record' => $r,
        ];
        return $this->json($a);
    }

    private function where($p)
    {
        $o = $p->get('order');
        $o = \json_decode($o);
        foreach ($o as &$v) {
            $v = $this->db->iqc($v) . ' = ?';
        }
        return \implode(' AND ', $o);
    }

    private function binds($p)
    {
        $o = $p->get('pk_val_str');
        $a = \explode(\Conecmo\Cst::DELIMITER, $o);
        $b = [];
        foreach ($a as $v) {
            $b[] = new \Ae\Db\SqlValue($v);
        }
        return $b;
    }

    private function json($a)
    {
        $j = \json_encode($a,
                \JSON_UNESCAPED_UNICODE |
                \JSON_PARTIAL_OUTPUT_ON_ERROR);
        if ($j === false) {
            $error = \json_last_error();
            throw new \Conecmo\Exception(['System' => 'JSON_ENCODE'], $error);
        }
        return $j;
    }

}
