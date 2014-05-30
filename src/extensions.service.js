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