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
