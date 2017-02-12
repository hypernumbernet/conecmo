/*!
 * Conecmo form management class
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global Sys, SysCst, SysMsg, SysParts */

/**
 * フォーム生成コンストラクタ
 * @constructor
 * @version v0.0.0
 * @param {string} id 一意の識別子
 * @param {string} xml 定義ファイル
 * @param {number} number インスタンス番号。0開始
 */
function SysForm(id, xml, number) {
    var _ = this;
    /**
     * 一意の識別子
     * @type string
     */
    _.id = id;
    /**
     * 定義ファイル
     * @type string
     */
    _.xml = xml;
    /**
     * インスタンス番号。0開始
     * @type number
     */
    _.number = number;
    /**
     * データ位置
     * @type number
     */
    _.offset = 0;
    /**
     * データ数
     * @type number
     */
    _.count = null;
    /**
     * テーブルid
     * @type number
     */
    _.table_id;
    /**
     * 主キーデータ連結済
     * @type string
     */
    _.pk_val_str = null;
    /**
     * データリクエスト状態フラグ
     * @type boolean
     */
    _.loading = false;
    /**
     * データリクエスト状態の時、さらに次のリクエストが来ているか？
     * @type boolean
     */
    _.need_refresh = false;
    /**
     * 編集中フラグ
     * @type boolean
     */
    _.dirty = false;
    /**
     * 編集開始を申請中か？
     * @type boolean
     */
    _.load_editing = false;
    /**
     * 新規データ追加モード
     * @type boolean
     */
    _.new_record = false;
    /**
     * 更新リクエストid
     * @type number
     */
    _.editing_id = 0;
    /**
     * 更新リクエストトークン
     * @type string
     */
    _.ticket = '';
    /**
     * ロード中メッセージ表示用タイマー
     * @type number
     */
    _.timer_status;
    /**
     * 編集中処理開始用タイマー
     * @type number
     */
    _.timer_editing;
    /**
     * ダイアログ外枠
     * @type jQuery
     */
    _.$window;
    /**
     * ダイアログ本体
     * @type jQuery
     */
    _.$content;
    /**
     * ダイアログのフッター
     * @type SysParts.Footer
     */
    _.footer;
    _.ajaxForm();
}

/**
 * フォームを開く。ログイン認証失敗時の再開用に関数化されている。
 */
SysForm.prototype.ajaxForm = function () {
    var _ = this;
    var req = {
        name: _.xml
    };
    var me = {
        func: _.ajaxForm,
        that: _
    };
    Sys.ajax('form.php', req, 0, me).done(function (res) {
        _.open.call(_, res);
    }).fail(function () {
        delete Sys.dialogs[_.id];
    });
};

/**
 * フォームダイアログを生成する。
 * @param {Object} res
 */
SysForm.prototype.open = function (res) {
    var _ = this;
    _.table_id = res.table;
    var div_id = 'form-' + Sys.escapeHtml(_.id);
    _.$content = $('<div id="' + div_id + '" class="form">' +
        res.html.replace('&id;', div_id) +
        '</div>');
    var left = Sys.dialogLeft();
    var top = Sys.dialogTop();
    _.$content.dialog({
        appendTo: Sys.$panel_main,
        closeOnEscape: false,
        closeText: SysMsg.DIALOG_CLOSE,
        width: res.width,
        position: {
            my: 'left top',
            at: 'left+' + left + ' top+' + top,
            of: Sys.$panel_main,
            collision: 'none'
        },
        title: res.title + (_.number ? ' - ' + _.number : ''),
        create: function () {
            _.$window = _.$content.parent();
            _.footer = new SysParts.Footer(_);
            _.$window.append(_.footer.$body);
        },
        beforeClose: function () {
            _.dataUpdate(function () {
                _.$content.dialog('destroy');
                _.$content.remove();
                delete Sys.dialogs[_.id];
            });
            return false;
        }
    }).on({
        input: function () {
            _.dataEditing();
        }
    });
    if (res.height) {
        _.$content.height(res.height);
    }
    Sys.draggableOn(_.$window);
    _.dataRead();
    _.dataCount();
};

/**
 * 取得したデータをフォームに配置する。
 * @param {Object} data
 */
SysForm.prototype.dataPut = function (data) {
    var _ = this;
    Object.keys(data).forEach(function (key) {
        _.$content
            .find('input[name="' + Sys.escapeSelector(key) + '"]')
            .val(data[key]);
    });
};

/**
 * データ取得主軸関数
 * @param {number} delay 連続読み込み時の遅延時間。初回だけ大きな値にする。
 */
SysForm.prototype.dataRead = function (delay) {
    var _ = this;
    if (delay === void 0) {
        delay = 0;
    }
    _.new_record = false;
    //連続読み込みを防止
    if (_.loading) {
        _.need_refresh = true;
        return;
    }
    _.loading = true;
    clearTimeout(_.footer.timer);
    _.timer_status = setTimeout($.proxy(_.statusLoading, _),
        SysCst.DELAY_LOADING);
    Sys.getCache(_.table_id)
        .read(_.offset).done(function (data, pk_val_str) {
        _.pk_val_str = pk_val_str;
        _.dataPut(data);
        clearTimeout(_.timer_status);
        _.footer.$status.text('');
        _.loading = false;
        if (_.need_refresh) {
            _.need_refresh = false;
            _.dataRead(delay);
            return;
        }
        if (_.footer.next) {
            _.footer.timer = setTimeout(
                $.proxy(_.dataNext, _, SysCst.NEXT_DELAY), delay);
        } else if (_.footer.prev) {
            _.footer.timer = setTimeout(
                $.proxy(_.dataPrev, _, SysCst.NEXT_DELAY), delay);
        }
    }).fail(function () {
        clearTimeout(_.timer_status);
        _.footer.$status.text('');
        _.loading = false;
        _.pk_val_str = null;
        _.$content.find('input').val('');
    });
};

/**
 * 次のデータへ
 * @param {number} delay
 */
SysForm.prototype.dataNext = function (delay) {
    var _ = this;
    if (_.offset >= _.count - 1) {
        return;
    }
    _.setOffset(_.offset + 1);
    if (delay === void 0) {
        delay = SysCst.FIRST_DELAY;
    }
    _.dataRead(delay);
};

/**
 * 前のデータへ
 * @param {number} delay
 */
SysForm.prototype.dataPrev = function (delay) {
    var _ = this;
    if (_.offset === 0) {
        return;
    }
    _.setOffset(_.offset - 1);
    if (delay === void 0) {
        delay = SysCst.FIRST_DELAY;
    }
    _.dataRead(delay);
};

/**
 * 総データ数の取得と表示
 * @param {Function} callback
 */
SysForm.prototype.dataCount = function (callback) {
    var _ = this;
    var req = {
        table: _.table_id
    };
    var me = {
        func: _.dataCount,
        that: _,
        args: arguments
    };
    Sys.ajax('count.php', req, 0, me).done(function (res) {
        _.setCount(res.count);
        if (_.new_record) {
            _.setOffset(_.count);
        } else {
            _.footer.putCurrent(_);
        }
        if (callback) {
            callback();
        }
    });
};

/**
 * データ読み込み中案内。遅延実行のため関数化
 */
SysForm.prototype.statusLoading = function () {
    var _ = this;
    _.footer.$status.text(SysMsg.NOW_LOADING);
};

/**
 * データ編集中フラグを開始または継続する。
 * @param {Function} callback
 */
SysForm.prototype.dataEditing = function (callback) {
    var _ = this;
    if (_.pk_val_str == null && !_.new_record) {
        return;
    }
    _.dirty = true;
    if (_.editing_id) {
        clearTimeout(_.timer_editing);
        _.timer_editing = setTimeout($.proxy(_.dataTouch, _),
            SysCst.TOUCH_DELAY);
        return;
    }
    if (_.load_editing) {
        return;
    }
    _.load_editing = true;
    var req = {
        table: _.table_id,
        pk_val_str: _.pk_val_str,
        save_data: JSON.stringify(
            Sys.getCache(_.table_id).records[_.pk_val_str])
    };
    _.ajaxEditing(req, callback);
};

/**
 * データ編集中フラグを開始をリクエストする。
 * @param {Object} req
 * @param {Function} callback
 */
SysForm.prototype.ajaxEditing = function (req, callback) {
    var _ = this;
    var me = {
        func: _.ajaxEditing,
        that: _,
        args: arguments
    };
    Sys.ajax('editing.php', req, 0, me).done(function (res) {
        _.editing_id = res.id;
        _.ticket = res.ticket;
    }).always(function () {
        _.load_editing = false;
        if (callback) {
            callback();
        }
    });
};

/**
 * データ編集中フラグを継続する。
 */
SysForm.prototype.dataTouch = function () {
    var _ = this;
    var req = {
        editing_id: _.editing_id,
        ticket: _.ticket
    };
    var me = {
        func: _.dataTouch,
        that: _,
        args: arguments
    };
    Sys.ajax('touch.php', req, 0, me);
};

/**
 * 編集レコードを保存する。レコード新規追加も兼ねている。
 * @param {Function} callback 保存が正常終了した時に呼び出される。
 */
SysForm.prototype.dataUpdate = function (callback) {
    var _ = this;
    if (!_.dirty) {
        callback();
        return;
    }
    if (!_.editing_id) {
        if (_.load_editing) {
            setTimeout($.proxy(_.dataUpdate, _), SysCst.UPDATE_DELAY,
                callback);
        } else {
            $.error(SysMsg.UPDATE_NO_TICKET);
        }
        return;
    }
    if (_.new_record) {
        _.dataCreate(callback);
        return;
    }
    var data = {};
    _.$content.find('input').each(function () {
        $this = $(this);
        data[$this.attr('name')] = $this.val();
    });
    var req = {
        table: _.table_id,
        editing_id: _.editing_id,
        ticket: _.ticket,
        data: JSON.stringify(data),
        pk_col: JSON.stringify(Sys.tables[_.table_id].pKColArr),
        column_types: JSON.stringify(_.columnTypes())
    };
    var me = {
        func: _.dataUpdate,
        that: _,
        args: arguments
    };
    Sys.ajax('update.php', req, 0, me).done(function () {
        _.dirty = false;
        _.editing_id = 0;
        delete Sys.caches[_.table_id].records[_.pk_val_str];
        callback();
    });
};

/**
 * カラム情報からカラムタイプ一覧を作成する。
 */
SysForm.prototype.columnTypes = function () {
    var _ = this;
    var r = {};
    var a = Sys.tables[_.table_id].columns;
    for (var i = 0, l = a.length; i < l; ++i) {
        var v = a[i];
        r[v.column_name] = v.data_type;
    }
    return r;
};

/**
 * 新規データ追加モードに移行する。
 */
SysForm.prototype.newInput = function () {
    var _ = this;
    _.new_record = true;
    _.pk_val_str = null;
    _.$content.find('input').prop('disabled', false).val('');
    _.setOffset(_.count);
};

/**
 * 新規レコードを追加する。
 * @param {Function} callback 追加が正常終了した時に呼び出される。
 */
SysForm.prototype.dataCreate = function (callback) {
    var _ = this;
    var data = {};
    _.$content.find('input').each(function () {
        $this = $(this);
        var val = $this.val();
        if (val !== '') {
            data[$this.attr('name')] = val;
        }
    });
    var req = {
        table: _.table_id,
        editing_id: _.editing_id,
        ticket: _.ticket,
        data: JSON.stringify(data),
        column_types: JSON.stringify(_.columnTypes())
    };
    var me = {
        func: _.dataCreate,
        that: _,
        args: arguments
    };
    Sys.ajax('insert.php', req, 0, me).done(function () {
        _.new_record = false;
        _.dirty = false;
        _.editing_id = 0;
        _.setCount(_.count + 1);
        Sys.getCache(_.table_id).offset_map = {};
        callback();
    });
};

/**
 * 更新情報を受け取って処理する。
 * @param {Object} res
 */
SysForm.prototype.receiver = function (res) {
    var _ = this;
    if (_.dirty) {
        return;
    }
    var need_read = false;
    var need_count = false;
    var pk_list = res.expired[_.table_id];
    if (pk_list) {
        var index = pk_list.indexOf(_.pk_val_str);
        if (index > -1) {
            need_read = true;
        }
    }
    if (res.inserted.length) {
        need_count = true;
    }
    var del_list = res.deleted[_.table_id];
    if (del_list) {
        need_count = true;
    }
    if (need_count) {
        _.dataCount(function () {
            if (!_.new_record) {
                if (_.count <= _.offset) {
                    _.setOffset(_.count - 1);
                }
                _.dataRead();
            }
        });
    } else if (need_read && !_.new_record) {
        _.dataRead();
    }
};

/**
 * レコードを削除する。
 */
SysForm.prototype.dataDelete = function () {
    var _ = this;
    if (_.new_record || _.pk_val_str == null) {
        return;
    }
    _.dataEditing(function () {
        Sys.overlay(SysCst.Z_SYS_OVERLAY);
        var $dialog = Sys.div('confirm-dialog');
        var buttons = {};
        buttons[SysMsg.DIALOG_OK] = function () {
            $dialog.dialog('close');
            _.ajaxDelete();
        };
        buttons[SysMsg.DIALOG_CANCEL] = function () {
            $dialog.dialog('close');
            _.dirty = false;
            _.editing_id = 0;
        };
        $dialog.html(SysMsg.CONFIRM_DELETE)
            .dialog({
                title: SysMsg.TITLE_CONFIRM,
                closeText: SysMsg.DIALOG_CLOSE,
                resizable: false,
                width: 400,
                buttons: buttons,
                close: function () {
                    $dialog.dialog('destroy');
                    $dialog.remove();
                    Sys.removeOverlay();
                }
            }).parent().zIndex(SysCst.Z_SYS_DIALOG);
    });
};

/**
 * レコードを削除する。
 */
SysForm.prototype.ajaxDelete = function () {
    var _ = this;
    var req = {
        table: _.table_id,
        editing_id: _.editing_id,
        ticket: _.ticket,
        pk_col: JSON.stringify(Sys.tables[_.table_id].pKColArr),
        column_types: JSON.stringify(_.columnTypes())
    };
    var me = {
        func: _.ajaxDelete,
        that: _
    };
    Sys.ajax('delete.php', req, 0, me).done(function () {
        Sys.getCache(_.table_id).offset_map = {};
    }).always(function () {
        _.dirty = false;
        _.editing_id = 0;
    });
};

/**
 * データ件数セッター
 * @param {number} x
 */
SysForm.prototype.setCount = function (x) {
    var _ = this;
    _.count = x;
    _.footer.putCount(x);
    if (x == 0) {
        _.$content.find('input').prop('disabled', true);
    } else {
        _.$content.find('input').prop('disabled', false);
    }
};

/**
 * データ現在位置セッター
 * @param {number} x
 */
SysForm.prototype.setOffset = function (x) {
    var _ = this;
    if (x < 0) {
        return;
    }
    _.offset = x;
    _.footer.putCurrent(_);
};
