var mongoskin = require('mongoskin'),
	config = require('../../config'),
	db = {};

function getDb(MONGODB_URI) {
	if (!db[MONGODB_URI]) {
		db[MONGODB_URI] = mongoskin.db(MONGODB_URI + '?auto_reconnect=true&poolSize=3',
			{numberOfRetries: 1, retryMiliSeconds: 500, safe: true, native_parser: true},
			{socketOptions: {timeout: 5000}});
	}
	return db[MONGODB_URI];
}
exports.pubDimensionColl = function () {
	return getDb(config.MONGODB_REPORT).collection('pubDimension');
};

exports.pubConfigColl=function(){
    return getDb(config.MONGODB_CONFIG).collection('menu');
}