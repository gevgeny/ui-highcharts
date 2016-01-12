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
