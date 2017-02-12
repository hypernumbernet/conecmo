<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo;

/**
 * control db の操作
 */
class Dho extends \Ae\Db\Dho
{

    /**
     * 編集中フラグを立てる。
     *
     * @param int $db_id アプリケーション設定のDB id
     * @param int $table_id アプリケーション設定のtable id
     * @param string $pk_val_str 主キーデータの文字列配列
     * @param int $uid ログインユーザーid
     * @return mixed[] 0: 編集id, 1: 発行したトークン
     */
    public function edit($db_id, $table_id, $pk_val_str, $uid, $save_data)
    {
        $ticket = \Ae\Password::make(16);
        $param = new \Ae\Db\SqlParam('editing');
        $vals = [
            'started' => ['NOW()', true],
            'touch' => ['NOW()', true],
            'db_id' => [$db_id, \PDO::PARAM_INT],
            'table_id' => [$table_id, \PDO::PARAM_INT],
            'pkey' => [$pk_val_str, \PDO::PARAM_STR],
            'ticket' => [$ticket, \PDO::PARAM_STR],
            'users_id' => [$uid, \PDO::PARAM_INT],
            'save_data' => [$save_data, \PDO::PARAM_STR]
        ];
        $param->value($vals);
        $editing_id = $this->insert($param);
        return [$editing_id, $ticket];
    }

    /**
     * 編集中の時刻を更新する。
     *
     * @param int $editing_id
     * @param string $ticket
     * @throws \Conecmo\Exception
     */
    public function touch($editing_id, $ticket)
    {
        $param = new \Ae\Db\SqlParam('editing');
        $values = [
            'touch' => ['NOW()', true],
        ];
        $param->value($values);
        $binds = [
            [$editing_id, \PDO::PARAM_INT],
            [$ticket, \PDO::PARAM_STR],
        ];
        $param->bind($binds);
        $param->where = ['id = ?', 'ticket = ?'];
        $n = $this->update($param);
        if ($n !== 1) {
            throw new \Conecmo\Exception(['System' => 'TOUCH']);
        }
    }

    /**
     * 更新チケットを検証し、主キーデータを返却する。
     *
     * @param int $editing_id
     * @param string $ticket
     * @return string|false
     */
    public function ticket($editing_id, $ticket)
    {
        $param = new \Ae\Db\SqlParam('editing');
        $param->binds = $editing_id;
        $param->where = 'id = ?';
        $r = $this->record($param);
        if ($r && $r['ticket'] === $ticket) {
            return (string) $r['pkey'];
        }
        return false;
    }

    /**
     * 終了時刻を記録して編集を閉じる。
     *
     * @param int $editing_id
     * @param string $ticket
     */
    public function finish($editing_id, $ticket)
    {
        $param = new \Ae\Db\SqlParam('editing');
        $values = [
            'finish' => ['NOW()', true],
        ];
        $param->value($values);
        $binds = [
            [$editing_id, \PDO::PARAM_INT],
            [$ticket, \PDO::PARAM_STR],
        ];
        $param->bind($binds);
        $param->where = ['id = ?', 'ticket = ?'];
        $n = $this->update($param);
        if ($n !== 1) {
            throw new \Conecmo\Exception(['System' => 'FINISH']);
        }
    }

    /**
     * 変更を通知する。
     *
     * @param int $table_id
     * @param string $pk_val_str
     * @param string $operation
     */
    public function notifyChange($table_id, $pk_val_str, $operation)
    {
        $param = new \Ae\Db\SqlParam('edited');
        $values = [
            'table_id' => [$table_id, \PDO::PARAM_INT],
            'pkey' => $pk_val_str,
            'operation' => $operation,
        ];
        $param->value($values);
        $this->insert($param, false);
    }

}
