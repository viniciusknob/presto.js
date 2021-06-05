const { src, dest, series } = require('gulp');
const fs = require('fs');
const replace = require('gulp-replace');
const rename = require('gulp-rename');
const cssConcat = require('gulp-concat-css');
const cssMinify = require('gulp-clean-css');
const jsConcat = require('gulp-concat');
const jsMinify = require('gulp-minify');

const DIST_PATH = 'dist';
const BUILD_PATH = 'build';

function _cssConcat() {
    return src([
            'src/css/*',
        ])
        .pipe(cssConcat('presto.css'))
        .pipe(dest(`${BUILD_PATH}/css`));
}

function _cssMinify() {
    return src([
            `${BUILD_PATH}/css/presto.css`
        ])
        .pipe(cssMinify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(dest(`${BUILD_PATH}/css`));
}

function _minToJS() {
    return src(`${DIST_PATH}/presto.js`)
        .pipe(replace('__css__', fs.readFileSync(`${BUILD_PATH}/css/presto.min.css`, 'utf8')))
        .pipe(dest(DIST_PATH));
}

function _jsConcat() {
	return src([
		'src/js/presto.js',
		'src/js/analytics.js',
		'src/js/indexeddb.js',
		'src/js/style.js',
		'src/js/snackbar.js',
		'src/js/fab.js',
		'src/js/sulamerica.js',
		'src/js/saudepetrobras.js',
		'src/js/main.js',
		'src/js/init.js'
	])
	.pipe(jsConcat('presto.js'))
	.pipe(dest(DIST_PATH));
};

function _jsMinify() {
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

exports.default = series(
    _cssConcat,
    _cssMinify,
    _jsConcat,
    _minToJS,
    _jsMinify,
);
