//var mongoPubSetting = require('../db/mongoPubSetting');
//
//var defaultSetting = {
//	dsp: {}
//};
////exports.updateDspDefaultSetting = function (pubID, settingObj, callback) {
////	var updateObj = {
////		'dsp.default': settingObj
////	};
////	mongoPubSetting.updateSetting(pubID, updateObj, callback);
////}
////exports.getSetting = function (pubSetting, dspID) {
////	if (pubSetting && pubSetting.dsp && pubSetting.dsp[dspID]) {
////		return pubSetting.dsp[dspID];
////	} else if (pubSetting && pubSetting.dsp && pubSetting.dsp.default) {
////		return pubSetting.dsp.default;
////	} else if (defaultSetting && defaultSetting.dsp && defaultSetting.dsp[dspID]) {
////		return defaultSetting.dsp[dspID];
////	} else {
////		return defaultSetting.dsp.default;
////	}
////}
////
////exports.getSettingByPubID = function (pubID, callback) {
////	mongoPubSetting.getSetting(pubID, function (err, doc) {
////		if (err) {
////			callback(err);
////		} else {
////			callback(null, exports.getSetting(doc))
////		}
////	})
////}
