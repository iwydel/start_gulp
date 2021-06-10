let preprocessor = 'scss';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const scss = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemins = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const browsersync = () => {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false,
    online: true
  })
}

const scripts = () => {
  return src([ 'app/js/app.js' ])
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest('dist/js/'))
  .pipe(browserSync.stream())
}

const styles = () => {
  return src(`app/${preprocessor}/main.${preprocessor}`)
  .pipe(eval(preprocessor)({
    outputStyle: "expanded"
  }))
  .pipe(dest('app/css'))
  .pipe(concat('main.min.css'))
  .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
  .pipe(cleancss(({ level: { 1: { specialComments: 0 } } })))
  .pipe(dest('dist/css'))
  .pipe(browserSync.stream())
}

const images = () => {
  return src('app/img/src/**/*')
  .pipe(newer('app/img/dest/'))
  .pipe(imagemins())
  .pipe(dest('app/img/dest/'))
}

const fonts = () => {
  src('app/fonts/**/*{ttf}')
  .pipe(ttf2woff())
  .pipe(dest('app/fonts/ready'))
  return src('app/fonts/**/*{ttf,woff,woff2,svg,eot}')
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts/ready'))
}

const cleanimg = () => {
  return del('app/img/dest/**/*', { force: true })
}

const cleanfont = () => {
  return del('app/fonts/ready', { forse: true })
}

const cleandist = () => {
  return del('dist/**/*', { force: true })
}

const build = () => {
  return src([
    'app/css/**/*.min.css',
    'app/js/**/*.min.js',
    'app/fonts/ready/**/*{woff, woff2}',
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
exports.cleanfont = cleanfont;
exports.cleandist = cleandist;
exports.build = series(cleandist, styles, cleanfont, fonts, scripts, cleanimg, images, build);
exports.default = parallel(styles, fonts, scripts, images, browsersync, startwatch);
