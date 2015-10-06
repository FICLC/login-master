module.exports = function(app, router){
	var controller = require('./../server/controllers/controller.js')(app);

	router.get('/users',function(req,res){
		controller.show(req,res);
	});
	router.post('/users',function(req,res){
		controller.add(req,res);
	});
	router.post('/login',function(req,res) {
		controller.login(req,res);
	});
	router.get('/user/activate', function(req, res){
		controller.activate(req, res);
	});
	router.post('/password/request', function(req, res){
		controller.request_password(req, res);
	});
	router.get('/password/reset', function(req, res){
		controller.reset_password(req, res);
	});
	router.post('/password/reset/complete', function(req, res){
		controller.reset_password_complete(req, res);
	});
	
	app.use('/subpath', router);
};