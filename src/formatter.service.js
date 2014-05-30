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