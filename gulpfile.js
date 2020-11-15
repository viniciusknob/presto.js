const { src, dest, series } = require('gulp');
const jsConcat = require('gulp-concat');
const jsMinify = require('gulp-minify');

const DIST_PATH = 'dist';

function concat() {
	return src([
		'src/js/presto.js',
		'src/js/sulamerica.js'
	])
	.pipe(jsConcat('presto.js'))
	.pipe(dest(DIST_PATH));
};

function minify() {
	return src([
		'dist/presto.js'
	])
	.pipe(jsMinify({
		ext: {
			min:'.min.js'
		}
	 }))
	 .pipe(dest(DIST_PATH));
};

exports.default = series(concat, minify);
