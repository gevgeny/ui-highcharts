//!function () {
//
//
//    var applyFormatter = function (template, $scope) {
//        var childScope = $scope.$parent.$new(),
//            expression = $interpolate(template);
//
//        return function () {
//            var extendedScope = $.extend(childScope, this),
//                $html = $(expression(extendedScope));
//
//            // Highcharts formatter requires very simple html so get rid of angular generated stuff.
//            $html = $html.removeAttr('class');
//            $html.find('*').removeAttr('class');
//
//            return $('<div></div>').append($html).html();
//        };
//    };
//
//    var applyTooltipFormatter = function (options, template, $scope) {
//        $.extend(true, options, {
//            tooltip : {
//                formatter: applyFormatter(template, $scope)
//            }
//        });
//    };
//
//    var applyXAxisLabelFormatter = function (options, template, $scope) {
//        $.extend(true, options, {
//            xAxis: {
//                labels: {
//                    formatter: applyFormatter(template, $scope)
//                }
//            }
//        });
//    };
//
//    var applyYAxisLabelFormatter = function (options, template, $scope) {
//        $.extend(true, options, {
//            yAxis: {
//                labels: {
//                    formatter: applyFormatter(template, $scope)
//                }
//            }
//        });
//    };
//
//    var createDefaultOptions = function ($scope, $element, $attrs) {
//        var options = {
//            chart : { renderTo : $element[0] },
//            plotOptions : {}
//        };
//
//        if ($attrs.start && $attrs.end) {
//            $.extend(true, options, {
//                xAxis: {
//                    events: {
//                        setExtremes: function (event) {
//                            if ($scope.start !== event.min || $scope.end !== event.max) {
//                                $scope.start = event.min;
//                                $scope.end = event.max;
//                                $timeout(function() {
//                                    $scope.$apply();
//                                });
//                            }
//                        }
//                    }
//                }
//            });
//        }
//
//        if ($attrs.pointClick) {
//            $.extend(true, options.plotOptions, {
//                series: {
//                    point : {
//                        events: {
//                            click: function () {
//                                $scope.pointClick({ point : this });
//                            }
//                        }
//                    }
//                }
//            });
//        }
//
//        if ($attrs.legendItemClick) {
//            $.extend(true, options.plotOptions, {
//                series: {
//                    events: {
//                        legendItemClick: function () {
//                            $scope.legendItemClick({ series: this });
//                            return false;
//                        }
//                    }
//                }
//            });
//        }
//
//        return options;
//    };
//
//    var addLegendHover = function (chart, $element) {
//        $element.find('.highcharts-legend').on('mouseenter mouseleave', '.highcharts-legend-item', function (event) {
//            if (event.type === 'mouseenter') {
//                chart.series[$(this).index()].data[0].onMouseOver();
//            } else {
//                chart.series[$(this).index()].data[0].onMouseOut();
//            }
//        });
//    };
//
//    var watchDisabling = function (chart, $scope) {
//        $scope.$watch(function () {
//            return ($scope.series || []).map(function (value) { return value.disabled; });
//        }, function (disableFlags) {
//            if (disableFlags.length && disableFlags.some(function (value) { return value !== undefined; })) {
//                disableFlags.forEach(function (item, i) {
//                    var seriesName, series;
//
//                    if (item !== undefined) {
//                        seriesName = $scope.series[i].name;
//                        series = chart.series.filter(function (item) { return item.name === seriesName; })[0];
//
//                        if (series) {
//                            series.setVisible(!item, false);
//                        }
//                    }
//                });
//                chart.redraw();
//            }
//        }, true);
//    };
//
//
//
//    var applyFormatters = function ($scope, $transclude) {
//        var options = {},
//            tooltipTemplate = $transclude().filter('tooltip').html(),
//            xAxisLabelTemplate = $transclude().filter('x-axis-label').html(),
//            yAxisLabelTemplate = $transclude().filter('y-axis-label').html();
//
//        tooltipTemplate && applyTooltipFormatter(options, tooltipTemplate, $scope);
//        xAxisLabelTemplate && applyXAxisLabelFormatter(options, xAxisLabelTemplate, $scope);
//        yAxisLabelTemplate && applyYAxisLabelFormatter(options, yAxisLabelTemplate, $scope);
//
//        return options;
//    };
//
//    var directive = function (type) {
//        return ['$timeout', '$interpolate', function ($timeout, $interpolate) {
//            return {
//                restrict: 'EAC',
//                transclude: true,
//                replace: true,
//                template: '<div></div>',
//                scope: {
//                    options: '=?',
//                    series: '=',
//                    redraw: '=',
//                    loading: '=',
//                    start: '=',
//                    end: '=',
//                    pointClick: '&',
//                    legendItemClick: '&'
//                },
//                link: function ($scope, $element, $attrs, $ctrl, $transclude) {
//                    var defaultOptions = createDefaultOptions($scope, $element, $attrs),
//                        optionsWithFormatters = applyFormatters($scope, $transclude),
//                        chart;
//
//                    $scope.options = $scope.options || {};
//
//                    $.extend(true, $scope.options, optionsWithFormatters, defaultOptions);
//                    chart = new Highcharts[type]($scope.options);
//
//                    watchSeriesLength(chart, $scope);
//                    watchChartRedraw(chart, $scope, $attrs);
//                    watchDisabling(chart, $scope);
//                    watchLoading(chart, $scope);
//                    watchAxis(chart, $scope, 'xAxis');
//                    watchAxis(chart, $scope, 'yAxis');
//
//                    if ('trackTooltip' in $attrs) {
//                        addLegendHover(chart, $element);
//                    }
//
//                    if ($scope.start && $scope.end) {
//                        $scope.$watchCollection('[start, end]', function () {
//                            chart.xAxis[0].setExtremes($scope.start, $scope.end);
//                        });
//                    }
//                }
//            };
//        }];
//    };
//
//    angular.module('ui-highcharts')
//        .directive('uiChart', directive('Chart'))
//        .directive('uiStockChart', directive('StockChart'))
//        .directive('uiMap', directive('Chart'));
//}();
