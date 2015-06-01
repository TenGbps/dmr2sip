'use strict';

angular.module('myApp.commutator',[])
.controller('CommutatorCtrl', function($scope, $http) {
    function state()
    {
	setTimeout(function() {
    	    $http.get('/api/commutator/state').success(function(data) {
	        $scope.state = data;
		state();
	    });
	},1000);
    }

    $scope.reload = function()
    {
	$http.post('/api/commutator/reload').success(function() { 
	    $scope.state = null;
	});
    }

    state();
});