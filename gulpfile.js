// var gulp = require('gulp'),
// sass = require('gulp-sass'),
// postcss = require('gulp-postcss'),
// autoprefixer = require('autoprefixer'),
// cssnano = require('cssnano');

// gulp.task('sass',function(){
// var plugins = [
// autoprefixer({browsers: '> 1%, last 2 versions, Firefox ESR, Opera 12.1'}),
// cssnano()
// ];
// gulp.src('./webroot/scss/*.scss')
// .pipe(sass({
// outputStyle: 'compressed'
// }).on('error',sass.logError))
// .pipe(postcss(plugins))
// .pipe(gulp.dest('./webroot/css'));
// });
// gulp.task('default',function(){
// gulp.watch("./webroot/scss/*.scss",['sass']);
// });
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cssnano = require('gulp-cssnano')
gulp.task('sass', function() {
  gulp
    .src('./scss/*.scss')
    .pipe(
      sass({
        outputStyle: 'compact',
        sourceComments: false
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(cssnano())
    .pipe(gulp.dest('./cube-fast/css/'))
})
gulp.task('default', function() {
  gulp.watch('./scss/*.scss', ['sass'])
})
