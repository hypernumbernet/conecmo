/*!
 * Conecmo parts namespace
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global Sys, SysMsg, SysCst */

/**
 * システムパーツ定義
 * @namespace
 * @version v0.0.0
 */
var SysParts = {
    count: 0,
    id: function () {
        return 'parts-' + (++SysParts.count);
    }
};

/**
 * スクロールバー抽象クラス
 * @constructor
 */
SysParts.ScrollBar = function () {
    var _ = this;
    _.callbackSlide = null;
    _.$body = $(_.html());
    _.$slide_area = _.$body.children('.slide-area');
    _.$slider = _.$slide_area.children('.slider');
    _.$slider.draggable({
        appendTo: _.$slide_area,
        axis: _.axis,
        containment: _.$slide_area,
        drag: function (e, ui) {
            _.callbackSlide(ui.position[_.root] / _.max());
        }
    });
};

(function (proto) {
    /**
     * スライダースライド時の動作定義
     * @param {Function} callback
     */
    proto.slide = function (callback) {
        var _ = this;
        _.callbackSlide = callback;
        return _;
    };
    /**
     * 前ボタンの動作定義
     * @param {Object} events
     */
    proto.prev = function (events) {
        var _ = this;
        _.$body.children('.prev').on(events);
        return _;
    };
    /**
     * 後ボタンの動作定義
     * @param {Object} events
     */
    proto.next = function (events) {
        var _ = this;
        _.$body.children('.next').on(events);
        return _;
    };
    /**
     * スライダー余白の動作定義
     * @param {Object} events
     */
    proto.page = function (events) {
        var _ = this;
        _.$body.on({
            mousedown: function (event) {
                if (event.target.className == _.cssClass
                    || event.target.className == 'slide-area') {
                    var left = _.$slide_area.offset().left | 0;
                    var top = _.$slide_area.offset().top | 0;
                    var width = _.$slide_area.width();
                    var height = _.$slide_area.height();
                    events.start({
                        x: (event.pageX - left) / width,
                        y: (event.pageY - top) / height,
                        width: _.$slider.width() / width,
                        height: _.$slider.height() / height
                    });
                }
            },
            'mouseup touchend': function () {
                if (events.stop) {
                    events.stop();
                }
            },
            mouseout: function () {
                if (events.stop) {
                    events.stop();
                }
            }
        });
        return _;
    };
    /**
     * HTML定義体
     * @returns {string}
     */
    proto.html = function () {
        var _ = this;
        return '<div id="' + SysParts.id() + '" class="' + _.cssClass + '">' +
            '<div class="prev arrow"><i class="' + _.cssPrev + '"></i></div>' +
            '<div class="slide-area"><div class="slider"></div></div>' +
            '<div class="next arrow"><i class="' + _.cssNext + '"></i></div>' +
            '<div class="arrow"></div>' +
            '</div>';
    };
    /**
     * スクロール位置をスライダーに反映
     * @param {type} per
     * @returns {undefined}
     */
    proto.move = function (per) {
        var _ = this;
        var to = _.max() * per | 0;
        _.$slider.css(_.root, to + 'px');
    };
})(SysParts.ScrollBar.prototype);

/**
 * 水平スクロールバー
 * @constructor
 */
SysParts.SBHorizontal = function () {
    var _ = this;
    _.cssClass = 'sb-horizontal';
    _.cssPrev = 'fa fa-angle-left';
    _.cssNext = 'fa fa-angle-right';
    _.root = 'left';
    _.axis = 'x';
    SysParts.ScrollBar.call(_);
};

(function (proto) {
    proto.__proto__ = SysParts.ScrollBar.prototype;
    /**
     * スライド最大値
     * @returns {number}
     */
    proto.max = function () {
        var _ = this;
        return _.$slide_area.width() - _.$slider.width();
    };
})(SysParts.SBHorizontal.prototype);

/**
 * 垂直スクロールバー
 * @constructor
 */
SysParts.SBVertical = function () {
    var _ = this;
    _.cssClass = 'sb-vertical';
    _.cssPrev = 'fa fa-angle-up';
    _.cssNext = 'fa fa-angle-down';
    _.root = 'top';
    _.axis = 'y';
    SysParts.ScrollBar.call(_);
};

(function (proto) {
    proto.__proto__ = SysParts.ScrollBar.prototype;
    /**
     * スライド最大値
     * @returns {number}
     */
    proto.max = function () {
        var _ = this;
        return _.$slide_area.height() - _.$slider.height();
    };
})(SysParts.SBVertical.prototype);

/**
 * データダイアログフッター構築
 * @constructor
 * @param {Object} dialog
 */
SysParts.Footer = function (dialog) {
    var _ = this;
    /**
     * 次へボタン押下状態フラグ
     * @type boolean
     */
    _.next = false;
    /**
     * 戻るボタン押下状態フラグ
     * @type boolean
     */
    _.prev = false;
    /**
     * データ送りボタン用タイマー
     * @type number
     */
    _.timer = null;
    _.$body = $(_.html());
    _.$status = _.$body.children('.footer-status');
    _.$current = _.$body.children('.footer-current');
    _.$body.children('.footer-prev').on({
        mousedown: function () {
            _.prev = true;
            dialog.dataUpdate(function () {
                dialog.dataPrev();
            });
        },
        'mouseup touchend': function () {
            _.prev = false;
            clearTimeout(_.timer);
        },
        mouseout: function () {
            _.prev = false;
            clearTimeout(_.timer);
        }
    });
    _.$body.children('.footer-next').on({
        mousedown: function () {
            _.next = true;
            dialog.dataUpdate(function () {
                dialog.dataNext();
            });
        },
        'mouseup touchend': function () {
            _.next = false;
            clearTimeout(_.timer);
        },
        mouseout: function () {
            _.next = false;
            clearTimeout(_.timer);
        }
    });
    _.$body.children('.footer-first').mousedown(function () {
        dialog.dataUpdate(function () {
            if (dialog.count == 0 && !dialog.new_record) {
                return;
            }
            dialog.setOffset(0);
            dialog.dataRead();
        });
    });
    _.$body.children('.footer-last').mousedown(function () {
        dialog.dataUpdate(function () {
            if (dialog.count == 0 && !dialog.new_record) {
                return;
            }
            dialog.setOffset(dialog.count - 1);
            dialog.dataRead();
        });
    });
    _.$body.children('.footer-new').mousedown(function () {
        dialog.dataUpdate(function () {
            dialog.newInput();
        });
    });
    _.$body.children('.footer-delete').mousedown(function () {
        if (dialog.count == 0 && !dialog.new_record) {
            return;
        }
        dialog.dataDelete();
    });
    _.$body.children('.footer-save').mousedown(function () {
        if (!dialog.dirty) {
            return;
        }
        if (dialog.count == 0 && !dialog.new_record) {
            return;
        }
        dialog.dataUpdate(function () {
            dialog.new_record = false;
            _.$status.text(SysMsg.DONE_SAVE);
        });
    });
    _.$current.on({
        input: function () {
            _.$status.text('');
            var val = parseInt(_.$current.val(), 10);
            if (isNaN(val)) {
                _.$status.text(SysMsg.INPUT_NUMBER);
                return;
            }
            if (val < 1 || val > dialog.count) {
                _.$status.text(SysMsg.OUT_OF_RANGE);
                return;
            }
            dialog.dataUpdate(function () {
                dialog.setOffset(val - 1);
                dialog.dataRead();
            });
        },
        blur: function () {
            _.putCurrent(dialog);
            _.$status.text('');
        },
        mousewheel: function (event) {
            if (event.deltaY < 0) {
                dialog.dataUpdate(function () {
                    dialog.dataNext();
                });
            } else if (event.deltaY > 0) {
                dialog.dataUpdate(function () {
                    dialog.dataPrev();
                });
            }
        }
    });
};

(function (proto) {
    /**
     * フッターHTML
     * @returns {string}
     */
    proto.html = function () {
        return '<div class="form-footer ui-helper-clearfix">' +
            '<button class="button footer-first" value="" title="' +
            SysMsg.COMMAND_FIRST + '"><i class="fa fa-fast-backward"></i></button>' +
            '<button class="button footer-prev" value="" title="' +
            SysMsg.COMMAND_PREV + '"><i class="fa fa-backward"></i></button>' +
            '<input class="footer-current">' +
            '<span class="footer-count"></span>' +
            '<button class="button footer-next" value="" title="' +
            SysMsg.COMMAND_NEXT + '"><i class="fa fa-forward"></i></button>' +
            '<button class="button footer-last" value="" title="' +
            SysMsg.COMMAND_LAST + '"><i class="fa fa-fast-forward"></i></button>' +
            '<button class="button footer-new" value="" title="' +
            SysMsg.COMMAND_NEW + '">+</button>' +
            '<button class="button footer-delete" value="" title="' +
            SysMsg.COMMAND_DELETE + '">-</button>' +
            '<button class="button command-undo" value="" title="' +
            SysMsg.COMMAND_UNDO + '"><i class="fa fa-undo"></i></button>' +
            '<button class="button command-clone" value="" title="' +
            SysMsg.COMMAND_CLONE + '"><i class="fa fa-clone"></i></button>' +
            '<button class="button footer-save" value="" title="' +
            SysMsg.COMMAND_SAVE + '"><i class="fa fa-save"></i></button>' +
            '<span class="item footer-status"></span>' +
            '</div>';
    };

    /**
     * 現在のデータ位置表示
     * @param {object} dialog
     */
    proto.putCurrent = function (dialog) {
        var _ = this;
        if (dialog.count == 0 && !dialog.new_record) {
            _.$current.val('-');
        } else {
            _.$current.val(dialog.offset + 1);
        }
    };

    /**
     * データ数表示
     * @param {number} count
     */
    proto.putCount = function (count) {
        var _ = this;
        _.$body.children('.footer-count').text(' / ' + count);
    };
})(SysParts.Footer.prototype);
