var Query = require('./../models/query.js');
var crypto = require('crypto');
var path = require('path');
var activator_master = require('./../lib/activator/activator_master.js');
var fs = require('fs');

module.exports = function(app){
	return {
		show: function(req,res) {
			req.getConnection(function(err,connection){
				connection.query('SELECT * FROM users',function(err,rows){
					res.json(rows);
				});
			});
		},
		add: function(req,res){
			// MySQL Table
			var table = "users";
			var newUser = {
				first_name: (req.body.first_name).charAt(0).toUpperCase() + (req.body.first_name).slice(1),
				last_name: (req.body.last_name).charAt(0).toUpperCase() + (req.body.last_name).slice(1),
				email: (req.body.email).toLowerCase(),
				password: crypto.createHmac('sha1', 'idbydna').update(req.body.password).digest('hex'),
				created_at: req.body.created_at
			};

			// console.log("check password", newUser);

			var confirm = crypto.createHmac('sha1', 'idbydna').update(req.body.confirm).digest('hex')

			if(newUser.password === confirm) {
				Query.insert(req, newUser, table, function(err, results){
					// console.log("trying to insert...", err);
					
					if(err) return res.json(err);
					
					activator_master.createActivate(req, results.insertId, function(err, message){
						if(err == 200){//success
							res.json(message);
						}else{
							console.log(err);
							res.writeHead(err);
							res.end();
						}
					});
					
//					Query.find(req,table,function(err,results){
//						if(err) return res.json(err);
//						
//						res.json(results);
//					});
					
				});
			} else {
				console.log("ERROR: passwords didn't match");
				res.send('/static/login_confirm'+'.html');
			}


		},
		login: function(req,res) {
			var password = crypto.createHmac('sha1', 'idbydna').update(req.body.password).digest('hex');
			req.body.password = password;
		    var input = req.body;

		    console.log("got here", input);

		    req.getConnection(function(err, connection) {
		        // console.log("got connections",connection);
		        connection.query('SELECT * FROM users WHERE email = ?', input.email, function(err, rows) {
		          	
		            if (typeof rows[0] == 'undefined' || rows[0] == null) {
		                console.log("User doesn't exist: %s", err);
                        res.send('/static/login_user'+'.html');
		            } else {
		                if (input.password != rows[0].password) {
		                	console.log("password failed");
		                    res.send('/static/login_password'+'.html');
		                } else if (rows[0].activation_code != "X"){
		                	console.log("not activated", rows[0].activation_code);
		                    res.send('/static/login_inactive'+'.html');
		                } else {
		                	console.log("password success");
		                    res.send('/static/taxonomer'+'.html');
		                }
		            }
		        });
		    });
		},
		activate: function(req, res){
			var data  = {
					code: req.code,
					email: req.email,
					uid: req.user
			};
			
			activator_master.completeActivate(req, function(err, message){
				if(err == 200){//success
					res.render('./static/email_confirmed', {message: "Your email has been confirmed."});
				}else{
					res.render('./static/email_confirmed', {message: "Failed in email validation(" + message + ")"});
				}
			});
		},
		request_password: function(req, res){
			var input = req.body;

        	activator_master.requestPassword(req, input.email, function(err, message){
				if(err == 200){//success
					res.json('/static/login_password_request'+'.html');
				}else{
					console.log(err);
					res.json('/static/login_password'+'.html');
				}
			});
		},
		//render view
		reset_password: function(req, res){
			//res.sendFile(path.join(__dirname, "/../../client/static/password_reset/1/2"));
			
			res.render('./static/password_reset',{
				code: req.query.code,
				email: req.query.email,
				user: req.query.user
			});
		},
		//complete reset
		reset_password_complete: function(req, res){
			var input = req.body;
			
			//console.log("reset:", req);

        	activator_master.resetPassword(req, input.email, input.code, input.id, input.password, function(err, message){
				if(err == 200){//success
					res.send("Your password has been changed.");
				}else{
					res.send("Failed in resetting password(" + message + ")");
				}
			});
		}
	};
};