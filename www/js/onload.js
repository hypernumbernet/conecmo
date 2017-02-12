/*!
 * Conecmo application start point and error management
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global SysCst, Sys, SysCmd, SysMsg */

$(function () {
    Sys.newToken();
    Sys.$panel_main = $('#panel-main');
    Sys.$panel_list = $('#panel-list');
    Sys.putMenu('file');
    Sys.putMenu('edit');
    Sys.putMenu('show');
    Sys.putMenu('win');
    $('.list-unit').accordion({
        animate: 50,
        heightStyle: 'content',
        collapsible: true
    });
    Sys.$panel_list.resizable({
        grid: [10, 0],
        handles: 'e',
        minWidth: 150,
        maxWidth: 1000,
        resize: function (event, ui) {
            Sys.$panel_main.offset({
                left: ui.size.width
            });
            Sys.draggable();
        }
    });
    $(window).on({
        resize: function () {
            Sys.draggable();
        },
        beforeunload: function () {
            if (false) { // TODO save all
                return SysMsg.CLOSE_WINDOW;
            }
        }
    });
    SysCmd.set();
    Sys.$login = $('#login-dialog');
    Sys.$login.find('form').submit(function () {
        var req = {};
        req.user = Sys.$login.find('input[name="user"]').val();
        req.pass = Sys.$login.find('input[name="pass"]').val();
        Sys.ajax('login.php', req).done(function (res) {
            if (!res.message) {
                Sys.show_login = false;
                Sys.$login.slideUp(600);
                for (var i = 0, l = Sys.noauth.length; i < l; ++i) {
                    var v = Sys.noauth[i];
                    v.func.apply(v.that, v.args);
                }
                Sys.noauth.length = 0;
            } else {
                $('#login-message').text(res.message);
            }
        }).fail(function (msg) {
            $('#login-message').html(Sys.escapeLiteral(msg));
        });
        return false;
    });
    Sys.putTables();
    Sys.putForms();
    Sys.startWhatsUp();
});

/**
 * エラーメッセージの処理
 * <pre>
 * モーダルダイアログを表示する。
 * jQuery error をオーバーライドする。
 * </pre>
 * @param {string|Object|Error} message
 */
$.error = function (message) {
    if (message instanceof Error) {
        console.error(message);
        message = message.name + '\n' + message.message;
    } else if (typeof message === 'object') {
        switch (message.state) {
            case 'error':
                message = message.message + '\n' +
                    SysMsg.ERR_CODE + ': ' + message.code;
                break;
            default:
                message = message.state;
        }
    }
    Sys.overlay(SysCst.Z_ERR_OVERLAY);
    if (Sys.show_error) {
        var $d = $('#err-dialog');
        $d.html(Sys.escapeLiteral(message) + '<br>' + $d.html());
        return;
    }
    Sys.show_error = true;
    var $err_dialog = Sys.div('err-dialog');
    var buttons = {};
    buttons[SysMsg.DIALOG_OK] = function () {
        $err_dialog.dialog('close');
    };
    var height = window.innerHeight / 2 | 0;
    $err_dialog
        .html(Sys.escapeLiteral(message))
        .dialog({
            title: SysMsg.ERR_DIALOG_TITLE,
            closeText: SysMsg.DIALOG_CLOSE,
            resizable: false,
            width: 600,
            buttons: buttons,
            position: {
                my: 'center center',
                at: 'center' + ' center-' + (height / 2 | 0)
            },
            close: function () {
                $err_dialog.dialog('destroy');
                $err_dialog.remove();
                Sys.show_error = false;
                Sys.removeOverlay();
            }
        })
        .parent().zIndex(SysCst.Z_ERR_DIALOG);
    $err_dialog.css('max-height', height + 'px');
};

window.onerror = function (msg, file, line, columnNo, errorObj) {
    var s = msg + '\n' + file + ':' + line + ', ' + columnNo;
    if (errorObj.stack) {
        console.error(errorObj.stack);
    }
    $.error(s);
    return true;
};
