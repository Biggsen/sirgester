var gulp = require('gulp');
var gulpCopy = require('gulp-copy');

// fonts
gulp.task('fonts', function () {
  return gulp.src('bower_components/outline/fonts/*')
    .pipe(gulp.dest('fonts'));
});

gulp.task('default', function(){

});