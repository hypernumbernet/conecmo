/*!
 * Conecmo system standard namespace
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global SysMsg, SysCst, SysForm, SysTable */

/**
 * システム名前空間
 * @namespace
 * @version v0.0.0
 */
var Sys = {
    /**
     * csrf対策用トークン
     * <p>CookieとPOSTに同一のランダム値をセットすることで認証する</p>
     * @type string
     */
    token: null,
    /**
     * ドロップダウンメニューを表示中か？
     * @type boolean
     */
    show_menu: false,
    /**
     * ログインフォームを表示中か？
     * @type boolean
     */
    show_login: false,
    /**
     * エラーダイアログを表示中か？
     * @type boolean
     */
    show_error: false,
    /**
     * キャッシュのブロック読み込みをするか？
     * @type boolean
     */
    load_block: true,
    /**
     * 更新情報をロード中か？
     * @type boolean
     */
    loading_whatsup: false,
    /**
     * ダイアログ移動領域再定義用タイマー
     * @type number
     */
    timer_draggable: 0,
    /**
     * 同期情報取得タイマー
     * @type number
     */
    timer_whatsup: 0,
    /**
     * アプリケーション本体表示部
     * @type jQuery
     */
    $panel_main: null,
    /**
     * 左メニュー
     * @type jQuery
     */
    $panel_list: null,
    /**
     * モーダルダイアログ表示用オーバーレイ
     * @type jQuery
     */
    $overlay_modal: null,
    /**
     * ログインダイアログ
     * @type jQuery
     */
    $login: null,
    /**
     * フォームなどのダイアログを保持
     * @type Object
     */
    dialogs: {},
    /**
     * DBテーブルデータキャッシュ
     * @type Object
     */
    caches: {},
    /**
     * テーブル情報
     * @type Object
     */
    tables: {},
    /**
     * 認証が通らなかったAjaxリクエスト<pre>
     * func {Function} 関数を指定（必須）
     * that {Object} thisポインタを指定（省略可）
     * args {Array} 関数の引数を指定（省略可）</pre>
     * @type Array.<Object>
     */
    noauth: [],
    /**
     * 同期の最終確認id
     * @type number
     */
    last_whatsup: null
};

/**
 * HTMLの属性パラメータへ代入する値のエスケープ
 * @param {string} s
 * @returns {string}
 */
Sys.escapeHtml = function (s) {
    var r = '';
    for (var i = 0, l = s.length; i < l; ++i) {
        switch (s[i]) {
            case '&':
                r += '&amp;';
                break;
            case '<':
                r += '&lt;';
                break;
            case '>':
                r += '&gt;';
                break;
            case '"':
                r += '&quot;';
                break;
            case '\'':
                r += '&#39;';
                break;
            default:
                r += s[i];
        }
    }
    return r;
};

/**
 * 表示用エスケープと改行処理
 * @param {string} s
 * @returns {string}
 */
Sys.escapeLiteral = function (s) {
    var r = '';
    for (var i = 0, l = s.length; i < l; ++i) {
        switch (s[i]) {
            case '&':
                r += '&amp;';
                break;
            case '<':
                r += '&lt;';
                break;
            case '>':
                r += '&gt;';
                break;
            case '\n':
                r += '<br>';
                break;
            default:
                r += s[i];
        }
    }
    return r;
};

/**
 * jQueryセレクタ用エスケープ
 * @param {string} s
 * @returns {string}
 */
Sys.escapeSelector = function (s) {
    return s.replace(/[ !"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
};

/**
 * フォームを開く。
 * すでに開いていれば、最前面に持ってくる。
 * @param {strings} xml
 */
Sys.openForm = function (xml) {
    if (xml in Sys.dialogs) {
        var d = Sys.dialogs[xml];
        if (d instanceof SysForm) {
            if (d.$window) {
                var max = Sys.getZMax();
                d.$window.zIndex(++max);
            }
            if (d.$content) {
                d.$content.find('input').first().focus();
            }
        }
    } else {
        Sys.dialogs[xml] = new SysForm(xml, xml, 0);
    }
};

/**
 * テーブルを開く。
 * すでに開いていれば、最前面に持ってくる。
 * @param {number} id
 */
Sys.openTable = function (id) {
    if (id in Sys.dialogs) {
        var d = Sys.dialogs[id];
        if (d instanceof SysTable) {
            if (d.$window) {
                var max = Sys.getZMax();
                d.$window.zIndex(++max);
            }
            if (d.$content) {
                d.$content.find('input').first().focus();
            }
        }
    } else {
        Sys.dialogs[id] = new SysTable(id, 0);
    }
};

/**
 * 2重起動を許可してフォームを開く
 * @param {string} xml
 */
Sys.cloneForm = function (xml) {
    var i = 0;
    var id = xml;
    while (id in Sys.dialogs) {
        ++i;
        id = xml + '-' + i;
    }
    Sys.dialogs[id] = new SysForm(id, xml, i);
};

/**
 * フォーム一覧のセットアップ
 */
Sys.putForms = function () {
    var me = {
        func: Sys.putForms
    };
    Sys.ajax('forms.php', 0, 0, me).done(function (res) {
        var html = '';
        for (var key in res.forms) {
            html += '<button onclick="Sys.openForm(\'' +
                Sys.escapeHtml(key) + '\')">' + Sys.escapeHtml(res.forms[key]) +
                '</button>';
        }
        $('#forms').html(html);
    });
};

/**
 * テーブル一覧のセットアップとテーブル情報の読み込み
 */
Sys.putTables = function () {
    var me = {
        func: Sys.putTables
    };
    Sys.ajax('tables.php', 0, 0, me).done(function (res) {
        var html = '';
        Sys.tables = res.tables;
        for (var key in res.tables) {
            var v = res.tables[key];
            html += '<button onclick="Sys.openTable(\'' +
                key + '\')">' + Sys.escapeHtml(v.caption) +
                '</button>';
        }
        $('#tables').html(html);
        Sys.openTable(1); //TODO stab
    });
};

/**
 * 多重起動してもオーバーレイが多重にならないように制御
 * @param {number} z
 */
Sys.overlay = function (z) {
    if (Sys.$overlay_modal === null) {
        Sys.$overlay_modal = $('<div id="modal-overlay" style="z-index:' +
            z + ';"></div>');
        $('body').append(Sys.$overlay_modal);
    }
};

/**
 * オーバーレイ除去
 */
Sys.removeOverlay = function () {
    Sys.$overlay_modal.remove();
    Sys.$overlay_modal = null;
};

/**
 * キャッシュ領域を取得する。
 * @param {number} table テーブルid
 * @return {SysCache} DBデータキャッシュ
 */
Sys.getCache = function (table) {
    if (!(table in Sys.caches)) {
        Sys.caches[table] = new SysCache(table);
    }
    return Sys.caches[table];
};

/**
 * 最前面ダイアログの座標を取得
 * @returns {number} 最大値
 */
Sys.getZMax = function () {
    var max = 0;
    for (var key in Sys.dialogs) {
        var w = Sys.dialogs[key].$window;
        if (w === void 0) {
            continue;
        }
        var z = w.zIndex();
        if (z > max) {
            max = z;
        }
    }
    return max;
};

/**
 * 最前面ダイアログを取得
 * @returns {SysForm|undefined}
 */
Sys.getZMaxDialog = function () {
    var max = 0;
    var id;
    for (var key in Sys.dialogs) {
        var w = Sys.dialogs[key].$window;
        if (w === void 0) {
            continue;
        }
        var z = w.zIndex();
        if (z > max) {
            max = z;
            id = key;
        }
    }
    return Sys.dialogs[id];
};

/**
 * ドロップダウンメニューの準備
 * @param {string} name
 */
Sys.putMenu = function (name) {
    var $menu = $('#menu-' + name);
    $menu.menu().hide().on({
    });
    Sys.menuBar('#menu-bar-' + name, $menu);
};

/**
 * メニューバー項目の準備
 * @param {string} id
 * @param {jQuery} $menu
 */
Sys.menuBar = function (id, $menu) {
    var $id = $(id);
    $menu.offset({
        left: $id.offset().left,
        top: $id.innerHeight()
    });
    $id.on({
        click: function () {
            Sys.toggleMenu($menu, $id);
        },
        mouseenter: function () {
            if (Sys.show_menu) {
                $('.menu-unit').hide();
                $('.menu-bar').removeClass('ui-state-active');
                $menu.show();
                $id.addClass('ui-state-active');
            }
        }
    });
};

/**
 * ドロップダウンメニュー表示切替
 * @param {jQuery} $menu
 * @param {jQuery} $id
 */
Sys.toggleMenu = function ($menu, $id) {
    if (Sys.show_menu) {
        Sys.closeMenu();
    } else {
        Sys.show_menu = true;
        Sys.overlay(SysCst.Z_MENU_OVERLAY);
        Sys.$overlay_modal.mousedown(function () {
            Sys.closeMenu();
        });
        $('.menu-unit').hide();
        $menu.show();
        $id.addClass('ui-state-active');
    }
};

/**
 * ドロップダウンメニュー非表示
 */
Sys.closeMenu = function () {
    if (Sys.show_menu) {
        Sys.show_menu = false;
        Sys.removeOverlay();
        $('.menu-unit').hide();
        $('.menu-bar').removeClass('ui-state-active');
    }
};

/**
 * ダイアログ移動領域をすべて再定義する。連続実行OK
 */
Sys.draggable = function () {
    clearTimeout(Sys.timer_draggable);
    Sys.timer_draggable = setTimeout(function () {
        $('#panel-main > .ui-draggable').each(function () {
            Sys.draggableOn($(this));
        });
    }, 200);
};

/**
 * ダイアログ移動領域を定義する。
 * @param {jQuery} $dialog
 */
Sys.draggableOn = function ($dialog) {
    var cx1 = Sys.$panel_main.offset().left,
        cy1 = Sys.$panel_main.offset().top,
        ww = window.innerWidth,
        wh = window.innerHeight,
        cx2 = ww - 100,
        cy2 = wh - 100;
    if (cx2 < cx1) {
        cx2 = cx1;
    }
    if (cy2 < cy1) {
        cy2 = cy1;
    }
    $dialog.draggable('option', 'containment', [cx1, cy1, cx2, cy2]);
    var left = null;
    var top = null;
    if ($dialog.offset().left > cx2) {
        left = cx2;
    }
    if ($dialog.offset().top > cy2) {
        top = cy2;
    }
    if (left || top) {
        var o = {};
        if (left) {
            o.left = cx2;
        }
        if (top) {
            o.top = cy2;
        }
        $dialog.offset(o);
    }
};

/**
 * ajax通信を行う際は標準でこの関数を使用する。
 * @param {string} url 問い合わせ先
 * @param {Object} request 問い合わせパラメータ、省略可
 * @param {Object} option ajax通信の追加設定(jQuery仕様を参照)、省略可
 * @param {Object} func 認証エラー時の再呼び出し情報、省略可
 * @returns {$.Deferred} done()を追加して個別処理を書く
 */
Sys.ajax = function (url, request, option, func) {
    var data = {
        token: Sys.token,
        version: 1
    };
    if (request) {
        $.extend(data, request);
    }
    var settings = {
        url: url,
        method: 'POST',
        dataType: 'json',
        timeout: 60000,
        data: data
    };
    if (option) {
        $.extend(settings, option);
    }
    var defer = $.Deferred();
    $.ajax(settings)
        .done(function (res) {
            if (!res.state) {
                try {
                    res = JSON.parse(res);
                } catch (e) {
                    defer.resolve();
                    return;
                }
            }
            if (res.state == 'noauth') {
                if (func) {
                    Sys.noauth.push(func);
                }
                Sys.login();
            } else if (res.state == 'ok') {
                defer.resolve(res);
            } else {
                $.error(res);
                defer.reject(res.message);
            }
        })
        .fail(function (jqXHR) {
            console.error(jqXHR);
            if (jqXHR.status == 0) { // fail whatsup timeout
                defer.reject(jqXHR.statusText);
                return;
            }
            var msg = SysMsg.AJAX_POST + '\nurl: ' + url;
            $.error(msg);
            defer.reject(msg);
        });
    return defer.promise();
};

/**
 * div要素を作成してbodyに追加する。
 * @param {string} id 要素のid属性値
 * @returns {jQuery} 作成したオブジェクト
 */
Sys.div = function (id) {
    var $div = $('<div id="' + Sys.escapeHtml(id) + '"></div>');
    $('body').append($div);
    return $div;
};

/**
 * ログイン画面に移行
 */
Sys.login = function () {
    if (!Sys.show_login) {
        Sys.show_login = true;
        Sys.newToken();
        Sys.$login.slideDown(600);
    }
};

/**
 * ランダムな文字列を生成
 * @param {number} len 長さ
 * @param {string} src 使用文字の指定
 * @returns {string} 生成された文字列
 */
Sys.random = function (len, src) {
    if (src === void 0) {
        src = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }
    if (len === void 0) {
        len = 16;
    }
    var l = src.length;
    var p = '';
    for (var i = 0; i < len; ++i) {
        p += src.charAt(l * Math.random() | 0);
    }
    return p;
};

/**
 * Cookie値をセットする。
 * @param {string} key
 * @param {string} val
 */
Sys.cookie = function (key, val) {
    document.cookie = key + '=' + encodeURIComponent(val);
};

/**
 * 新しくtokenを発行してCookieにセットする。
 */
Sys.newToken = function () {
    Sys.token = Sys.random();
    Sys.cookie('token', Sys.token);
};

/**
 * データ更新情報の取得を開始する。
 * <p>アプリケーション開始時に呼び出す。</p>
 */
Sys.startWhatsUp = function () {
    var req = {
        last: Sys.last_whatsup
    };
    var opt = {
        dataType: 'text',
        timeout: 11 * 60 * 1000,
        xhrFields: {
            onloadstart: Sys.loadWhatsUp
        }
    };
    var me = {
        func: Sys.startWhatsUp
    };
    Sys.ajax('whatsup.php', req, opt, me).done(function () {
        setTimeout(function () {
            clearInterval(Sys.timer_whatsup);
            setTimeout(Sys.startWhatsUp, 1000);
        }, 1000);
    }).fail(function () {
        clearInterval(Sys.timer_whatsup);
        setTimeout(Sys.startWhatsUp, 1000);
    });
};

/**
 * 古くなった主キー情報をロードする。
 * <p>期限切れレコードはキャッシュから消去される</p>
 */
Sys.loadWhatsUp = function () {
    var xhr = this;
    var position = 0;
    Sys.loading_whatsup = false;
    Sys.timer_whatsup = setInterval(function () {
        if (Sys.loading_whatsup) {
            return;
        }
        Sys.loading_whatsup = true;
        var res_text = xhr.responseText;
        if (res_text.length > position) {
            var new_text = res_text.substring(position);
            position = res_text.length;
            var lines = new_text.split("\n");
            lines.forEach(function (line) {
                console.log(line);
                var res = JSON.parse(line);
                if (res.state == 'noauth') {
                    return;
                } else if (res.state != 'ok') {
                    $.error(res);
                    return;
                }
                Sys.last_whatsup = res.id;
                for (var table_id in res.expired) {
                    var pk_list = res.expired[table_id];
                    var cache = Sys.getCache(table_id);
                    for (var i = 0, l = pk_list.length; i < l; ++i) {
                        var pk_val_str = pk_list[i];
                        if (cache.records[pk_val_str]) {
                            cache.records[pk_val_str] = null;
                        }
                    }
                }
                var a = res.inserted;
                for (var i = 0, l = a.length; i < l; ++i) {
                    var table_id = a[i];
                    var cache = Sys.getCache(table_id);
                    cache.offset_map = {};
                }
                for (var key in Sys.dialogs) {
                    Sys.dialogs[key].receiver(res);
                }
            });
        }
        Sys.loading_whatsup = false;
    }, 200);
};

/**
 * ダイアログオープン時の左座標算出
 * @returns {number}
 */
Sys.dialogLeft = function () {
    return Math.random() *
        (window.innerWidth - Sys.$panel_main.offset().left) * 0.5;
};

/**
 * ダイアログオープン時の上座標算出
 * @returns {number}
 */
Sys.dialogTop = function () {
    return Math.random() *
        (window.innerHeight - Sys.$panel_main.offset().top) * 0.5;
};
