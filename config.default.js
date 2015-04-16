module.exports = {
	port : 9527,
	MONGODB_MYSQL_LOG : 'mongodb://127.0.0.1:27017/logAdmin',
    MONGODB_REPORT : 'mongodb://127.0.0.1:27017/report',
	statusCode: {
		success : 0,	//GET
		dbError : -1, //DB CONNECT ERROR
		paramasError : -2,	//PARAMS ERROR
		dataExist : 1	//DATA ALREADY EXIST
	}
}