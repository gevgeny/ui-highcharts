#ui-highcharts

ui-highcharts provides AngularJS directives to create charts based on the [Highcharts](http://www.highcharts.com/) library.

##Usage

Add `ui-highcharts` to dependencies of you module and some series to your controller.

```javascript
angular.module('myApp', ['ui-highcharts']).controller('ctrl', function ($scope) {
    $scope.data = [{
        name: 'percent values',
        data: [1.34, 22.3, 4.4, 8.55, 16.1, 3.2, 6.4]
    }];
});
```

Add one of ui-highcharts directives to your html under the defined controller

```html
<ui-chart series="data" title="Sample Chart" subtitle="with percent values">
    <tooltip>
        <span>value is {{ point.y | number:0 }}%</span>
    </tooltip>
</ui-chart>
```

[Online demo](http://jsfiddle.net/gevgeny/LPVSz/)

## Requirements

- JQuery
- Highcharts/HighStock/HighMaps
- AngularJS

## Features

### Directives
ui-highcharts provides 3 directives.

| HTML tag      | Example | Highcharts equivalent |
| ------------- |:-------:| ---------------------:|
| `<ui-chart>`  | [jsfiddle](http://jsfiddle.net/gevgeny/Mgm56/) | [Highcharts Demo](http://www.highcharts.com/demo) |
| `<ui-stock-chart>` | | [Highstock Demo](http://www.highcharts.com/stock/demo) |
| `<ui-map` |  | [Highmaps demo](http://www.highcharts.com/maps/demo) |

### Attributes
Highcharts features provided in the directive through set of attributes.

| Attribute             | Type     | Description                                   | Example                                           | Highcharts equivalent |
| ----------------------|----------|-----------------------------------------------|---------------------------------------------------|-----------------------|
| `options`             | `object` | Highcharts options object. Note that many of its properties are available through their own attributes and series must be defined through `series` attribute           | [jsfiddle](http://jsfiddle.net/gevgeny/8zBJL/)    | [Highcharts API ref](http://api.highcharts.com/highcharts) |
| `type`                | `string` | The default series type for the chart.        | [jsfiddle](http://jsfiddle.net/gevgeny/LPRLs/)    | [Highcharts API ref](http://api.highcharts.com/highcharts#chart.type) |
| `title`               | `string` | The title of the chart.        | [jsfiddle](http://jsfiddle.net/gevgeny/EtpLw/)    | [Highcharts API ref](http://api.highcharts.com/highcharts#title.text) |
| `subtitle`            | `string` | The subtitle of the chart.        | [jsfiddle](http://jsfiddle.net/gevgeny/EtpLw/)    | [Highcharts API ref](http://api.highcharts.com/highcharts#subtitle.text) |






    


