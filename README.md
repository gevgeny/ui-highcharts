#ui-highcharts

ui-highcharts provides AngularJS directives to create charts based on the [Highcharts](http://www.highcharts.com/) library.

##Example

Add `ui-highcharts` to dependencies of you module and some series to your controller.

```javascript
angular.module('myApp', ['ui-highcharts']).controller('ctrl', function ($scope) {
    $scope.data = [{
        name: 'percent values',
        data: [1.34, 22.3, 4.4, 8.55, 16.1, 3.2, 6.4]
    }];
});
```

Add one of directives to your html under the defined controller

```html
<ui-chart series="data" title="Sample Chart" subtitle="with percent values">
    <tooltip>
        <span>value is {{ point.y | number:0 }}%</span>
    </tooltip>
</ui-chart>
```

[Online demo](http://jsfiddle.net/gevgeny/LPVSz/)


