angular.module('ui-highcharts', []);
angular.module('ui-highcharts').factory('$uiHighchartsAddWatchers', ['$uiHighchartsUtilsService', function (utils) {
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
    var watchSeriesLength = function (chart, $scope) {
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

    var watchDisabling = function (chart, $scope) {
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
    var watchChartRedraw = function (chart, $scope, $attrs) {
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
    var watchLoading = function (chart, $scope) {
        $scope.$watch('loading', function (loading) {
            if (loading) {
                chart.showLoading();
            } else {
                chart.hideLoading();
            }
        });
    };

    var watchAxis = function (chart, $scope, axis) {
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

    return function (chart, $scope, $attrs) {
        watchSeriesLength(chart, $scope);
        watchChartRedraw(chart, $scope, $attrs);
        watchDisabling(chart, $scope);
        watchLoading(chart, $scope);
        watchAxis(chart, $scope, 'xAxis');
        watchAxis(chart, $scope, 'yAxis');
    };
}]);
angular.module('ui-highcharts').factory('$uiHighchartsHandleAttrs', ['$timeout', function ($timeout) {
    var addTitle = function ($scope, $attrs) {
        if ($attrs.title) {
            $.extend(true, $scope.options, {
                title: {
                    text: $attrs.title
                }
            });
        }
    };

    var addSubtitle = function ($scope, $attrs) {
        if ($attrs.subtitle) {
            $.extend(true, $scope.options, {
                subtitle: {
                    text: $attrs.subtitle
                }
            });
        }
    };

    var addType = function ($scope, $attrs) {
        if ($attrs.type) {
            $.extend(true, $scope.options, {
                chart: {
                    type: $attrs.type
                }
            });
        }
    };
    
    var addPointEvent = function ($scope, $attrs, attr, event) {
        var plotOptions ;

        if (!$attrs[attr]) {
            return;
        }
        plotOptions = { series: { point : { events: { } } } };
        if (event === 'select' || event === 'unselect') {
            plotOptions.series.allowPointSelect = true;
        }
        plotOptions.series.point.events[event] = function () {
            $scope[attr]({ point : this });
            $timeout(function () { $scope.$apply(); });
        };
        $.extend(true, $scope.options.plotOptions, plotOptions);
    };

    var addStartEnd = function (chart, options, $scope, $attrs) {
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



    var addLegendItemClick = function ($scope, $attrs) {
        if ($attrs.legendItemClick) {
            $.extend(true, $scope.options.plotOptions, {
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

    var addLegendHover = function (chart, $element, $attrs) {
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

    return function ($scope, $attrs) {
        $scope.options.plotOptions = $scope.options.plotOptions || {};

        addTitle($scope, $attrs);
        addSubtitle($scope, $attrs);
        addType($scope, $attrs);

        // series events
        addLegendItemClick($scope, $attrs);

        // point events
        addPointEvent($scope, $attrs, 'pointClick', 'click');
        addPointEvent($scope, $attrs, 'pointSelect', 'select');
        addPointEvent($scope, $attrs, 'pointUnselect', 'unselect');
        addPointEvent($scope, $attrs, 'pointMouseout', 'mouseOut');
        addPointEvent($scope, $attrs, 'pointMousemove', 'mouseMove');
    };
}]);
angular.module('ui-highcharts').factory('$uiHighchartsInterpolateFormatters', ['$interpolate', function ($interpolate) {
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

    var applyTooltipFormatter = function (template, $scope) {
        $.extend(true, $scope.options, {
            tooltip : {
                formatter: applyFormatter(template, $scope)
            }
        });
    };

    var applyXAxisLabelFormatter = function (template, $scope) {
        $.extend(true, $scope.options, {
            xAxis: {
                labels: {
                    formatter: applyFormatter(template, $scope)
                }
            }
        });
    };

    var applyYAxisLabelFormatter = function (template, $scope) {
        $.extend(true, $scope.options, {
            yAxis: {
                labels: {
                    formatter: applyFormatter(template, $scope)
                }
            }
        });
    };

    return function ($scope, $content) {
        var tooltipTemplate = $content.filter('tooltip').html(),
            xAxisLabelTemplate = $content.filter('x-axis-label').html(),
            yAxisLabelTemplate = $content.filter('y-axis-label').html();

        tooltipTemplate && applyTooltipFormatter(tooltipTemplate, $scope);
        xAxisLabelTemplate && applyXAxisLabelFormatter(xAxisLabelTemplate, $scope);
        yAxisLabelTemplate && applyYAxisLabelFormatter(yAxisLabelTemplate, $scope);
    };
}]);
angular.module('ui-highcharts').service('$uiHighchartsUtilsService', function () {
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
