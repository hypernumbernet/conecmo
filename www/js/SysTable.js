/*!
 * Conecmo form management class
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global Sys, SysCst, SysMsg, SysParts */

/**
 * テーブルダイアログ
 * @constructor
 * @version v0.0.0
 * @param {number} id テーブルid
 * @param {number} number インスタンス番号。0開始
 */
function SysTable(id, number) {
    var _ = this;
    /**
     * テーブルid
     * @type string
     */
    _.table_id = id;
    /**
     * インスタンス番号。0開始
     * @type number
     */
    _.number = number;
    /**
     * グリッド行数
     * @type number
     */
    _.row_size = 0;
    /**
     * データ位置（表示最上行）
     * @type number
     */
    _.offset = 0;
    /**
     * 列表示位置
     * @type number
     */
    _.left = 0;
    /**
     * カーソル横位置
     * @type number
     */
    _.cursor_x = 0;
    /**
     * カーソル行位置（データ順位）
     * @type number
     */
    _.cursor_y = 0;
    /**
     * データ数
     * @type number
     */
    _.count = 0;
    /**
     * 主キーデータ連結済[表示行]
     * @type string
     */
    _.pk_val_str = [];
    /**
     * データリクエスト状態フラグ
     * @type boolean
     */
    _.loading = false;
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
    /**
     * グリッドテーブル
     * @type jQuery
     */
    _.$grid;
    _.footer;
    _.open();
    _.dataCount(_.dataRead);
}

/**
 * テーブルのダイアログを生成する。
 */
SysTable.prototype.open = function () {
    var _ = this;
    var timer_page = 0;
    var div_id = 'table-' + Sys.escapeHtml(_.table_id);
    _.$content = $('<div id="' + div_id + '" class="table"></div>');
    _.$content.css('overflow', 'hidden');
    _.sb_horizontal = new SysParts.SBHorizontal();
    _.$content.append(_.sb_horizontal.$body);
    _.sb_horizontal.slide(function (left) {
        var width = Sys.tables[_.table_id].columns.length - 1;
        _.left = Math.ceil(width * left);
        if (_.count) {
            _.dataRead();
        } else {
            _.eraseGridEnd();
        }
    }).prev({
        mousedown: function () {
            var width = Sys.tables[_.table_id].columns.length - 1;
            var per = (--_.left) / width;
            if (per < 0) {
                per = 0;
            }
            _.sb_horizontal.callbackSlide(per);
            _.sb_horizontal.move(per);
        }
    }).next({
        mousedown: function () {
            var width = Sys.tables[_.table_id].columns.length - 1;
            var per = (++_.left) / width;
            if (per > 1) {
                per = 1;
            }
            _.sb_horizontal.callbackSlide(per);
            _.sb_horizontal.move(per);
        }
    }).page({
        start: function (offset) {
            _.sb_horizontal.callbackSlide(offset.x);
            _.sb_horizontal.move(offset.x);
        }
    });
    _.sb_vertical = new SysParts.SBVertical();
    _.$content.append(_.sb_vertical.$body);
    _.sb_vertical.slide(function (top) {
        if (!_.count) {
            return;
        }
        _.setOffset(Math.ceil((_.count - 1) * top));
        _.dataRead();
    }).prev({
        mousedown: function () {
            _.footer.$body.children('.footer-prev').trigger('mousedown');
        },
        'mouseup touchend': function () {
            _.footer.$body.children('.footer-prev').trigger('mouseup');
        },
        mouseout: function () {
            _.footer.$body.children('.footer-prev').trigger('mouseout');
        }
    }).next({
        mousedown: function () {
            _.footer.$body.children('.footer-next').trigger('mousedown');
        },
        'mouseup touchend': function () {
            _.footer.$body.children('.footer-next').trigger('mouseup');
        },
        mouseout: function () {
            _.footer.$body.children('.footer-next').trigger('mouseout');
        }
    }).page({
        start: function (offset) {
            _.dataUpdate(function () {
                offset.to = offset.y * _.count | 0;
                var delta = offset.to - _.offset;
                offset.dir = delta < 0 ? -1 : 1;
                //つまみの長さを考慮して差っ引く／付け足す
                var height = offset.height * _.count * 0.5 | 0;
                offset.to += offset.dir * height;
                pageStart(offset, SysCst.FIRST_DELAY);
            });
        },
        stop: function () {
            clearTimeout(timer_page);
        }
    });
    var width = 800;
    var height = 500;
    _.gridRowSize(height);
    _.grid();
    var left = Sys.dialogLeft();
    var top = Sys.dialogTop();
    _.$content.dialog({
        appendTo: Sys.$panel_main,
        closeOnEscape: false,
        closeText: SysMsg.DIALOG_CLOSE,
        width: width,
        position: {
            my: 'left top',
            at: 'left+' + left + ' top+' + top,
            of: Sys.$panel_main,
            collision: 'none'
        },
        title: Sys.tables[_.table_id].caption +
            (_.number ? ' - ' + _.number : ''),
        create: function () {
            _.$window = _.$content.parent();
            _.footer = new SysParts.Footer(_);
            _.$window.append(_.footer.$body);
        },
        beforeClose: function () {
            _.dataUpdate(function () {
                _.$content.dialog('destroy');
                _.$content.remove();
                delete Sys.dialogs[_.table_id];
            });
            return false;
        },
        resize: function () {
            if (_.gridRowSize(_.$content.height())) {
                _.$content.find('table.grid').remove();
                _.grid();
                _.dataRead();
            }
        }
    }).on({
        input: function () {
            _.dataEditing();
        },
        mousewheel: function (event) {
            if (event.deltaY < 0) {
                _.dataUpdate(function () {
                    _.dataNext();
                });
            } else if (event.deltaY > 0) {
                _.dataUpdate(function () {
                    _.dataPrev();
                });
            }
        }
    });
    _.$content.height(height);
    Sys.draggableOn(_.$window);

    /**
     * 縦スクロール余白機能
     * @param {object} offset
     * @param {number} delay
     */
    function pageStart(offset, delay) {
        if (delay === void 0) {
            delay = SysCst.NEXT_DELAY;
        }
        var loop = true;
        var delta = offset.to - _.offset;
        var move = 0;
        if (Math.abs(delta) < _.row_size) {
            move = delta;
            loop = false;
        } else {
            move = offset.dir * _.row_size;
        }
        _.offset += move;
        if (_.offset < 0) {
            _.offset = 0;
            loop = false;
        } else if (_.offset >= _.count) {
            _.offset = _.count - 1;
            loop = false;
        }
        _.dataRead();
        if (loop) {
            timer_page = setTimeout(pageStart, delay, offset);
        }
    }
};

/**
 * グリッド生成
 */
SysTable.prototype.grid = function () {
    var _ = this;
    var columns = Sys.tables[_.table_id].columns;
    var size = columns.length;
    var html = '<table class="grid"><thead><tr><td></td>';
    for (var i = 0; i < size; ++i) {
        html += '<td id="head-' + i + '">' + columns[i].column_name + '</td>';
    }
    html += '</tr></thead><tbody>';
    var l = _.row_size;
    for (var j = 0; j < l; ++j) {
        html += '<tr id="row-' + j + '"><td id="cell-' + j +
            '" class="grid-command"></td>';
        for (var i = 0; i < size; ++i) {
            html += '<td id="cell-' + j + '-' + i +
                '" class="grid-data"></td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    _.$grid = $(html);
    _.$content.append(_.$grid);
    _.$input = $('<input id="grid-input" class="grid-input-text">');
    _.$content.append(_.$input);
    _.$grid.find('.grid-data').on({
        click: function () {
            var $this = $(this);
            var text = $this.text();
            var position = $this.position();
            var left = position.left + 2;
            var top = position.top + 2;
            _.$input.val(text);
            _.$input.width($this.width() + 1);
            _.$input.css('left', left + 'px');
            _.$input.css('top', top + 'px');
            _.$input.show();
            _.$input.focus(function () {
                $(this).select();
            });
            _.$input.focus();
        }
    });
};

/**
 * グリッド行数を算出し設定する。
 * @param {number} height
 * @returns {boolean} 変更されたか？
 */
SysTable.prototype.gridRowSize = function (height) {
    var _ = this;
    var x = Math.ceil((height - 36) / 20);
    if (_.row_size != x) {
        _.row_size = x;
        return true;
    }
    return false;
};

/**
 * 取得したデータをグリッドに配置する。
 * @param {Object} data
 * @param {number} row 行指定
 */
SysTable.prototype.dataPut = function (data, row) {
    var _ = this;
    _.$content.find('#row-' + row).css('display', 'table-row');
    var cursor = '';
    if (_.cursor_y == _.offset + row) {
        cursor = '<i class="fa fa-caret-right"></i>';
    }
    _.$content.find('#cell-' + row).html(cursor);
    var column = 0;
    var columns = Sys.tables[_.table_id].columns;
    var width = Object.keys(data).length;
    for (var k in data) {
        var x = column - _.left;
        if (x >= 0) {
            _.$content.find('#cell-' + row + '-' + x)
                .css('display', 'table-cell').text(data[k]);
            if (!row) {
                _.$content.find('#head-' + x).css('display', 'table-cell')
                    .text(columns[column].column_name);
            }
        } else {
            _.$content.find('#cell-' + row + '-' + (width + x))
                .css('display', 'none');
            if (!row) {
                _.$content.find('#head-' + (width + x)).css('display', 'none');
            }
        }
        ++column;
    }
};

/**
 * グリッド末尾のデータのない領域の消去。
 */
SysTable.prototype.eraseGridEnd = function () {
    var _ = this;
    for (var i = _.row_size - 1; i && _.offset + i >= _.count; --i) {
        if (_.offset + i == _.count) {
            // 新規追加行
            _.$content.find('#row-' + i).css('display', 'table-row')
                .children().text('');
            _.$content.find('#cell-' + i).html('+');
            var l = Sys.tables[_.table_id].columns.length;
            for (var j = 0; j < l; ++j) {
                if (j < (l - _.left)) {
                    _.$content.find('#cell-' + i + '-' + j)
                        .css('display', 'table-cell');
                } else {
                    _.$content.find('#cell-' + i + '-' + j)
                        .css('display', 'none');
                }
            }
        } else {
            _.$content.find('#row-' + i).css('display', 'none');
        }
    }
};

/**
 * データ取得主軸関数
 * @param {number} delay 連続読み込み時の遅延時間。初回だけ大きな値にする。
 * @param {number} index 行指定
 */
SysTable.prototype.dataRead = function (delay, index) {
    var _ = this;
    if (delay === void 0) {
        delay = 0;
    }
    if (index === void 0) {
        index = 0;
    }
    if (index >= _.row_size || _.offset + index >= _.count) {
        _.eraseGridEnd();
        return;
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
    _.sb_vertical.move(_.offset / (_.count - 1));
    Sys.getCache(_.table_id)
        .read(_.offset + index).done(function (data, pk_val_str) {
        _.pk_val_str[index] = pk_val_str;
        _.dataPut(data, index);
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
        _.dataRead(delay, index + 1);
    }).fail(function () {
        clearTimeout(_.timer_status);
        _.footer.$status.text('');
        _.loading = false;
    });
};

/**
 * 次のデータへ
 * @param {number} delay
 */
SysTable.prototype.dataNext = function (delay) {
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
SysTable.prototype.dataPrev = function (delay) {
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
SysTable.prototype.dataCount = function (callback) {
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
            callback.call(_);
        }
    });
};

/**
 * データ読み込み中案内。遅延実行のため関数化
 */
SysTable.prototype.statusLoading = function () {
    var _ = this;
    _.footer.$status.text(SysMsg.NOW_LOADING);
};

/**
 * データ編集中フラグを開始または継続する。
 * @param {Function} callback
 */
SysTable.prototype.dataEditing = function (callback) {
    var _ = this;
    if (!_.pk_val_str && !_.new_record) {
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
 * データ編集中フラグを開始または継続する。
 * @param {Object} req
 * @param {Function} callback
 */
SysTable.prototype.ajaxEditing = function (req, callback) {
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
SysTable.prototype.dataTouch = function () {
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
SysTable.prototype.dataUpdate = function (callback) {
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
SysTable.prototype.columnTypes = function () {
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
SysTable.prototype.newInput = function () {
    var _ = this;
    _.new_record = true;
    _.pk_val_str = null;
    //_.$content.find('input').val('');
    _.setOffset(_.count);
};

/**
 * 新規レコードを追加する。
 * @param {Function} callback 追加が正常終了した時に呼び出される。
 */
SysTable.prototype.dataCreate = function (callback) {
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
SysTable.prototype.receiver = function (res) {
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
SysTable.prototype.dataDelete = function () {
    var _ = this;
    if (_.new_record) {
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
SysTable.prototype.ajaxDelete = function () {
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
SysTable.prototype.setCount = function (x) {
    var _ = this;
    _.count = x;
    _.footer.putCount(x);
    if (x == 0) {
//        _.$content.find('input').prop('disabled', true);
    } else {
//        _.$content.find('input').prop('disabled', false);
    }
};

/**
 * データ現在位置セッター
 * @param {number} x
 */
SysTable.prototype.setOffset = function (x) {
    var _ = this;
    if (x < 0) {
        return;
    }
    _.offset = x;
    _.footer.putCurrent(_);
};
