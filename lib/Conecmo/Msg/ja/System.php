<?php
/**
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

namespace Conecmo\Msg\ja;

/**
 * メッセージ集約クラス
 */
class System
{

    /**
     * @var array システムメッセージ
     */
    const MSG = [
        'CACHE' => 'キャッシュの書き出しに失敗しました。',
        'GENERAL' => 'エラーが発生しました。',
        'JSON_ENCODE' => 'JSONへの変換に失敗しました。',
        'NOT_FOUND' => 'が見つかりません。',
        'NO_DB_DEFINITION' => 'DB定義がありません。',
        'NO_FORM_DEFINITION' => 'フォーム定義がありません。',
        'NO_TABLE_DEFINITION' => 'テーブル定義がありません。',
        'TOUCH' => 'データ更新の同期処理に失敗しました。',
        'XML_PARSE' => 'XML解析に失敗しました。',
        'TOKEN' => 'トークンの認証に失敗しました。',
        'PERM_TABLE' => '対象のテーブルにアクセス権限がありません。',
        'TICKET_UPDATE' => '更新チケットの認証に失敗しました。',
        'TICKET_DELETE' => '削除チケットの認証に失敗しました。',
        'UPDATE_PKEY' => 'データ更新用の主キーが一致しません。',
        'DELETE_PKEY' => 'データ削除用の主キーが一致しません。',
        'UPDATE' => 'データ更新に失敗しました。',
        'DELETE' => 'データ削除に失敗しました。',
        'FINISH' => 'データ更新終了処理に失敗しました。',
        'TICKET_INSERT' => '追加チケットの認証に失敗しました。',
    ];

}
