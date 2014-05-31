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