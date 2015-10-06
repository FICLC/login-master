module.exports = (function(){
	return {
		insert: function(req, data, table, callback){
			// console.log("got here", req.body);
			req.getConnection(function(err, connection){
				connection.query('INSERT INTO ' + table + ' SET ?', data, function(err, rows){
					callback(err, rows);
				});
			});
		},
		find: function(req, table, callback){
			req.getConnection(function(err, connection){
				connection.query('SELECT * FROM ' + table, function(err, rows){
					callback(err, rows);
				});
			});
		},
		findOneById: function(req, table, uid, callback){
			req.getConnection(function(err, connection){
				connection.query('SELECT * FROM ' + table + ' WHERE id=' + uid, function(err, rows){
					callback(err, rows[0]);
				});
			});
		},
		findOneByEmail: function(req, table, email, callback){
			req.getConnection(function(err, connection){
				connection.query('SELECT * FROM ' + table + ' WHERE email = ?', email, function(err, rows){
					if (err)
						callback(err, null);
					else
						callback(err, rows[0]);
				});
			});
		},
		save: function(req, table, uid, data, callback){
			req.getConnection(function(err, connection){
				connection.query('UPDATE ' + table + ' SET ? WHERE id=' + uid, data, function(err, rows){
					if (err)
						callback(err, -1);
					callback(err, rows.affectedRows);
				});
			});
		}
	};
})();