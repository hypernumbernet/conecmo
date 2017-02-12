/*!
 * index.js v0.0.0
 *
 * @author Tomohito Inoue <hypernumbernet@users.noreply.github.com>
 */

$(function () {
    $('#ajax_count_button').on({
        click: function () {
            var form = $('#ajax_count_form');
            console.log(form.serializeArray()[0]);
            $.post(
                form.attr('action'),
                form.serializeArray(),
                function (result) {
                    console.log(result);
                    var json = JSON.parse(result);
                    console.log(json);
                });

        }
    });
});
