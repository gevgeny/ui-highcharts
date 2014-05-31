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