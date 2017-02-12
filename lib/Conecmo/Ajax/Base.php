<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Ajax;

/**
 * Ajax出力基底
 */
abstract class Base
{

    /** @var \Ae\Db\DbcBase 指定されたテーブルのDB */
    protected $db;

    /** @var string 指定されたテーブル名 */
    protected $table;

    /** @var \Conecmo\AppConf アプリケーション設定 */
    protected $cfg;

    /** @var \Ae\HttpInput POST取得クラスインスタンス */
    protected $post;

    /**
     * DBに接続して出力を行う。
     *
     * @param bool $auth 認証をかけるか？(規定値:true)
     */
    public function __construct($auth = true)
    {
        if ($auth) {
            $authErr = \Ae\Login::authOrErrCode('*');
            //セッションファイルのロックを開放、以降書き込み不可
            \session_write_close();
            if ($authErr) {
                $msg = '\\Ae\\Msg\\' . \AE_LANG . '\\Login';
                echo \json_encode([
                    'state' => 'noauth',
                    'code' => $authErr,
                    'message' => $msg::AGAIN,
                ]);
                exit;
            }
        }
        \libxml_use_internal_errors(true);
        try {
            $this->loadCfg();
            if (\Ae\HttpUtl::byPost()) {
                $cookie = new \Ae\HttpInput(\INPUT_COOKIE);
                $this->post = new \Ae\HttpInput(\INPUT_POST);
                $ctoken = $cookie->get('token');
                $ptoken = $this->post->get('token');
                if (!$ctoken || !$ptoken || $ctoken != $ptoken) {
                    throw new \Conecmo\Exception(['System' => 'TOKEN']);
                }
                echo $this->output();
            }
        } catch (\Exception $e) {
            echo \json_encode([
                'state' => 'error',
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 出力データ生成を実装する。
     *
     * @return string json
     * @throws \Exception
     */
    abstract protected function output();

    /**
     * テーブルへのアクセス許可を参照してDB接続を確立する。
     * <p>$this->db, $this->tableに結果が代入される。</p>
     *
     * @param int $tid テーブルid
     * @throws \Conecmo\Exception
     */
    protected function openDb($tid)
    {
        if (!$this->permitsTable($tid)) {
            throw new \Conecmo\Exception(['System' => 'PERM_TABLE', $tid]);
        }
        $dbid = \Ae\Utl::get($this->cfg->tableDb[$tid]);
        if (!$dbid) {
            throw new \Conecmo\Exception(
            ['System' => 'NO_TABLE_DEFINITION', $tid, ' tableDb']);
        }
        $dbc = \Ae\Utl::get($this->cfg->dbs[$dbid]);
        if (!$dbc) {
            throw new \Conecmo\Exception(
            ['System' => 'NO_DB_DEFINITION', $dbid]);
        }
        $this->table = \Ae\Utl::get($this->cfg->tableName[$tid]);
        if (!$this->table) {
            throw new \Conecmo\Exception(
            ['System' => 'NO_TABLE_DEFINITION', $tid, ' tableName']);
        }
        $this->db = \Ae\Db::of($dbc);
        $this->db->open();
    }

    /**
     * テーブルへのアクセス許可を参照する。
     *
     * @param int $table_id テーブルid
     * @return bool
     */
    protected function permitsTable($table_id)
    {
        // TODO アクセス許可制御
        return true;
    }

    /**
     * アプリケーション設定を読み込む。
     */
    private function loadCfg()
    {
        $cache = \Conecmo\Env::DIR_CACHE . 'application.cache';
        $file_xml = \Conecmo\Env::DIR_APP . \Conecmo\Cst::FILE_APP_DEF;
        if (!\file_exists($file_xml)) {
            throw new \Conecmo\Exception([$file_xml, 'System' => 'NOT_FOUND']);
        }
        $read_cache = false;
        if (\file_exists($cache)) {
            $c_time = \filemtime($cache);
            $x_time = \filemtime($file_xml);
            $read_cache = ($c_time > $x_time);
        }
        if ($read_cache) {
            $u = \file_get_contents($cache);
            $this->cfg = \unserialize($u);
            return;
        }
        $xml = \simplexml_load_file($file_xml);
        if ($xml === false) {
            $err = ['System' => 'XML_PARSE'];
            foreach (\libxml_get_errors() as $e) {
                $err[] = "\n" . $e->message . ' Line: ' . $e->line;
            }
            throw new \Conecmo\Exception($err);
        }
        $this->parseCfg($xml);
        $s = \serialize($this->cfg);
        \file_put_contents($cache, $s);
    }

    /**
     * アプリ設定の解析
     *
     * @param SimpleXMLElement $xml
     */
    private function parseCfg($xml)
    {
        $this->cfg = new \Conecmo\AppConf();
        foreach ($xml->databases->database as $db) {
            $id = (int) $db['id'];
            $dbc = new \Ae\Db\DbcSetting();
            $dbc->adapter = \Ae\Db::DB_POSTGRESQL;
            if ($db->host) {
                $dbc->host = (string) $db->host;
            }
            if ($db->port) {
                $dbc->port = (string) $db->port;
            }
            if ($db->name) {
                $dbc->database = (string) $db->name;
            }
            if ($db->user) {
                $dbc->user = (string) $db->user;
            }
            if ($db->pass) {
                $dbc->pass = (string) $db->pass;
            }
            $this->cfg->dbs[$id] = $dbc;
        }
        foreach ($xml->tables->table as $table) {
            $id = (int) $table['id'];
            $this->cfg->tableDb[$id] = (int) $table['db'];
            $this->cfg->tableName[$id] = (string) $table->name;
            $caption = $this->caption($table);
            $this->cfg->tables[$id] = $caption ? $caption : $id;
        }
        foreach ($xml->forms->form as $form) {
            $id = (string) $form['name'];
            $caption = $this->caption($form);
            $this->cfg->forms[$id] = $caption ? $caption : $id;
        }
    }

    /**
     * 言語を考慮した名前の取得
     *
     * @param SimpleXMLElement $xml
     */
    private function caption($xml)
    {
        $c = $xml->xpath('caption[@lang="ja_JP"]'); // TODO 多言語対応
        return \count($c) ? (string) $c[0] : '';
    }

}
