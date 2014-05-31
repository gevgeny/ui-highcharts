var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish');

gulp.task('default', function() {
    gulp.src(['src/bootstrap.js',
        'src/addWatchers.js',
        'src/handleAttrs.js',
        'src/interpolateFormatters.js',
        'src/utils.js',
        'src/directive.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(concat('ui-highcharts.js'))
    .pipe(gulp.dest('dist/'));
});