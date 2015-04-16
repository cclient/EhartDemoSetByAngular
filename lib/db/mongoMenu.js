var pubConfigColl = require('./mongo').pubConfigColl();

exports.upsertMenu = function (menustring, callback) {
    pubConfigColl.update({_id:1}, menustring, {upsert: true}, callback);
}
exports.getMenu=function(callback){
    pubConfigColl.findOne({_id:1}, callback);
}

