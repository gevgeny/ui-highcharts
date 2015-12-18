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
  function highChartsManager(addWatchers, transclude, handleAttrs) {
    var service = {
      createInstance: createInstance,
    };

    return service;

    function createInstance(type, $element, $scope, $attrs, $transclude) {

      //compling options and transludes content.
      $scope.options = $.extend(true, $scope.options, { chart: { renderTo: $element[0] } });
      transclude($scope, $transclude());
      handleAttrs($scope, $attrs);

      //creates chart and watchers.
      var chart = new Highcharts[type]($scope.options);
      addWatchers(chart, $scope, $attrs);

      //adds chart reference to parent scope if chart attribute is provided.
      if ($attrs.chart && $scope.$parent) {
        if (!$scope.$parent[$attrs.chart]) {
          $scope.$parent[$attrs.chart] = chart;
        } else {
          throw new Error('A HighChart object with reference ' + $attrs.chart + ' has already been initialized.');
        }
      }
    }
  }
})();
