var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglifyjs'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    scripts = ['src/bootstrap.js', 'src/addWatchers.js', 'src/handleAttrs.js',  'src/interpolate.js', 'src/utils.js', 'src/directive.js' ],
    jsfiddleScripts = ['bower_components/jquery/dist/jquery.min.js', 'bower_components/angular/angular.min.js', 'bower_components/highstock-release/highstock.js', 'dist/ui-highcharts.min.js'];

gulp.task('dev', function() {
    gulp.src(scripts)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(concat('ui-highcharts.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify('ui-highcharts.min.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('jsfiddle', function() {
    gulp.src(jsfiddleScripts)
        .pipe(concat('jsfiddle-scripts.js'))
        .pipe(gulp.dest('./samples/'));
});

gulp.task('default', ['dev', 'jsfiddle']);