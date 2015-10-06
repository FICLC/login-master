var Query = require('./../../models/query.js'), request = require('supertest');
var activator = require('./activator.js'), fs = require('fs'), _ = require('lodash');
var templates = __dirname + '/templates/html', 
quote = function (regex) {
	/*jslint regexp:true */
	var ret = regex.replace(/([()[{*+.$^\\/\\|?])/g, '\\$1');
	/*jslint regexp:false */
	return(ret);
},
bodyMatcher = function (body,matcher) {
	/*jslint regexp:true */
	var ret = body.replace(/[\r\n]+/g,'').match(new RegExp(quote(matcher.replace(/[\r\n]+/g,'')).replace(/<%=[^%]+%>/g,'.*')));
	/*jslint regexp:false */
	return(ret);
},
users,
userModel = {
	find: function() {
		Query.findOneById.apply(this, arguments);
	},
	findByEmail: function() {
		Query.findOneByEmail.apply(this, arguments);
	},
	findBy: function() {
		Query.findOneByEmail.apply(this, arguments);
	},
	save: function () {
		Query.save.apply(this, arguments);
		/*if (id && users[id]) {
			_.extend(users[id],model);
			cb(null);
		} else {
			cb(404);
		}*/
	}
}, 
userModelEmail = _.extend({}, userModel, {find: function (login,cb) {
	this._find(login,function (err,res) {
		if (res && res.email) {
			res.funny = res.email;
			delete res.email;
		}
		cb(err,res);
	});
	}
}),
MAILPORT = 30111,
PORT = 30110,
URL = "http://localhost:"+PORT,
r = request(URL), 
url = "smtp://localhost:"+MAILPORT+"/gopickup.net/"+escape("GoPickup Test <test@gopickup.net>");

activator.init({user:userModel, url:url, templates:templates});

module.exports = {
	createActivate: function(req, userId, callback){
		req.activator = {id:userId};
		activator.createActivate(req, callback);
	},
	completeActivate: function(req, callback){
		activator.completeActivate(req, callback);
	},
	requestPassword: function(req, email, callback){
		req.email = email;
		activator.createPasswordReset(req, callback);
	},
	resetPassword: function(req, email, code, id, password, callback){
		req.email = email;
		req.code = code;
		req.id = id;
		req.password = password;
		
		activator.completePasswordReset(req, callback);
	}
};