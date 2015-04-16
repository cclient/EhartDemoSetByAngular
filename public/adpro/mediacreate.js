/**
 * Created by cuidapeng on 14-12-3.
 */

var echarts;
var allchartjson = $.findChartJsons();
var allchartobj = [];
if (allchartjson) {
    for (var i = 0; i < allchartjson.length; i++) {
        var queryobj = $.createChartObj(allchartjson[i]);
        if (queryobj) allchartobj.push(queryobj);
    }
}

$(document).ready(function () {
    for (var i = 0; i < allchartobj.length; i++) {
        var queryobj = allchartobj[i];
        queryobj.iniDom('initest');
        queryobj.iniTable();
        queryobj.bindEvent();
    }
    $('#search').click(function () {
        $.Prompt("正在加载，请稍后");
        var alldate = $('#datepicker-calendar').DatePickerGetDate();
        var allmedianames = $("#myTags").tagit("assignedTags");
        for (var i = 0; i < allchartobj.length; i++) {
            var queryobj = allchartobj[i];
            queryobj.datebegin = alldate[0][0];
            queryobj.dateend = alldate[0][1];
            var ajaxurlpar = '?medianames=' + allmedianames;
            queryobj.loadData(ajaxurlpar);
        }
//        $.Prompt({close:true});
    });
    var lastcompletedata;
    //tags
    $("#myTags").tagit({
        beforeTagAdded: function (event, ui) {
            if (!lastcompletedata || lastcompletedata.indexOf(ui.tagLabel) == -1) {
                return false;
            }
        },
        autocomplete: {delay: 0, minLength: 2, source: function (request, response) {
            console.log(request);
            $.get('/media/ajaxautomedia', {input: request.term}, function (data, status) {
                    console.log(this);
                    lastcompletedata = data;
                    response(data);
                }
            );
        }}
    });
});
