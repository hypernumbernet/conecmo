<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo;

/**
 * 例外処理
 */
class Exception extends \Exception
{

    /**
     * メッセージID変換処理を継承して追加
     *
     * @param string|array $message メッセージデータ。
     * keyが文字列の配列データの場合、メッセージIDとして変換処理する。
     * その他の場合は連結される。
     * @param int $code 親へそのまま渡す
     */
    public function __construct($message = '', $code = 0)
    {
        if (\is_array($message)) {
            foreach ($message as $k => &$v) {
                if (\is_string($k)) {
                    $v = \Conecmo\Utl::message($k, $v);
                }
            }
            $message = \implode('', $message);
        }
        parent::__construct($message, $code);
    }

}
