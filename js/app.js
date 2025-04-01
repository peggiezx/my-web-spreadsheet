// Create an AngularJS module named "myApp"
var app = angular.module('myApp', []);

// Define a controller named "TableController"
app.controller('TableController', ['$scope', function($scope) {
  // Columns labeled A-H
  $scope.columns = ['A','B','C','D','E','F','G','H'];
  
  // Rows labeled 1-20
  // We'll just build an array of numbers [1..20]
  $scope.rows = [];
  for (let i = 1; i <= 20; i++) {
    $scope.rows.push(i);
  }

  // If you need more logic (e.g., dynamic cell data, formulas, etc.),
  // place it here or in additional functions on $scope.
}]);
