angular.module('ui-highcharts', []);
angular.module('ui-highcharts').service('_uiHighchartsExtensionsService', ['$timeout', function ($timeout) {
    this.addStartEnd = function (chart, options, $scope, $attrs) {
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
            $scope.$watchCollection('[start, end]', function () {
                chart.xAxis[0].setExtremes($scope.start, $scope.end);
            });
        }
    };

    this.addPointClick = function (options, $scope, $attrs) {
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
    };

    this.addLegendItemClick = function (options, $scope, $attrs) {
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
    };

    this.addLegendHover = function (chart, $element, $attrs) {
        if ('trackTooltip' in $attrs) {
            $element.find('.highcharts-legend').on('mouseenter mouseleave', '.highcharts-legend-item', function (event) {
                if (event.type === 'mouseenter') {
                    chart.series[$(this).index()].data[0].onMouseOver();
                } else {
                    chart.series[$(this).index()].data[0].onMouseOut();
                }
            });
        }
    };

}]);
angular.module('ui-highcharts').service('_uiHighchartsFormatterService', ['$interpolate', function ($interpolate) {
    var applyFormatter = function (template, $scope) {
        var childScope = $scope.$parent.$new(),
            expression = $interpolate(template);

        return function () {
            var extendedScope = $.extend(childScope, this),
                $html = $(expression(extendedScope));

            // Highcharts formatter requires very simple html so get rid of angular generated stuff.
            $html = $html.removeAttr('class');
            $html.find('*').removeAttr('class');

            return $('<div></div>').append($html).html();
        };
    };

    var applyTooltipFormatter = function (options, template, $scope) {
        $.extend(true, options, {
            tooltip : {
                formatter: applyFormatter(template, $scope)
            }
        });
    };

    var applyXAxisLabelFormatter = function (options, template, $scope) {
        $.extend(true, options, {
            xAxis: {
                labels: {
                    formatter: applyFormatter(template, $scope)
                }
            }
        });
    };

    var applyYAxisLabelFormatter = function (options, template, $scope) {
        $.extend(true, options, {
            yAxis: {
                labels: {
                    formatter: applyFormatter(template, $scope)
                }
            }
        });
    };

    this.applyFormatters = function ($scope, $transclude) {
        var options = {},
            tooltipTemplate = $transclude().filter('tooltip').html(),
            xAxisLabelTemplate = $transclude().filter('x-axis-label').html(),
            yAxisLabelTemplate = $transclude().filter('y-axis-label').html();

        tooltipTemplate && applyTooltipFormatter(options, tooltipTemplate, $scope);
        xAxisLabelTemplate && applyXAxisLabelFormatter(options, xAxisLabelTemplate, $scope);
        yAxisLabelTemplate && applyYAxisLabelFormatter(options, yAxisLabelTemplate, $scope);

        return options;
    };
}]);
angular.module('ui-highcharts').service('_uiHighchartsUtilsService', function () {
    /**
     * Debounce function by David Walsh (http://davidwalsh.name/javascript-debounce-function)
     * */
    this.debounce = function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) { func.apply(context, args); }
            }, wait);
            if (immediate && !timeout) { func.apply(context, args); }
        };
    };

    /**
     * Creates an array excluding all values of the provided arrays using selector.
     * */
    this.difference = function (array1, array2, selector) {
        return array1.filter(function (value1) {
            return array2.every(function (value2) {
                return selector(value1) !== selector(value2);
            });
        });
    };
});
angular.module('ui-highcharts').service('_uiHighchartsWatchHelperService', ['_uiHighchartsUtilsService', function (utils) {
    /**
     * Determine which series were added to the scope and add them to the chart.
     * */
    var addSeries = function (chart, allSeries) {
        var seriesToAdd = utils.difference(allSeries, chart.series, function (series) { return series.name; });

        seriesToAdd.forEach(function (series) {
            chart.addSeries(series, false);
        });
        chart.redraw();
    };

    /**
     *  Determine which series were removed from the scope and remove them from the chart.
     * */
    var removeSeries = function (chart, allSeries) {
        var chartSeries = chart.series.filter(function (series) { return series.name !== 'Navigator'; }),
            seriesToRemove = utils.difference(chartSeries, allSeries, function (series) { return series.name; });

        seriesToRemove.forEach(function (series) {
            series.remove(false);
        });
        chart.redraw();
    };

    var redraw = utils.debounce(function (chart, series) {
        chart.series.forEach(function(chartSeries, i) {
            if (series[i]) {
                chartSeries.setData(series[i].data, false);
            }
        });
        chart.redraw();
    }, 200);

    /**
     * Adds watcher for "series.length". We don't watch series deeply by performance reasons.
     * */
    this.watchSeriesLength = function (chart, $scope) {
        $scope.$watch('series.length', function (newLength, oldLength) {
            if (newLength === undefined) {
                return;
            }
            if ((newLength || 0) >= (oldLength || 0)) { // if some series were added to the scope
                addSeries(chart, $scope.series);
            } else if ((newLength || 0) < (oldLength || 0)) { // if some series were removed from the scope
                removeSeries(chart, $scope.series);
            }
        });
    };

    this.watchDisabling = function (chart, $scope) {
        $scope.$watch(function () {
            return ($scope.series || []).map(function (value) { return value.disabled; });
        }, function (disableFlags) {
            if (disableFlags.length && disableFlags.some(function (value) { return value !== undefined; })) {
                disableFlags.forEach(function (item, i) {
                    var seriesName, series;

                    if (item !== undefined) {
                        seriesName = $scope.series[i].name;
                        series = chart.series.filter(function (item) { return item.name === seriesName; })[0];

                        if (series) {
                            series.setVisible(!item, false);
                        }
                    }
                });
                chart.redraw();
            }
        }, true);
    };

    /**
     * Adds deep watcher for the "redraw" attr.
     * */
    this.watchChartRedraw = function (chart, $scope, $attrs) {
        $attrs.redraw && $scope.$watch('redraw', function(newVal) {
            if (newVal === undefined) {
                return;
            }
            redraw(chart, $scope.series);
        }, true);
    };

    /**
     * Adds watcher for the "loading" attr.
     * */
    this.watchLoading = function (chart, $scope) {
        $scope.$watch('loading', function (loading) {
            if (loading) {
                chart.showLoading();
            } else {
                chart.hideLoading();
            }
        });
    };

    this.watchAxis = function (chart, $scope, axis) {
        var axisOptions;
        $scope.$watch('options.' + axis, function (value, oldValue) {
            if (!value || value === oldValue) {
                return;
            }
            axisOptions = Array.isArray($scope.options[axis]) ? $scope.options[axis] : [$scope.options[axis]];
            chart[axis].forEach(function (axis, i) {
                console.log('update options', axisOptions[i]);
                axis.update(axisOptions[i]);
            });
        }, true);
    };
}]);
!function () {
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
