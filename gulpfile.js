const { src, dest, series } = require("gulp");
const fs = require("fs");
const replace = require("gulp-replace");
const rename = require("gulp-rename");
const htmlMinify = require("gulp-htmlmin");
const cssConcat = require("gulp-concat-css");
const cssMinify = require("gulp-clean-css");
const jsConcat = require("gulp-concat");
const jsMinify = require("gulp-terser");

const DIST_PATH = "dist";
const BUILD_PATH = "build";

function _htmlMinify() {
  return src(["src/html/*"])
    .pipe(
      htmlMinify({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(dest(`${BUILD_PATH}/html`));
}

function _cssConcat() {
  return src(["src/css/*"])
    .pipe(cssConcat("presto.css"))
    .pipe(dest(`${BUILD_PATH}/css`));
}

function _cssMinify() {
  return src([`${BUILD_PATH}/css/presto.css`])
    .pipe(cssMinify())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(dest(`${BUILD_PATH}/css`));
}

function _minToJS(env) {
  return () =>
    src(`${DIST_PATH}/presto.js`)
      .pipe(replace("__env__", env))
      .pipe(
        replace(
          "__modal__",
          fs.readFileSync(`${BUILD_PATH}/html/modal.min.html`, "utf8")
        )
      )
      .pipe(
        replace(
          "__css__",
          fs.readFileSync(`${BUILD_PATH}/css/presto.min.css`, "utf8")
        )
      )
      .pipe(dest(DIST_PATH));
}

function _jsConcat() {
  return src([
    "src/js/presto.js",
    "src/js/helpers/dom.js",
    "src/js/helpers/clipboard.js",
    "src/js/helpers/commons.js",
    "src/js/helpers/fab.js",
    "src/js/helpers/modal.js",
    "src/js/helpers/snackbar.js",
    "src/js/helpers/style.js",
    "src/js/databases/indexeddb/client.js",
    "src/js/databases/indexeddb/models/*.js",
    "src/js/pages/sulamerica/*.js",
    "src/js/sulamerica.js",
    "src/js/pages/saudepetrobras/*.js",
    "src/js/saudepetrobras.js",
    "src/js/pages/canoasprev/*.js",
    "src/js/canoasprev.js",
    "src/js/pages/cabergs/*.js",
    "src/js/cabergs.js",
    "src/js/pages/contaagil/*.js",
    "src/js/contaagil.js",
    "src/js/main.js",
    "src/js/init.js",
  ])
    .pipe(jsConcat("presto.js"))
    .pipe(dest(DIST_PATH));
}

function _jsMinify() {
  return src(["dist/presto.js"])
    .pipe(jsMinify())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(dest(DIST_PATH));
}

const files = (env) => [
  _htmlMinify,
  _cssConcat,
  _cssMinify,
  _jsConcat,
  _minToJS(env),
  _jsMinify,
];

exports.default = series(...files("dev"));
exports.release = series(...files("prd"));
