var gulp = require('gulp'),
    concat = require('gulp-concat');

gulp.task('default', function() {
    gulp.src(['src/bootstrap.js',
        'src/extensions.service.js',
        'src/formatter.service.js',
        'src/utils.service.js',
        'src/watchHelper.service.js',
        'src/directive.js'
    ])
    .pipe(concat('ui-highcharts.js'))
    .pipe(gulp.dest('dist/'));
});