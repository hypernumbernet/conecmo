/*!
 * Conecmo command definition namespace
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global Sys, SysMsg, SysCst */

/**
 * システムコマンド定義
 * @namespace
 * @version v0.0.0
 */
var SysCmd = {};

/**
 * コマンドのイベントをセット
 */
SysCmd.set = function () {
    var $document = $(document);
    $('.command-table').on({
        click: function () {
            Sys.closeMenu();
            Sys.overlay(SysCst.Z_SYS_OVERLAY);
            var $dialog = Sys.div('admin-table');
            var buttons = {};
            buttons[SysMsg.DIALOG_OK] = function () {
                $dialog.dialog('close');
            };
            buttons[SysMsg.DIALOG_CANCEL] = function () {
                $dialog.dialog('close');
            };
            $dialog
                .dialog({
                    title: SysMsg.MENU_TABLE_TITLE,
                    closeText: SysMsg.DIALOG_CLOSE,
                    buttons: buttons,
                    close: function () {
                        $dialog.dialog('destroy');
                        $dialog.remove();
                        Sys.removeOverlay();
                    }
                })
                .parent().zIndex(SysCst.Z_SYS_DIALOG);
        }
    });
    $('.command-open-list').on({
        click: function () {
            Sys.closeMenu();
            if (Sys.$panel_list.is(':visible')) {
                Sys.$panel_list.hide();
                Sys.$panel_main.offset({
                    left: 0
                });
                $(this).text(SysMsg.MENU_LEFT_OPEN);
            } else {
                Sys.$panel_list.show();
                Sys.$panel_main.offset({
                    left: Sys.$panel_list.width()
                });
                $(this).text(SysMsg.MENU_LEFT_CLOSE);
            }
            Sys.draggable();
        }
    });
    $document.on('click', '.command-clone', function () {
        Sys.closeMenu();
        var d = Sys.getZMaxDialog();
        if (d !== void 0) {
            Sys.cloneForm(d.xml);
        }
    });
    $('.command-close-all').on({
        click: function () {
            Sys.closeMenu();
            for (var key in Sys.dialogs) {
                var c = Sys.dialogs[key].$content;
                if (c !== void 0) {
                    c.dialog('close');
                }
            }
        }
    });
    $('.command-open-window').on({
        click: function () {
            Sys.closeMenu();
            window.open(location.href, '_blank');
        }
    });
    $document.on('click', '.command-undo', function () {
        Sys.closeMenu();
        var d = Sys.getZMaxDialog();
        if (!d || !d.dirty) {
            return;
        }
        Sys.overlay(SysCst.Z_SYS_OVERLAY);
        var $dialog = Sys.div('confirm-dialog');
        var buttons = {};
        buttons[SysMsg.DIALOG_OK] = function () {
            $dialog.dialog('close');
            if (d.new_record) {
                d.newInput();
            } else {
                d.dataPut(Sys.getCache(d.table_id).records[d.pk_val_str]);
            }
            d.dirty = false;
            d.editing_id = 0;
        };
        buttons[SysMsg.DIALOG_CANCEL] = function () {
            $dialog.dialog('close');
        };
        $dialog.html(SysMsg.CONFIRM_UNDO)
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
