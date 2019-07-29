/* eslint-disable prefer-destructuring */
/* eslint-disable radix */
import fs from 'fs';
import path from 'path';
import url from 'url';
import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import gulpLoad from 'gulp-load-plugins';
import webpack from 'webpack-stream';


import httpPlease from 'connect-http-please';
import serveStatic from 'serve-static';
import proxy from 'proxy-middleware';
import compass from 'compass-importer';

import middlewares from './middlewares';

// Global Config
const $ = gulpLoad();
const {
  vtex,
} = JSON.parse(fs.readFileSync('package.json'));

const jsFiles = [
  './src/assets/js/components/*.js',
  './src/assets/js/index.js',
];

function onError() {
  this.emit('end');
}

// Config - connect to VTEX
const accountName = vtex.store;
const version = vtex.version;
const environment = vtex.environment;
const portalHost = `${accountName}.${environment}.com.br`;
const imgProxyOptions = url.parse(`${vtex.protocol}://${accountName}.vteximg.com.br/arquivos`);
const portalProxyOptions = url.parse(`${vtex.protocol}://${portalHost}/`);

imgProxyOptions.route = '/arquivos';
portalProxyOptions.preserveHost = true;
portalProxyOptions.cookieRewrite = `${accountName}.vtexlocal.com.br`;

// Info in files - our mark in each file developer for us
const infoInFiles = `/**
 * Developer by ${vtex.team} <${vtex.website}>
 * Project Name: ${accountName}
 * Version: ${version}
 * Last update: @date <%= new Date() %>
 */\n\n`;


// GULP TASKS

// Connect to VTEX
gulp.task('connect', () => {
  $.connect.server({
    hostname: '*',
    port: 80,
    debug: false,
    // eslint-disable-next-line arrow-body-style
    middleware: () => {
      return [
        middlewares.disableCompression,
        middlewares.rewriteLocationHeader(environment),
        middlewares.replaceHost(portalHost),
        middlewares.replaceReferer(environment, vtex.protocol, portalHost),
        middlewares.replaceHtmlBody(environment, vtex.protocol),
        httpPlease({
          host: portalHost,
          verbose: true,
        }),
        serveStatic('./build'),
        proxy(imgProxyOptions),
        proxy(portalProxyOptions),
        middlewares.errorHandler,
      ];
    },
    livereload: true,
  });

  const openOptions = {
    uri: `http://${accountName}.vtexlocal.com.br/admin/Site/Login.aspx`,
    app: vtex.browser,
  };

  return gulp.src('./')
    .pipe($.open(openOptions));
});

// Clean files
gulp.task('clean', () => del(['build/', 'deploy/']));


// Handle with javascript
gulp.task('js', ['js:main', 'js:lint']);

gulp.task('js:main', () => gulp.src(jsFiles)
  .pipe(webpack({
    mode: 'development',
    output: {
      filename: `${vtex.prefix}-${vtex.store}-v-${version}.js`,
      path: path.resolve(__dirname, 'build/arquivos'),
    },
  }))
  .pipe(gulp.dest('./build/arquivos/'))
  .pipe($.connect.reload()));

gulp.task('js:lint', () => gulp.src(jsFiles)
  .pipe($.eslint())
  .pipe($.eslint.format()));

gulp.task('js:deploy', () => gulp.src('./build/arquivos/*.js')
  .pipe($.stripComments())
  .pipe(
    $.babel()
      .on('error', onError),
  )
  .pipe($.uglify())
  .pipe($.header(infoInFiles))
  .pipe(gulp.dest('./deploy/arquivos/'))
  .pipe($.connect.reload()));


// Handle with css
gulp.task('sass', () => gulp.src('./src/assets/scss/global.scss')
  .pipe(
    $.sass({
      importer: compass,
      sourceMap: true,
      sourceMapEmbed: true,
    })
      .on('error', onError),
  )
  .pipe($.concat(`${vtex.prefix}-${vtex.store}-v-${version}.css`))
  .pipe(gulp.dest('./build/arquivos/'))
  .pipe($.connect.reload()));

gulp.task('sass:checkout', () => gulp.src('./src/assets/scss/checkout-custom.scss')
  .pipe(
    $.sass({
      importer: compass,
      sourceMap: true,
      sourceMapEmbed: true,
    })
      .on('error', onError),
  )
  .pipe(gulp.dest('./build/arquivos/'))
  .pipe($.connect.reload()));

gulp.task('css', () => gulp.src('assets/scss/**/*.css')
  .pipe(gulp.dest('./build/arquivos/'))
  .pipe($.connect.reload()));

gulp.task('sass:deploy', () => gulp.src('build/arquivos/*.css')
  .pipe($.autoprefixer({
    browsers: ['last 99 versions'],
    cascade: false,
  }))
  .pipe(
    $.cssmin()
      .on('error', onError),
  )
  .pipe($.header(infoInFiles))
  .pipe(gulp.dest('./deploy/arquivos/')));

// Main tasks
gulp.task('watch', () => {
  const jsWatch = Object.assign([], jsFiles);

  gulp.watch(jsWatch, ['js']);
  gulp.watch(['./src/assets/scss/*.css'], ['css']);
  gulp.watch(['./src/assets/scss/**/*.scss'], ['sass']);
});

gulp.task('watch:checkout', () => {
  gulp.watch(['./src/assets/scss/*.css'], ['css']);
  gulp.watch(['./src/assets/scss/**/*.scss'], ['sass:checkout']);
});

// eslint-disable-next-line arrow-body-style
gulp.task('build', (done) => {
  return runSequence(['js', 'sass', 'css'], done);
});

// eslint-disable-next-line arrow-body-style
gulp.task('build:checkout', (done) => {
  return runSequence(['sass:checkout', 'css'], done);
});

// eslint-disable-next-line arrow-body-style
gulp.task('deploy', (done) => {
  return runSequence('clean', 'build', ['js:deploy', 'sass:deploy'], done);
});

// eslint-disable-next-line arrow-body-style
gulp.task('checkout', (done) => {
  return runSequence('clean', ['connect', 'build:checkout', 'watch:checkout'], done);
});

// eslint-disable-next-line arrow-body-style
gulp.task('checkout:deploy', (done) => {
  return runSequence('clean', 'build:checkout', 'sass:deploy', done);
});

// eslint-disable-next-line arrow-body-style
gulp.task('default', (done) => {
  return runSequence('clean', ['connect', 'build', 'watch'], done);
});
