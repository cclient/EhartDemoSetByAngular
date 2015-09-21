module.exports = {
	port : 9528,
    MONGODB_REPORT : 'mongodb://127.0.0.1:27019/report',
    MONGODB_CONFIG : 'mongodb://127.0.0.1:27019/config',
    statusCode: {
		success : 0,	//GET
		dbError : -1, //DB CONNECT ERROR
		paramasError : -2,	//PARAMS ERROR
		dataExist : 1	//DATA ALREADY EXIST
	}
}