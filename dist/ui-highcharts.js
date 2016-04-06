angular.module('ui-highcharts', []);
angular.module('ui-highcharts').factory('$uiHighchartsAddWatchers', ['$uiHighchartsUtilsService', '$window', function (utils, $window) {
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
        var chartSeries = chart.series.filter(function (series) { return series.name !== 'Navigator'; });
        chartSeries.forEach(function(serie, i) {
            if (series[i]) {
                serie.setData(series[i].data, false);
            }
        });
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

angular.module('ui-highcharts').factory('$uiHighchartsHandleAttrs', ['$timeout', function ($timeout) {
    var addTitle = function ($scope, $attrs, option) {
        var titleOptions = { };

        titleOptions[option] = {};
        $.extend(true, $scope.options, titleOptions);
        if ($attrs[option]) {
            $scope.options[option].text = $attrs[option];
        }
        if ($scope.options[option].text === undefined) {
            $scope.options[option].text = '';
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

        addTitle($scope, $attrs, 'title');
        addTitle($scope, $attrs, 'subtitle');
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
angular.module('ui-highcharts').factory('$uiHighchartsTransclude', ['$compile', '$rootScope', function ($compile, $rootScope) {
    var applyFormatter = function (template, $scope) {
        var expression = $compile(template),
            childScore = $scope.$parent.$new();

        return function () {
            var extendedScope = $.extend(childScore, this),
                $html = $(expression(extendedScope));

            // Very hacky way to avoid "$digest already in progress" error.
            $rootScope.$$phase = null;
            extendedScope.$apply();

            // Highcharts formatter requires very simple html so get rid of angular generated stuff.
            //$html = $html.removeAttr('class');
            //$html.find('*').removeAttr('class');

            return $('<div></div>').append($html).html();
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

        if ($xAxis.length) {
            interpolateAxis($xAxis, $scope, 'xAxis');
        }
        
        if ($yAxis.length) {
            interpolateAxis($yAxis, $scope, 'yAxis');
        }
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
!function() {
  var createDirective = function(type) {
    return ['$uiHighChartsManager',
            function(highChartsManager) {
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
                  legendItemClick: '&',
                },
                link: function($scope, $element, $attrs, $ctrl, $transclude) {
                  highChartsManager.createInstance(type, $element, $scope, $attrs, $transclude);
                },
              };
            },
     ];
  };

  angular.module('ui-highcharts')
      .directive('uiChart', createDirective('Chart'))
      .directive('uiStockChart', createDirective('StockChart'))
      .directive('uiMap', createDirective('Map'));
}();

(function() {
  'use strict';

  angular
      .module('ui-highcharts')
      .factory('$uiHighChartsManager', highChartsManager);

  highChartsManager.$inject = [
      '$uiHighchartsAddWatchers',
      '$uiHighchartsTransclude',
      '$uiHighchartsHandleAttrs',
  ];

  /* @ngInject */
  /* jshint -W003 */
  function highChartsManager(addWatchers, transclude, handleAttrs) {
    var service = {
      createInstance: createInstance,
    };

    return service;

    function createInstance(type, $element, $scope, $attrs, $transclude) { /* jshint ignore:line */

      //compling options and transludes content.
      $scope.options = $.extend(true, $scope.options, { chart: { renderTo: $element[0] } });
      transclude($scope, $transclude());
      handleAttrs($scope, $attrs);

      //creates chart and watchers.
      var chart = new Highcharts[type]($scope.options);
      addWatchers(chart, $scope, $attrs);

      //adds chart reference to parent scope if id attribute is provided.
      if ($attrs.id && $scope.$parent) {
        if (!$scope.$parent[$attrs.id]) {
          $scope.$parent[$attrs.id] = chart;
        } else {
          throw new Error('A HighChart object with reference ' + $attrs.chart + ' has already been initialized.');
        }
      }
    }
  }
})();
