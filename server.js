/** Dependencies **/
var express = require('express');
var router = express.Router();
var path = require("path");
var bodyParser = require('body-parser');

/** Setup **/
var app = express();
app.use(express.static(path.join(__dirname, "/client")));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//app.use(bodyParser.text({ type: 'text/html' }))

app.set('views', __dirname + '/client'); // general config
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

/** Requires **/
require('./config/sql.js')(app);
require('./config/routes.js')(app, router);

/** Port **/
app.listen(8000,function(){
	console.log("Listening on Port 8000");
});
