angular.module('ui-highcharts').factory('$uiHighchartsInterpolate', ['$compile', '$rootScope', function ($compile, $rootScope) {
    var applyFormatter = function (template, $scope) {
        var expression = $compile(template),
            childScore = $scope.$parent.$new();

        return function () {
            var extendedScope = $.extend(childScore, this),
                html = expression(extendedScope);

            // Very hacky way to avoid "$digest already in progress" error.
            $rootScope.$$phase = null;
            extendedScope.$apply();

            // Highcharts formatter requires very simple html so get rid of angular generated stuff.
            $html = $html.removeAttr('class');
            $html.find('*').removeAttr('class');

            return $('<div></div>').append($(html)).html();
        };
    };

    var applyTooltipFormatter = function (template, $scope) {
        $.extend(true, $scope.options, {
            tooltip : {
                useHTML : true,
                formatter: applyFormatter(template, $scope)
            }
        });
    };

    var interpolateAxis = function ($axis, $scope, axisName) {
        var options = { };

        options[axisName] = $axis.toArray().map(function (axis) {
            var axisOptions = { title : { }, labels : {} },
                $axis = $(axis), $labels = $(axis).find('labels');

            if ($axis.attr('title')) {
                axisOptions.title.text = $axis.attr('title');
            }

            if ($axis.attr('opposite') !== undefined && $axis.attr('opposite') !== "false") {
                axisOptions.opposite = true;
            }

            if ($labels) {
                axisOptions.labels.formatter = applyFormatter($labels.html(), $scope);
            }
            return axisOptions;
        });

        if ($scope.options[axisName]) {
            $scope.options[axisName] = Array.isArray($scope.options[axisName]) ? $scope.options[axisName] : [$scope.options[axisName]];
        }
        $.extend(true, $scope.options, options);
    };

    return function ($scope, $content) {
        var tooltipTemplate = $content.filter('tooltip').html(),
            $xAxis = $content.filter('x-axis'),
            $yAxis = $content.filter('y-axis');

        tooltipTemplate && applyTooltipFormatter(tooltipTemplate, $scope);
        $xAxis && interpolateAxis($xAxis, $scope, 'xAxis');
        $yAxis && interpolateAxis($yAxis, $scope, 'yAxis');
    };
}]);