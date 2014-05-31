!function () {
    var createDirective = function (type) {
        return [ '$uiHighchartsAddWatchers',  '$uiHighchartsInterpolateFormatters', '$uiHighchartsHandleAttrs',
            function (addWatchers, interpolateFormatters, handleAttrs) {
                return {
                    restrict: 'EAC',
                    transclude: true,
                    replace: true,
                    template: '<div></div>',
                    scope: {
                        options: '=?',
                        series: '=',
                        redraw: '=',
                        loading: '=',
                        start: '=',
                        end: '=',
                        pointClick: '&',
                        pointSelect: '&',
                        pointUnselect: '&',
                        pointMouseout: '&',
                        pointMousemove: '&',
                        legendItemClick: '&'
                    },
                    link: function ($scope, $element, $attrs, $ctrl, $transclude) {
                        var chart;

                        $scope.options = $.extend(true, $scope.options, { chart : { renderTo : $element[0] } });
                        interpolateFormatters($scope, $transclude());
                        handleAttrs($scope, $attrs);
                        chart = new Highcharts[type]($scope.options);
                        addWatchers(chart, $scope, $attrs);
                    }
                };
        }];
    };

    angular.module('ui-highcharts')
        .directive('uiChart', createDirective('Chart'))
        .directive('uiStockChart', createDirective('StockChart'))
        .directive('uiMap', createDirective('Map'));
}();
