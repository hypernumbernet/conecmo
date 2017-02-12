/*!
 * Conecmo data cache management class
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

/* global Sys, SysCst, SysMsg */

/**
 * DBデータキャッシュ
 * <pre>
 * テーブル、ビュー単位でキャッシュする。
 * 主キーの内容がオブジェクト識別子になる。
 * 主キーが複数ある場合は、それらを連結する。
 * </pre>
 * @constructor
 * @param {number} table_id アプリケーション設定でのテーブルid、ビューid
 * @version v0.0.0
 */
function SysCache(table_id) {
    /**
     * アプリケーション設定でのテーブルid、ビューid
     * @type number
     */
    this.table_id = table_id;
    /**
     * キャッシュ本体
     * @type Object
     */
    this.records = {};
    /**
     * 現在の検索条件とソート条件での並び順と主キーのマップ
     * @type Array.<string>
     */
    this.offset_map = {}; // TODO フォームクラスに移動
    /**
     * 検索条件
     * @type string
     */
    this.where = ''; // TODO フォームクラスに移動
    /**
     * ソート条件
     * @type Array.<string>
     */
    this.order = []; // TODO フォームクラスに移動
    /**
     * ブロックデータの取得中フラグ
     * @type boolean
     */
    this.loading = false;
    /**
     * ストックされているテーブル情報から主キーカラムを抽出
     * @type string
     */
    this.pk_col_arr = Sys.tables[table_id].pKColArr;
    /**
     * キャッシュブロック毎に、レコードデータを読んだ回数を記録する。
     * @type Array.<number>
     */
    this.count_load_record = {};
    /**
     * キャッシュブロック毎に、オフセットマップを読んだ回数を記録する。
     * @type Array.<number>
     */
    this.count_load_offset = {};
}

/**
 * 条件下の順位でデータを1件取得
 * @param {number} offset 順位
 * @returns {$.Deferred}
 */
SysCache.prototype.read = function (offset) {
    var _ = this;
    var defer = $.Deferred();
    if (offset > SysCst.MAX_OFFSET) {
        $.error(SysMsg.MAX_RECORD);
        defer.reject();
    } else {
        _.loadOffset(offset).done(function (pk_val_str) {
            if (_.loadRecord(pk_val_str, defer)) {
                _.callLoadBlock(offset);
            }
        }).fail(function () {
            defer.reject();
        });
    }
    return defer.promise();
};

/**
 * どの範囲のキャッシュを取得するかどうかを判断して取得を指示する。
 * @param {number} offset
 * @private
 */
SysCache.prototype.callLoadBlock = function (offset) {
    var _ = this;
    if (!Sys.load_block) {
        return;
    }
    var block_index = offset / SysCst.NUM_CACHE_READ | 0;
    if (!_.count_load_record[block_index]) {
        _.count_load_record[block_index] = 1;
    } else {
        ++_.count_load_record[block_index];
    }
    if (!_.loading && _.count_load_record[block_index] > SysCst.CACHE_HOLD) {
        _.loading = true;
        _.count_load_record[block_index] = 0;
        _.loadBlock(block_index);
    }
};

/**
 * 条件下の順位と主キーのマップを取得する
 * TODO フォームクラスに移動
 * @param {number} offset 順位
 * @param {number} limit 取得件数
 * @returns {$.Deferred}
 * @private
 */
SysCache.prototype.loadOffset = function (offset, limit) {
    var _ = this;
    var defer = $.Deferred();
    var pk_val_str = _.offset_map[offset];
    if (pk_val_str !== void 0) {
        defer.resolve(pk_val_str);
        return defer.promise();
    }
    if (!limit) {
        limit = SysCst.CACHE_HOLD + 1;
    }
    var req = {
        table: _.table_id,
        where: _.where,
        pk_col: JSON.stringify(_.pk_col_arr),
        order: JSON.stringify(_.pk_col_arr),
        limit: limit,
        offset: offset
    };
    _.ajaxOffset(defer, req);
    return defer.promise();
};

/**
 * @param {$.Deferred} defer
 * @param {Object} req
 * @private
 */
SysCache.prototype.ajaxOffset = function (defer, req) {
    var _ = this;
    var me = {
        func: _.ajaxOffset,
        that: _,
        args: arguments
    };
    Sys.ajax('offset.php', req, 0, me).done(function (res) {
        if (req.offset in res.map) {
            defer.resolve(res.map[req.offset]);
            for (var i in res.map) {
                _.offset_map[i] = res.map[i];
            }
            _.callLoadOffset(req.offset);
        } else {
            defer.reject();
        }
    }).fail(function () {
        defer.reject();
    });
};

/**
 * オフセットマップを追加取得するかどうかを判断して取得を指示する。
 * @param {number} offset
 * @private
 */
SysCache.prototype.callLoadOffset = function (offset) {
    var _ = this;
    if (!Sys.load_block) {
        return;
    }
    var block_index = offset / SysCst.NUM_CACHE_READ | 0;
    if (!_.count_load_offset[block_index]) {
        _.count_load_offset[block_index] = 1;
    } else {
        ++_.count_load_offset[block_index];
    }
    if (_.count_load_offset[block_index] > SysCst.CACHE_HOLD) {
        _.count_load_offset[block_index] = 0;
        _.loadOffset(block_index * SysCst.NUM_CACHE_READ, SysCst.NUM_CACHE_READ);
    }
};

/**
 * 指定主キーのデータを1件取得。即時実行用
 * @param {number|string} pk_val_str 主キー
 * @param {$.Deferred} defer 成功時レコードと主キー連結データを返す
 * @return {boolean} DBから読み込んだ場合はtrue、キャッシュから読み込むとfalse
 * @private
 */
SysCache.prototype.loadRecord = function (pk_val_str, defer) {
    var _ = this;
    var record = _.records[pk_val_str];
    if (record) {
        defer.resolve(record, pk_val_str);
        return false;
    }
    var req = {
        table: _.table_id,
        order: JSON.stringify(_.pk_col_arr),
        pk_val_str: pk_val_str
    };
    var me = {
        func: _.loadRecord,
        that: _,
        args: arguments
    };
    Sys.ajax('record.php', req, 0, me).done(function (res) {
        defer.resolve(res.record, pk_val_str);
        _.records[pk_val_str] = res.record;
    }).fail(function () {
        defer.reject();
    });
    return true;
};

/**
 * データを指定された範囲でキャッシュに読み込む。
 * @param {number} block_index ブロック番号
 * @private
 */
SysCache.prototype.loadBlock = function (block_index) {
    var _ = this;
    if (Object.keys(_.records).length > SysCst.MAX_CACHE) {
        return;
    }
    var offset = block_index * SysCst.NUM_CACHE_READ;
    var req = {
        table: _.table_id,
        where: _.where,
        pk_col: JSON.stringify(_.pk_col_arr),
        order: JSON.stringify(_.pk_col_arr),
        limit: SysCst.NUM_CACHE_READ,
        offset: offset
    };
    Sys.ajax('read.php', req).done(function (res) {
        var i = 0;
        for (var pk_val_str in res.records) {
            _.records[pk_val_str] = res.records[pk_val_str];
            _.offset_map[offset + i] = pk_val_str;
            ++i;
        }
    }).always(function () {
        _.loading = false;
    });
};
