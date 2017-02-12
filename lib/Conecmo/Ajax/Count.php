<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Count extends Base
{

    protected function output()
    {
        $p = $this->post;
        $tid = (int) $p->get('table');
        $this->openDb($tid);
        $d = new \Ae\Db\Dho($this->db);
        $param = new \Ae\Db\SqlParam($this->table);
        $r = $d->count($param);
        $j = [
            'state' => 'ok',
            'count' => $r,
        ];
        return \json_encode($j);
    }

}
