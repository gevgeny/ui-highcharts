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