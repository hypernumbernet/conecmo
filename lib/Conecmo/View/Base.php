<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\View;

/**
 * アプリケーションView基底クラス
 */
abstract class Base extends \Ae\View
{

    public function __construct()
    {
        parent::__construct(\Conecmo\Env::ERRMAIL,
                \Conecmo\Utl::message('System', 'GENERAL'));
        $this->setLayout(\APPHOME . 'template/_layout.phtml');
        $this->debug = \Conecmo\Env::DEBUG;
        $this->setDisplayErrors(\Conecmo\Env::LOGFILE);
    }

    public function setMain($file)
    {
        parent::setMain(\APPHOME . 'template/' . $file);
    }

}
