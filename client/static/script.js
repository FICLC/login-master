var DNA_app = angular.module('DNA_app', ['LocalStorageModule','ngRoute']);
//  config method to set up routing:
DNA_app.config(function ($routeProvider) {
	$routeProvider
		.when('/',{
			templateUrl: './index.html'
        })
        .otherwise({
        	redirectTo: '/'
        });
});

// ---------------------------
// User Factory
// ---------------------------
DNA_app.factory('UserFactory', function($http, $window) {
	var factory = {};
	var users = [];
	factory.getUsers = function(callback) {
		$http.get('/users').success(function(output) {
	        users = output;
	        // console.log('UserFactory getUsers() gave', output);
	        callback(output);
		});
    };
    factory.addUser = function(info, callback) {
    	$http.post('./users',info).success(function(output) {
	        callback();
	    }).error(function(reason){
	    	console.log("Error:" + reason);
	    	callback("error", reason);
	    });
	};
	factory.login = function(info, callback) {
	    $http.post('./login',info).success(function(output) {
	    	$window.location.href = output;
	    });
	}
	factory.requestPassword = function(email, callback){
		$http.post('/password/request',{email: email}).success(callback);
	}
	factory.resetPassword = function(user, password, callback){
		user.password = password;
		$http.post('/password/reset/complete', user).success(callback);
	}
	return factory;
});

// ---------------------------
// Message Factory
// ---------------------------
DNA_app.factory('MessageFactory', function($http) {
	var factory = {};
	var messages = [];
	factory.getMessages = function(callback) {
		$http.get('/messages').success(function(output) {
	        messages = output;
	        console.log('MessageFactory getMessages() gave', output);
	        callback(output);
		});
    };
    factory.addMessage = function(info, callback) {
    	$http.post('/messages',info).success(function(output) {
	        // console.log('factory', output);
	        messages.push(output);
	        callback(messages);
    	});
    };
    return factory;
});


// #########################
// Storage Controller
// #########################
DNA_app.controller('StorageController', function($scope, localStorageService){
    $scope.local_user = localStorageService.get('local_user');
    console.log('local user', $scope.local_user);
});

// #########################
// User Controller
// #########################
DNA_app.controller('UserController', function($scope, $window, UserFactory, $routeParams, localStorageService) {
	UserFactory.getUsers(function(data) {
		$scope.users = data;

		for(var user in $scope.users){
			if($scope.users[user]._id === $routeParams.id){
				$scope.currentUser = $scope.users[user];
				break;
			}
		}
		// console.log('array of user objects', $scope.users);
	});
	
	$scope.register_processing = false;
  	
	$scope.addUser = function() {
		$scope.register_processing = true;
	    // using Moment.js to format date
	    $scope.new_user.created_at = moment().format('MMMM Do, YYYY');
	    //console.log("right here",$scope.new_user);
	    UserFactory.addUser($scope.new_user, function(err, result) {
	    	$scope.register_processing = false;
	    	if (err){
	    		
	    	}else{
	    		$scope.new_user = {}; // this clears out the input fields
	    		$scope.registered = true;
	    	}
//	        $scope.users = data;  // data goes into the callback function
	        
//	        UserFactory.getUsers(function(data) {
//	        	$scope.users = data;
//	        });
	    });
    };

    $scope.login = function() {
    	// console.log("controller data", $scope.user_input);
        // local storage
    	localStorageService.set('local_user', $scope.user_input);
    	UserFactory.login($scope.user_input,function(data) {
    		console.log("factory data",data);
    		// $window = data;
    		$scope.login = data;
    		$scope.user_input = {};
    	});
    };
    
    $scope.request_password = function() {
    	$scope.user_input = localStorageService.get('local_user');
        var email = $scope.user_input.email;
        
        UserFactory.requestPassword(email, function(output){
        	$window.location.href = output;
        });
    }
});

// #########################
// Message Controller
// #########################
DNA_app.controller('MessageController', function($scope, MessageFactory, $routeParams) {
	MessageFactory.getMessages(function(data) {
		$scope.messages = data;
	});
	$scope.addMessage = function() {
	    // using Moment.js to format date
	    $scope.new_message.created_at = moment().format('MMMM Do, YYYY');
	    MessageFactory.addMessage($scope.new_message, function(data) {
	        $scope.messages = data;  // data goes into the callback function
	        $scope.new_message = {}; // this clears out the input fields
	        MessageFactory.getMessages(function(data) {
	        	$scope.messages = data;
	        });
	    });
    };

});


// #########################
// Login Controller
// #########################
DNA_app.controller('LoginController', function($scope, $window, $routeParams) {
	$scope.admin = function() {
		var login = prompt("Please enter the password");
		if(login === "hooray") {
			console.log("login successful");
			$window.location.href = '/static/admin.html';
		} else {
			console.log("login terminated");
		}
	};
});

//#########################
//Reset Controller
//#########################
DNA_app.controller('ResetController', function($scope, $location, $window, UserFactory) {
	$scope.reset = function() {
		UserFactory.resetPassword(user, $scope.user_input.password, function(output){
        	//$window.location.href = output;
			alert(output);
			$window.location.href = "../index.html";
        });
	};
});