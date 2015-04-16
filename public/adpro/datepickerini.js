/**
 * Created by cdpmac on 14/12/11.
 */

//jquery 兼容性问题，引的1.11没有curCSS方法，datapicker用的curCSS引的jq1.7
(function (Jquery) {
    Jquery.curCSS = Jquery.css;
    Date.prototype.toChineseDate = function () {
        return this.getFullYear() + '年' + (this.getMonth() + 1) + '月' + this.getDate() + '日';
    }
})($)
//$.curCSS=$.css;
$(document).ready(function () {
    /* Special date widget */
    var to = new Date();
    var from = new Date(to.getTime() - 1000 * 60 * 30 * 24 * 14);
    $('#datepicker-calendar').DatePicker({
        inline: true,
        date: [from, to],
        calendars: 3,
        mode: 'range',
        current: new Date(to.getFullYear(), to.getMonth() - 1, 1),
        onChange: function (dates, el) {
            $('#date-range-field span').text(dates[0].toChineseDate() + ' - ' + dates[1].toChineseDate());
        }
    });
    $('#date-range-field span').text(from.toChineseDate() + ' - ' + to.toChineseDate());
    $('html').click(function () {
        if ($('#datepicker-calendar').is(":visible")) {
            $('#datepicker-calendar').hide();
            $('#date-range-field a').html('&#9660;');
            $('#date-range-field').css({borderBottomLeftRadius: 5, borderBottomRightRadius: 5});
            $('#date-range-field a').css({borderBottomRightRadius: 5});
        }
    });
    // bind a click handler to the date display field, which when clicked
    // toggles the date picker calendar, flips the up/down indicator arrow,
    // and keeps the borders looking pretty
    $('#datepicker-calendar').toggle();
    $('#date-range-field').bind('click', function () {
        $('#datepicker-calendar').toggle();
        if ($('#date-range-field a').text().charCodeAt(0) == 9660) {
            // switch to up-arrow
            $('#date-range-field a').html('&#9650;');
            $('#date-range-field').css({borderBottomLeftRadius: 0, borderBottomRightRadius: 0});
            $('#date-range-field a').css({borderBottomRightRadius: 0});
        } else {
            // switch to down-arrow
            $('#date-range-field a').html('&#9660;');
            $('#date-range-field').css({borderBottomLeftRadius: 5, borderBottomRightRadius: 5});
            $('#date-range-field a').css({borderBottomRightRadius: 5});
        }
        return false;
    });
// stop the click propagation when clicking on the calendar element
    // so that we don't close it
    $('#datepicker-calendar').click(function (event) {
        event.stopPropagation();
    });
    $("#DateSelectBar a").click(function () {
        var jqdom = $(this);
        jqdom.css("background-color", "#73b1e0").css("color", "#fff");
        jqdom.siblings().css("background-color", "").css("color", "");
        var datetimeseljqdom = $("#datepicker-calendar");
        var seldatetype = jqdom.data("value");
        var dateranges = [];
        var endday = new Date();
        var beginday = new Date();
        if (seldatetype == 'time_today') {
        }
        if (seldatetype == 'time_yest') {
            beginday.addDays(-1);
            endday.addDays(-1);
        }
        if (seldatetype == 'time_week') {
            beginday.addDays(-7);
        }
        if (seldatetype == 'time_month') {
            beginday.addMonths(-1)
        }
        dateranges.push(beginday);
        dateranges.push(endday);
        $('#datepicker-calendar').DatePickerSetDate(dateranges, true)
        var dates = datetimeseljqdom.DatePickerGetDate()[0];
        $('#date-range-field span').text(dates[0].toChineseDate() + ' - ' + dates[1].toChineseDate());
    });
});