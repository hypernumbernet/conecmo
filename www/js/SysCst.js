/*!
 * Conecmo constant values namespace
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/**
 * システム定数
 * @namespace
 * @version v0.0.0
 */
var SysCst = {
    /**
     * ブロックキャッシュの読み込みを開始する数
     * @type number
     */
    CACHE_HOLD: 2,
    /**
     * 次へボタンを押下し続けた時の連続動作までの遅延
     * @type number
     */
    FIRST_DELAY: 500,
    /**
     * 次へボタンを押下し続けた時の連続動作の遅延
     * @type number
     */
    NEXT_DELAY: 0,
    TOUCH_DELAY: 300,
    UPDATE_DELAY: 100,
    DELAY_LOADING: 100,
    DELAY_WHATSUP: 2000,
    WIN_GAP: 30,
    NUM_CACHE_READ: 1000,
    MAX_OFFSET: 1000000,
    MAX_CACHE: 300000,
    Z_LOGIN: 90000,
    Z_ERR_DIALOG: 80001,
    Z_ERR_OVERLAY: 80000,
    Z_SYS_DIALOG: 72001,
    Z_SYS_OVERLAY: 72000,
    Z_MENU_BAR: 70001,
    Z_MENU_OVERLAY: 70000,
    Z_MENU_SIDE: 60000,
    Z_APP_TAB: 40000,
    Z_APP_DIALOG: 30000
};
//Object.freeze(SysCst);
