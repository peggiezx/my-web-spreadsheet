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
    const key = $event.key;

    const currentCell = $event.target;
    const coord = currentCell.getAttribute("data-coord");
    const colLetter = coord.match(/[A-Z]+/)[0]; // match capital letters (col part)
    const rowNum = parseInt(coord.match(/\d+/)[0]);

    const colIndex = $scope.columns.indexOf(colLetter);
    const rowIndex = rowNum - 1;

    let targetRow = rowIndex;
    let targetCol = colIndex;

    if (key === "Enter") {
      $event.preventDefault();
      const nextRow = Math.min(rowIndex + 1, $scope.rows.length - 1);
      const nextCoord = $scope.columns[colIndex] + (nextRow + 1);
      const nextCell = document.querySelector(`[data-coord="${nextCoord}"]`);
      if (nextCell) {
        nextCell.focus();
      }
      return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      $event.preventDefault();
   
      if (key === "ArrowUp") targetRow = Math.max(0, rowIndex - 1);
      if (key === "ArrowDown") targetRow = Math.min($scope.rows.length - 1, rowIndex + 1);
      if (key === "ArrowLeft") targetCol = Math.max(0, colIndex  - 1);
      if (key === "ArrowRight") targetCol = Math.min($scope.columns.length - 1, colIndex + 1);

      const nextCoord = $scope.columns[targetCol] + (targetRow + 1);
      const nextCell = document.querySelector(`[data-coord="${nextCoord}"]`);
      if (nextCell) {
        nextCell.focus();
      }
    }
  }

  $scope.onCellFocus = function($event, rowIndex, colIndex) {
    const cell = $scope.cells[rowIndex][colIndex];

    if(cell.isCalculated) {
      $event.target.innerText = '='+cell.formula;
    }
  }

  $scope.resetSpreadsheet = function() {
    for (let r = 0; r < $scope.cells.length; r++) {
      for (let c = 0; c < $scope.cells[r].length; c++) {
        const cell = $scope.cells[r][c];
        cell.content = '';
        cell.rawInput = '';
        cell.displayValue = '';
        cell.formula = 'null';
        cell.references = [];
        cell.isNumeric = false;
        cell.isCalculated = false;

        const coord = cell.coord;
        const el = document.querySelector(`[data-coord="${coord}"]`);
        if (el) {
          el.innerText = '';
        }
      }
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
