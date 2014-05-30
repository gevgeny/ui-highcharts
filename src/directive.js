!function () {

    var createDefaultOptions = function ($element) {
        return {
            chart : { renderTo : $element[0] }
        };
    };

    var createDirective = function (type) {
        return [ '_uiHighchartsWatchHelperService',  '_uiHighchartsFormatterService', '_uiHighchartsExtensionsService',
            function (watchHelper, formatter, extensions) {
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
                        legendItemClick: '&'
                    },
                    link: function ($scope, $element, $attrs, $ctrl, $transclude) {
                        var defaultOptions = { chart : { renderTo : $element[0] } },
                            optionsWithFormatters = formatter.applyFormatters($scope, $transclude),
                            chart;

                        $scope.options = $scope.options || {};

                        $.extend(true, $scope.options, optionsWithFormatters, defaultOptions);
                        chart = new Highcharts[type]($scope.options);

                        watchHelper.watchSeriesLength(chart, $scope);
                        watchHelper.watchChartRedraw(chart, $scope, $attrs);
                        watchHelper.watchDisabling(chart, $scope);
                        watchHelper.watchLoading(chart, $scope);
                        watchHelper.watchAxis(chart, $scope, 'xAxis');
                        watchHelper.watchAxis(chart, $scope, 'yAxis');

                        extensions.addLegendHover(chart, $element, $attrs);
                    }
                };
        }];
    };

    angular.module('ui-highcharts')
        .directive('uiChart', createDirective('Chart'))
        .directive('uiStockChart', createDirective('StockChart'))
        .directive('uiMap', createDirective('Chart'));
}();
