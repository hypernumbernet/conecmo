<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

class Login extends Base
{

    protected function output()
    {
        $dbc = \Conecmo\Env::db();
        if (!$dbc) {
            throw new \Conecmo\Exception(['System' => 'NO_DB_DEFINITION']);
        }
        $this->db = \Ae\Db::of($dbc);
        $this->db->open();
        $g = new \Ae\Login();
        $msg = $g->loginAjax($this->post, $this->db);
        $j = [
            'state' => 'ok',
            'token' => '',
            'message' => $msg,
        ];
        return \json_encode($j);
    }

}
