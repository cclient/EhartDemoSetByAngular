exports.getMMDD = function (dt) {
	dt = dt || new Date();
	return ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2);
}
exports.getYYYYMMDD = function (date, spliter) {
	spliter = spliter != undefined ? spliter : '-';
	return date.getFullYear() + spliter
		+ ('0' + (date.getMonth() + 1)).slice(-2) + spliter
		+ ('0' + date.getDate()).slice(-2);
}

exports.getDate = function (dt) {
	dt = dt || new Date();

	var dateArr = [
		dt.getFullYear() ,
		dt.getMonth() + 1,
		dt.getDate()];
	return new Date(dateArr.join('-') + ' 0:0:0 GMT+0800 (CST)');
}

var mobileReg = /telecomMobile|sdk|sdkIOS|advMobile|wifi/i;
exports.getDspIDByType = function (type) {
	if (mobileReg.test(type)) {
		return 'f9885e811b6e66a9daed';
	} else {
		return 'c55b68a043fd00000000';
	}
}

if (!module.parent) {
	var a = exports.getDspIDByType('telecommobile');
	console.log(a);
}