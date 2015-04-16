//var pubSettingColl = require('./mongo').pubSettingColl();
//
//exports.getSetting = function (pubID, callback) {
//	pubSettingColl.findOne({_id: pubID}, function (err, doc) {
//		if (doc) {
//			callback(err, doc);
//		} else {
//			pubSettingColl.findOne({_id: 'default'}, callback);
//		}
//	});
//}
//exports.updateSetting = function (pubID, updateObj, callback) {
//	pubSettingColl.findAndModify({_id: pubID}, [], {$set: updateObj}, {upsert: true, new: true}, callback);
//}
//
//exports.initSettingDb = function () {
//	var defaultDoc = {
//		"_id": "default",
//		"dsp": {
//			"default": {
//				"sharePercent": 67,
//				"maxEcpm": 2,
//				"minPv": 20000,
//				"isSkip": false
//			}
//		}
//	};
//	pubSettingColl.insert(defaultDoc, function () {
//	});
//}
//exports.getDefaultSetting = function (callback) {
//	exports.getSetting('default', callback);
//}
//exports.updateDefaultSetting = function (updateObj, callback) {
//	exports.updateSetting('default', callback);
//}