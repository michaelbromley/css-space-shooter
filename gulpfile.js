/**
 * Created by Michael on 07/11/2014.
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var rename = require('gulp-rename');
var merge = require('merge-stream');


gulp.task('scripts', function() {

    return gulp.src([
        './scripts/!(game|controller|music)*.js',
        './scripts/music.js',
        './scripts/game.js',
        './scripts/controller.js'
    ])
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/assets/'));
});

gulp.task('less', function() {

    return gulp.src('./styles/app.less')
        .pipe(less())
        .pipe(gulp.dest('./styles'));
});

gulp.task('minify-css', ['less'], function() {

    return gulp.src('./styles/app.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('./dist/assets/'));
});

gulp.task('static-assets', function() {
   return gulp.src([
       './assets*/**/*',
       './vendor*/**/*'
   ])
       .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['less'], function() {

    var sourcesBuild = gulp.src([
        './scripts/!(game|controller|music)*.js',
        './scripts/music.js',
        './scripts/game.js',
        './scripts/controller.js',
        './styles/app.css'
    ], {read: false});


    return gulp.src('index.src.html')
        .pipe(inject(sourcesBuild, { addRootSlash: false }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./'));

});

gulp.task('inject-analytics', function() {

    return gulp.src('index.src.html')
        .pipe(inject(gulp.src(['./google-analytics.html']), {
            starttag: '<!-- inject:analytics -->',
            transform: function (filePath, file) {
                // return file contents as string
                return file.contents.toString('utf8')
            }
        }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('compile', ['scripts', 'minify-css', 'static-assets', 'inject-analytics'], function() {

    var sourcesDist = gulp.src([
        'assets/*.js',
        'assets/*.css'
    ], {read: false, cwd: 'dist'});

    var index = gulp.src('index.html', {cwd: 'dist'})
        .pipe(inject(sourcesDist, { addRootSlash: false }))
        .pipe(gulp.dest('dist'));

});

gulp.task('default', ['static-assets', 'build'], function() {
    console.log('Watching JS files...');
    console.log('Watching Less files...');
    console.log('Watching index.src.html...');
    gulp.watch('styles/*.less', ['less']);
    gulp.watch('index.src.html', ['build']);
    gulp.watch('scripts/*.js', ['scripts']);
});