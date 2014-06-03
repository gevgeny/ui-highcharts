angular.module('myApp', ['ui-highcharts']).controller('ctrl', function ($scope) {
    $scope.data = [{
        name : 'Rainfall',
        type : 'column',
        yAxis : 1,
        data : [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
    }, {
        name : 'Temperature',
        type : 'spline',
        data : [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
    }, {
        name : 'Sunshine',
        type : 'pie',
        data : [{
            y : 2020,
            name : 'Sunshine hours',
            sliced : true
        }, {
            y : 6740,
            name : 'Non sunshine hours (including night)',
            dataLabels: { enabled: false }
        }],
        center : [70, 45],
        size : 80
    }];

    $scope.options = {
        chart: {
            spacing: 40,
            height: 360
        },
        legend : {
            enabled : false
        },
        xAxis : [{
            categories : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }]
    };
});
