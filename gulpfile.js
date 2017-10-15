let gulp = require('gulp');
let source = require('vinyl-source-stream');
let print = require('gulp-print');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let rename = require('gulp-rename');
// let sass = require('gulp-sass');
let browserify = require('browserify');


gulp.task('default', ['transpile-js', 'bundle-js']);

// transpile es6
gulp.task('transpile-js', () => {
	return gulp.src([
			'client/public/assets/js/*.js'
		])
		.pipe(print())
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(uglify())
		.pipe(rename(path => path.extname = ".min.js"))
		.pipe(gulp.dest('client/public/assets/js/build/'));
});

// sass
gulp.task('sass', ()=>{
	return gulp.src('client/public/assets/styles/*.scss')
			   .pipe(sass())
			   .pipe(gulp.dest('client/public/assets/styles/css'));
});

// browserify bundle
gulp.task('bundle-js', ()=>{
	return browserify({
			entries: [
				'client/public/assets/js/build/run_test.min.js',
				'client/public/assets/js/build/edit_test.min.js'
			],
			debug: true
		})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('client/public/assets/js/build/'));
});

// listen on file change
gulp.task('watch', () => {
	// js
	gulp
		.watch('client/public/assets/js/*.js', ['transpile-js', 'bundle-js']);
	// s?css
//	gulp.watch('client/public/assets/styles/*.scss', ['sass']);
});

