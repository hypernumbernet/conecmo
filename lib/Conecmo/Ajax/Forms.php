<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

/**
 * テーブルを列挙する。
 */
class Forms extends Base
{

    protected function output()
    {
        $r = $this->cfg->forms;
        $j = [
            'state' => 'ok',
            'forms' => $r,
        ];
        return \json_encode($j, \JSON_FORCE_OBJECT);
    }

}
