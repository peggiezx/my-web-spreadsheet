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

  $scope.cells = [];
  for (let r = 0; r < 20; r++) {
    const rowArr = [];
    for (let c = 0; c < $scope.columns.length; c++) {
      rowArr.push({
        content: '',
        isNumeric: false,
        rawInput: '',
        displayValue:'',
        formula: null,
        references: [],
        coord: $scope.columns[c]+(r + 1),
      });
    }
    $scope.cells.push(rowArr)
  }

  $scope.onCellBlur = function($event, rowIndex, colIndex) {
    const cell = $scope.cells[rowIndex][colIndex]
    const text = $event.target.innerText.trim();

    cell.rawInput = text;

    if (text.startsWith('=')) {
      cell.isCalculated = true;
      cell.formula = text.slice(1).trim();
      cell.references = extractReferences(cell.formula);
      evaluateFormula(cell, $scope.cells);
      $event.target.innerText = cell.displayValue;

    } else {
      cell.isCalculated = false;
      cell.formula = null;
      cell.references = [];
      cell.displayValue = text;
      cell.isNumeric = checkIfNumeric(text);
      $event.target.innerText = cell.displayValue;

    }
  }

  $scope.onCellKeyDown = function($event) {
    if ($event.key === 'Enter') {
      $event.preventDefault();
      $event.target.blur();
    }
  }

  $scope.onCellFocus = function($event, rowIndex, colIndex) {
    const cell = $scope.cells[rowIndex][colIndex];

    if(cell.isCalculated) {
      $event.target.innerText = '='+cell.formula;
    }
  }

  //helper functions
  function checkIfNumeric(text) {
    const numericPattern=/^-?\d+(\.\d+)?$/;
    return numericPattern.test(text.trim());
  }

  function extractReferences(formulaString) {
    const regex = /[A-Z]\d+/g;
    const matches = formulaString.match(regex);
    return matches || []; 
  }

  function evaluateFormula(cell, cells) {
    // e.g. "A1+B2"
    let expression = cell.formula;

    cell.references.forEach(ref => { 
      const {r, c} = coordToIndex(ref);
      const refCell = cells[r][c];
      let refCellVal = parseFloat(refCell.displayValue) || 0;
      expression = expression.replace(ref, refCellVal);

    });

    try {
      const res = eval(expression);
      cell.displayValue = String(res);
      cell.isNumeric = checkIfNumeric(cell.displayValue);
    } catch(e) {
      cell.displayValue = '#ERROR';
      cell.isNumeric = false;
    }
  }

  function coordToIndex(ref) {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if(!match) {
      throw new Error(`Invalid coordinate string: "${coord}"`);
    }
    const lettersPart = match[1];
    const numbersPart = match[2];

    const colIndex = lettersPart.charCodeAt(0) - "A".charCodeAt(0);
    const rowIndex = parseInt(numbersPart, 10) - 1;

    return { r: rowIndex, c: colIndex};
  }

}]);
