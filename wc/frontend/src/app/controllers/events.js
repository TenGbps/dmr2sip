'use strict';

angular.module('ac.controllers', ['ngRoute'])
.config(function($routeProvider) {
  $routeProvider
  .when('/events', {
    templateUrl: '/views/events.html',
    controller: 'EventCtrl'
  })
  .otherwise({
    redirectTo: '/events'
   });
})
.controller('EventCtrl', function($scope, $http) {
  BaseController('/api/events', 'event_id', $scope, $http);
});