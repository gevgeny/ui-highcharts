angular.module('ui-highcharts').service('_uiHighchartsUtilsService', function () {
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