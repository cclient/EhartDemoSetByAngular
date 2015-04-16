var $ipstatsTable = $("#ipstats_table");

$(function () {
    var table = $ipstatsTable.dataTable({
        // "processing": true,
        // "serverSide": true,
        "ajax": "/v1/ipstats",
        "columns": [
            { "data": "_id" },
            { "data": "province" },
            { "data": "city" },
            { "data": "count" }
        ]
    });
    table.on('xhr.dt', function (e, settings, json) {
        console.log(json)

    })


});