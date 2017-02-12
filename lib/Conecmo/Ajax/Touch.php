<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Touch extends Base
{

    protected function output()
    {
        $p = $this->post;
        $dbc = \Conecmo\Env::db();
        $db = \Ae\Db::of($dbc);
        $db->open();
        $d = new \Conecmo\Dho($db, 'editing');
        $eid = $p->get('editing_id');
        $ticket = $p->get('ticket');
        $d->touch($eid, $ticket);
        $j = [
            'state' => 'ok',
        ];
        return \json_encode($j);
    }

}
