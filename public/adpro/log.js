var $logTable = $("#log_table");
var $modal = $("#removePubEnsure");
var $modalAddPub = $("#addPubId");
var $modalBtnEnsure = $(".btn-ensure");
var $btnAddPub = $(".btn-add-pub");
var $btnEnsureAddPub = $(".btn-addPubId");
var $pubIdInput = $("#pubIdInput");
var logLength = 0;
var logMaxNum = 15;

function renderPubs(items) {
    logLength = items.length;
    checkBtnAddPub();
    var $logTableBody = $logTable.find("tbody").first();
    for (var i = 0, len = items.length; i < len; i++) {
        (function (_i) {
            var item = items[i];
            createLogTd(item);
        })(i);
    }
}

function checkBtnAddPub() {
    if (logLength >= logMaxNum) {
        $btnAddPub.removeClass("btn-primary").addClass("disabled");
    } else {
        if (!$btnAddPub.hasClass("btn-primary")) {
            $btnAddPub.addClass("btn-primary").removeClass("disabled");
        }
    }
}

function createLogTd(data) {
    var $tr = $("<tr>");
    $("<td>" + data._id + "</td>").appendTo($tr);
    //$("<td>" + data.created.slice(0, data.created.indexOf("T")) + "</td>").appendTo($tr);
    $("<td>" + data.created + "</td>").appendTo($tr);
    var $tdRemove = $("<td></td>").appendTo($tr);
    var $removeSpan = $("<span>", {
        "class": "label label-danger",
        "text": "remove",
        click: function (argument) {
            $modal.modal('show');
            $modalBtnEnsure.unbind('click');
            $modalBtnEnsure.bind('click', function () {
                DeleteLogPub(data._id, function (success) {
                    if (success) {
                        $tr.remove();
                        --logLength;
                        checkBtnAddPub();
                    }
                });
            });
        }
    }).appendTo($tdRemove);

    $logTable.append($tr);
}

function DeleteLogPub(_id, callback) {
    if (!_id) return;
    $.ajax({
        type: "DELETE",
        url: "/v1/logs/" + _id,
        success: function (msg) {
            if (msg && msg.statusCode === 0) {
                return callback(true);
            }
            callback(false);
        }
    })
}

function bindAddPubEvent() {
    $btnAddPub.click(function (e) {
        if ($(this).hasClass('disabled')) {
            return false;
        }
        $modalAddPub.modal("show");
        $btnEnsureAddPub.unbind('click');
        $btnEnsureAddPub.bind('click', function () {
            var pubId = $pubIdInput.val().trim();
            if (pubId !== '') {
                insertPubId(pubId);
            }
            $modalAddPub.modal("hide");
        })
    })
}

function insertPubId(pubId) {
    $.post('/v1/log', {pubId: pubId}, function (msg) {
        if (msg && msg.statusCode === 0) {
            ++logLength;
            checkBtnAddPub();
            createLogTd(msg.content[0]);
        }
    })
}

function sortAndShowTime(items) {
    items.sort(function (a, b) {
        return new Date(a.created).getTime() - new Date(b.created).getTime();
    });
    items.forEach(function (value, index, array1) {
        var date = new Date(value.created).toLocaleString();
        value.created = date;
    });
}

$(function () {
    $.get('/v1/logs', function (msg) {
        if (msg && msg.statusCode === 0) {
            sortAndShowTime(msg.content)
            renderPubs(msg.content);
            bindAddPubEvent();
        }
    })
})