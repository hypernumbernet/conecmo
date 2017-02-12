<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo;

/**
 * システム定数
 */
class Cst
{

    /** @var string カラムと主キーデータの区切り文字 */
    const DELIMITER = "\x1F";

    /** @var string カラムと主キーデータの区切り文字 */
    const ESCAPE_START = "\x1B";

    /** @var string カラムと主キーデータの区切り文字 */
    const ESCAPE_DELIMITER = "d";

    /** @var アプリケーション定義体  */
    const FILE_APP_DEF = 'application.xml';

    /** @var フォーム定義体プレフィックス  */
    const FORM_PREFIX = 'form#';

}
