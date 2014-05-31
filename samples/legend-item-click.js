angular.module('myApp', ['ui-highcharts']).controller('ctrl', function ($scope) {
    $scope.data = [{
        name: 'Powers of two',
        data: [0, 1, 2, 4, 8, 16, 32]
    },{
        name: 'Fibonacci Numbers',
        data: [1, 1, 2, 3, 5, 8, 13, 21]
    }];

    $scope.options = {
        tooltip: {
            shared: true
        }
    };

    $scope.legendItemClick = function (series) {
        alert(series.name);
    };
});
