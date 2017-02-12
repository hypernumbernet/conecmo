<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

/**
 * 期限切れになったレコード情報を返す。
 */
class WhatsUp extends Base
{

    /** @var int 更新情報テーブルで取得済みのidしおり */
    private $bookmark;

    protected function output()
    {
        $p = $this->post;
        $last = (int) $p->get('last');
        if ($last) {
            $this->bookmark = $last;
        }

        $dbc = \Conecmo\Env::db();
        $db = \Ae\Db::of($dbc);
        $db->open();

        \header('Content-type: application/octet-stream');
        \header('Transfer-encoding: chunked');
        \flush();

        try {
            $count = 0;
            while (!\connection_aborted()) {
                $j = $this->getUpData($db);
                if ($j) {
                    $this->outputChunk($j);
                }
                \sleep(1);
                ++$count;
                if ($count >= 600) {
                    break;
                }
            }
        } catch (\Exception $e) {
            $this->outputChunk(\json_encode([
                'state' => 'error',
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
            ]));
        }
        return "0\r\n\r\n";
    }

    private function getUpData($db)
    {
        $stt = $db->query('SELECT MAX(id) FROM edited');
        $max_id = (int) $stt->fetchColumn();
        if (!$max_id) {
            $max_id = -1;
        }

        $dho = new \Ae\Db\Dho($db);
        $param = new \Ae\Db\SqlParam('edited');
        $param->where = 'id > ?';
        $param->binds = \Ae\Utl::get($this->bookmark, $max_id);
        $r = $dho->records($param);
        if (!$r && $this->bookmark) {
            return '';
        }
        $this->bookmark = $max_id;
        $expired = [];
        $inserted = [];
        $deleted = [];
        foreach ($r as $v) {
            $table_id = (int) $v['table_id'];
            if ($this->permitsTable($table_id)) {
                switch ($v['operation']) {
                    case 'U':
                        $expired[$table_id][] = $v['pkey'];
                        break;
                    case 'I':
                        $inserted[] = $table_id;
                        break;
                    case 'D':
                        $deleted[$table_id][] = $v['pkey'];
                        break;
                }
            }
        }
        $j = [
            'state' => 'ok',
            'expired' => $expired,
            'inserted' => $inserted,
            'deleted' => $deleted,
            'id' => $max_id,
        ];
        return \json_encode($j);
    }

    private function outputChunk($chunk)
    {
        echo \sprintf("%x\r\n", \strlen($chunk));
        echo $chunk . "\r\n";
        \flush();
    }

}
