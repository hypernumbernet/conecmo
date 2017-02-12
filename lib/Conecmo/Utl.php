<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo;

/**
 * 汎用関数群
 */
class Utl
{

    /**
     * 言語別メッセージ取得
     *
     * @param string $group
     * @param string $key
     * @return string
     */
    public static function message($group, $key)
    {
        $class = '\\Conecmo\\Msg\\' . \AE_LANG . '\\' . $group;
        return \Ae\Utl::arrayVal($class::MSG, $key);
    }

    /**
     * Ajaxデバッグ用ファイルログ出力
     *
     * @param mixed $val
     */
    public static function log($val)
    {
        \Ae\Utl::log(\print_r($val, true), \Conecmo\Env::LOGFILE);
    }

    /**
     * 主キー用エスケープ
     *
     * @param string $s
     * @return string
     */
    public static function escapePKey($s)
    {
        $r = '';
        $l = \strlen($s);
        for ($i = 0; $i < $l; ++$i) {
            switch ($s[$i]) {
                case \Conecmo\Cst::ESCAPE_START:
                    $r .= \Conecmo\Cst::ESCAPE_START . \Conecmo\Cst::ESCAPE_START;
                    break;
                case \Conecmo\Cst::DELIMITER:
                    $r .= \Conecmo\Cst::ESCAPE_START . \Conecmo\Cst::ESCAPE_DELIMITER;
                    break;
                default:
                    $r .= $s[$i];
            }
        }
        return $r;
    }

    /**
     * 主キー用アンエスケープ
     *
     * @param string $s
     * @return string
     */
    public static function unescapePKey($s)
    {
        $r = '';
        $e = false;
        $l = \strlen($s);
        for ($i = 0; $i < $l; ++$i) {
            switch ($s[$i]) {
                case \Conecmo\Cst::ESCAPE_START:
                    if ($e) {
                        $e = false;
                        $r .= \Conecmo\Cst::ESCAPE_START;
                    } else {
                        $e = true;
                    }
                    break;
                case \Conecmo\Cst::ESCAPE_DELIMITER:
                    if ($e) {
                        $e = false;
                        $r .= \Conecmo\Cst::DELIMITER;
                    }
                    break;
                default:
                    if ($e) {
                        $e = false;
                    }
                    $r .= $s[$i];
            }
        }
        return $r;
    }

}
