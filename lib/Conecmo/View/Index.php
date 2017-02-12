<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\View;

class Index extends Base
{

    public function __construct()
    {
        parent::__construct();
        $this->setMain('index.phtml');
        $js = \Ae\Utl\Html::loadJs('js/SysCst.js') .
                \Ae\Utl\Html::loadJs('js/lang/' . \AE_LANG . '.js') .
                \Ae\Utl\Html::loadJs('js/Sys.js') .
                \Ae\Utl\Html::loadJs('js/SysCache.js') .
                \Ae\Utl\Html::loadJs('js/SysForm.js') .
                \Ae\Utl\Html::loadJs('js/SysTable.js') .
                \Ae\Utl\Html::loadJs('js/SysCmd.js') .
                \Ae\Utl\Html::loadJs('js/SysParts.js') .
                \Ae\Utl\Html::loadJs('js/onload.js');
        $this->layout->add('js', $js, false);
        $this->display();
    }

}
