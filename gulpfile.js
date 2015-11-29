var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    browserSync = require('browser-sync');

/**
 * Default build task for development profile.
 */
gulp.task('default', ['styles']);

/**
 * Build SASS styles.
 */
gulp.task('styles', function() {
    return gulp.src('source/app/sass/*.scss').
        pipe(sass({
            includePaths: ['source']
        }).on('error', sass.logError)).
        pipe(autoprefixer()).
        pipe(gulp.dest('source/assets/css'));
});

/**
 * Check JS style.
 */
gulp.task('scripts', function() {
    return gulp.src('source/app/**/*.js').
        pipe(jshint({
            esnext: true
        })).
        pipe(jshint.reporter(stylish));
});

/**
 * Watch for changes.
 */
var watchTask = function() {
    gulp.watch('source/app/sass/**/*.scss', ['styles']);
    gulp.watch('source/app/**/*.js', ['scripts']);
};
gulp.task('watch', ['scripts', 'styles'], watchTask);

/**
 * Start HTTP server.
 */
gulp.task('serve', ['default'], function() {
    watchTask();
    browserSync({
        files: [ 'source/assets/css/*.css' ],
        startPath: '/index.html',
        server: {
            baseDir: 'source'
        },
        open: false
    });
});
