var connection = require('express-myconnection');
var mysql = require('mysql');

module.exports = function(app){
	app.use(
	    connection(mysql,{
	        host    : 'localhost',
	        user    : 'root',
	        password: '123456789',
	        port    :  3306,
	        database: 'taxonomer'
	    }, 'request')
	);
};