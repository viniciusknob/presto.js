const { src, dest } = require('gulp');
const jsConcat = require('gulp-concat');

const DIST_PATH = 'dist';

function concat() {
	return src([
		'src/js/presto.js'
	])
	.pipe(jsConcat('presto.js'))
	.pipe(dest(DIST_PATH));
};

exports.default = concat;
