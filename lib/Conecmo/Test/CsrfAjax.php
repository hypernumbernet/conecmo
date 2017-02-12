<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Test;

class CsrfAjax extends \Conecmo\Ajax\Base
{

    protected function output()
    {
        $p = new \Ae\HttpInput(\INPUT_POST);
        $c = new \Ae\HttpInput(\INPUT_COOKIE);

        if (!$p->get('key') ||
                !$c->get('key') ||
                $p->get('key') !== $c->get('key')) {
            $r = 'invalid';
        } else {
            $r =  'OK';
        }
        $r .= '<br>POST VALUE';
        $r .= '<br>';
        $r .= print_r($p, true);
        $r .= '<br>COOKIE VALUE';
        $r .= '<br>';
        $r .= print_r($c, true);
        return $r;
    }

}
