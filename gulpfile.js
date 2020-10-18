let preprocessor = 'sass';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemins = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

const browsersync = () => {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    online: true
  })
}

const scripts = () => {
  return src([
    'app/js/app.js'

  ])
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js/'))
  .pipe(browserSync.stream())
}

const styles = () => {
  return src(`app/${preprocessor}/main.${preprocessor}`)
  .pipe(eval(preprocessor)())
  .pipe(concat('main.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
  .pipe(cleancss(({ level: { 1: { specialComments: 0 } } })))
  .pipe(dest('app/css'))
  .pipe(browserSync.stream())
}

const images = () => {
  return src('app/img/src/**/*')
  .pipe(newer('app/img/dest/'))
  .pipe(imagemins())
  .pipe(dest('app/img/dest/'))
}

const fonts = () => {
  return src('app/fonts/**/*{ttf,woff,woff2,svg,eot}')
  .pipe(browserSync.stream())
}

const cleanimg = () => {
  return del('app/img/dest/**/*', { force: true })
}

const cleandist = () => {
  return del('dist/**/*', { force: true })
}

const build = () => {
  return src([
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/fonts/**/*{ttf,woff,woff2,svg,eot}',
    'app/img/dest/**/*',
    'app/**/*.html',
  ], {base: 'app'})
  .pipe(dest('dist'));
}

const startwatch = () => {
  watch(`app/**/${preprocessor}/**/*`, styles);
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
  watch('app/**/*.html').on('change', browserSync.reload);
  watch('app/img/src/**/*', images);
  watch('app/fonts/**/*', fonts);
}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.cleanimg = cleanimg;
exports.cleandist = cleandist;
exports.build = series(cleandist, styles, fonts, scripts, images, build);
exports.default = parallel(styles, fonts, scripts, images, browsersync, startwatch)
