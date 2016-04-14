angular.module('ui-highcharts').factory('$uiHighchartsAddWatchers', ['$uiHighchartsUtilsService', '$window', function (utils, $window) {

    /**
     *  Update the navigator when series are added/removed to the first visible serie (as per default)
     *  If series date interval changes, the navigator doesnt automaticly rerender with the new date interval.
     *  Thats why we need to manually rebind the data and redraw the navigator.
    */
    function _redrawNavigator(chart) {
        var navigator = _.find(chart.series, { name: 'Navigator' });
        if (navigator) {
            var firstVisibleSerie = _.find(chart.series, { visible: true });
            navigator.setData(firstVisibleSerie.options.data, true);
        }
    }

    /**
     * Determine which series were added to the scope and add them to the chart.
     * */
     var addSeries = function (chart, newSeries) {
         var seriesToAdd = utils.difference(newSeries, chart.series, function (series) { return series.name; });

         seriesToAdd.forEach(function (series) {
             chart.addSeries(series, false);
         });

         var chartSeries = chart.series.filter(function (series) { return series.name !== 'Navigator'; });

         chartSeries.forEach(function(existingSerie, i) {
             var updatedSerie = _.find(newSeries, 'name', existingSerie.name);

             if (updatedSerie) {
                 if (existingSerie.visible !== updatedSerie.visible) {
                     existingSerie.setVisible(updatedSerie.visible, false);
                 }

                 if (!angular.equals(existingSerie.options.data, updatedSerie.data)) {
                     existingSerie.setData(updatedSerie.data, false);
                 }

                 if (existingSerie.type !== updatedSerie.type) {
                     existingSerie.update({
                         type: updatedSerie.type
                     }, false);
                 }
            } else {
                existingSerie.remove();
            }
         });
         _redrawNavigator(chart);
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
        _redrawNavigator(chart);
        chart.redraw();
    };

    var redraw = utils.debounce(function (chart, series) {
        var chartSeries = chart.series.filter(function (series) { return series.name !== 'Navigator'; });
        chartSeries.forEach(function(serie, i) {
            if (series[i]) {
                serie.setData(series[i].data, false);
            }
        });
        _redrawNavigator(chart);
        chart.redraw();
    }, 200);

    /**
     * Adds watcher for "series.length". We don't watch series deeply by performance reasons.
     * */
     var watchSeriesLength = function (chart, $scope) {
         $scope.$watch('series', function(newSeries, oldSeries) {
             if (newSeries === undefined) {
                 return;
             }

             if (!oldSeries) {
                 oldSeries = {length: 0};
             }

             if ((newSeries.length || 0) >= (oldSeries.length || 0)) { // if some series were added to the scope
                 addSeries(chart, $scope.series);
             } else if ((newSeries.length || 0) < (oldSeries.length || 0)) { // if some series were removed from the scope
                 removeSeries(chart, $scope.series);
             }
         }, true);
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

    var watchResize = function(chart) {
        angular.element($window).on('resize', function() {
            console.log('chart will reflow due to window resize event');
            var newWidth = $window.innerWidth - 100 + 'px';
            angular.element(chart.container).css('width', newWidth);
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
        watchResize(chart);
    };
}]);
