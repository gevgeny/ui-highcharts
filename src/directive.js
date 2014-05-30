!function () {

    var createDefaultOptions = function ($scope, $element, $attrs) {
        var options = {
            chart : { renderTo : $element[0] },
            plotOptions : {}
        };

        if ($attrs.start && $attrs.end) {
            $.extend(true, options, {
                xAxis: {
                    events: {
                        setExtremes: function (event) {
                            if ($scope.start !== event.min || $scope.end !== event.max) {
                                $scope.start = event.min;
                                $scope.end = event.max;
                                $timeout(function() {
                                    $scope.$apply();
                                });
                            }
                        }
                    }
                }
            });
        }

        if ($attrs.pointClick) {
            $.extend(true, options.plotOptions, {
                series: {
                    point : {
                        events: {
                            click: function () {
                                $scope.pointClick({ point : this });
                            }
                        }
                    }
                }
            });
        }

        if ($attrs.legendItemClick) {
            $.extend(true, options.plotOptions, {
                series: {
                    events: {
                        legendItemClick: function () {
                            $scope.legendItemClick({ series: this });
                            return false;
                        }
                    }
                }
            });
        }

        return options;
    };

    var addLegendHover = function (chart, $element) {
        $element.find('.highcharts-legend').on('mouseenter mouseleave', '.highcharts-legend-item', function (event) {
            if (event.type === 'mouseenter') {
                chart.series[$(this).index()].data[0].onMouseOver();
            } else {
                chart.series[$(this).index()].data[0].onMouseOut();
            }
        });
    };

    var createDirective = function (type) {
        var directive = function (watchHelper, formatter) {
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
                    var defaultOptions = createDefaultOptions($scope, $element, $attrs),
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

                    if ('trackTooltip' in $attrs) {
                        addLegendHover(chart, $element);
                    }

                    if ($scope.start && $scope.end) {
                        $scope.$watchCollection('[start, end]', function () {
                            chart.xAxis[0].setExtremes($scope.start, $scope.end);
                        });
                    }
                }
            };
        };

        directive.$inject = ['_uiHighchartsWatchHelperService', '_uiHighchartsFormatterService'];

        return directive;
    };

    angular.module('ui-highcharts')
        .directive('uiChart', createDirective('Chart'))
        .directive('uiStockChart', createDirective('StockChart'))
        .directive('uiMap', createDirective('Chart'));
}();
