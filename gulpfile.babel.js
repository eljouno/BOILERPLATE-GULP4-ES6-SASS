'use strict';

// Import plugins
import gulp from 'gulp';
import autoprefixer from 'autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import postcss from 'gulp-postcss';
import browserify from 'browserify';
import babelify from 'babelify';
import concat from 'gulp-concat';
import imagemin from 'gulp-imagemin';
import uglify from 'gulp-uglify';
import uglifycss from 'gulp-uglifycss';
import sass from 'gulp-sass';
import del from 'del';
import flexbug from 'postcss-flexbugs-fixes';
import plumber from 'gulp-plumber';
import gutil from 'gutil';
import browserSync from 'browser-sync';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const server = browserSync.create();


// Paths
const paths = {
    dest: {
        global: 'app/dist',
        assetsFolder: 'app/dist/assets'
    },
    src: {
        assets: 'app/assets/**',
        fonts: 'app/assets/fonts/**',
        img: 'app/assets/img/**/*',
        jsCode: ['app/js/**/*.js', '!app/js/{vendor,vendor/**}'],
        jsVendor: 'app/js/vendor/**/*.js',
        jsCustom: ['app/js/custom/**/*.js', 'app/js/app.js'],
        jsEntry: ['app/js/app.js'],
        scss: 'app/scss/**/*.scss',
        html: ['app/*.html'],
        templates: ['app/*.php', 'app/templates/*.php', 'app/templates/**/*.php', 'app/templates/**/*.html.twig', 'app/**/*.yml', 'app/*.html', 'app/**/*.html']
    },
    Dev: 'dev',
    Prod: 'prod',
    Dist: 'dist',
};

const FILENAMES = {
    jsCode: 'app.js',
    jsVendor: 'vendor.js'
};

// UTILS FUNCTIONS:
const catchJSErrors = (err) => {
    if (err instanceof SyntaxError) {
        gutil.log('Syntax Error');
        console.log(err.message);
        console.log(err.codeFrame);
    } else {
        gutil.log('Error', err.message);
    }
    this.emit('end');
}

const bundler = browserify({
    entries: paths.src.jsEntry,
    debug: true
});

const minifyImages = (env) => {
    if (env === paths.Prod) {
        return gulp.src(paths.src.img)
          .pipe(imagemin([
              imagemin.gifsicle({interlaced: true, optimizationLevel: 2}),
              imagemin.jpegtran({progressive: true}),
              imagemin.optipng({optimizationLevel: 4}),
              imagemin.svgo({
                  // https://github.com/svg/svgo#what-it-can-do
                  plugins: [
                      {removeViewBox: true},
                      {cleanupIDs: false}
                  ]
              })
          ], {
              verbose: false
          }))
          .pipe(gulp.dest(paths.dest.assetsFolder + '/img'));
    }
};

const copyAssets = (env) => {
    if (env === paths.Dev) {
        return gulp.src(paths.src.assets)
          .pipe(gulp.dest(paths.dest.assetsFolder));
    } else if (env === paths.Prod) {
        return gulp.src(paths.src.fonts)
          .pipe(gulp.dest(paths.dest.assetsFolder + '/fonts'));
    }
};


// COMPILATIONS
const js = (env) => {
    if (env === paths.Dev) {
        return bundler
          .transform('babelify', {presets: ['@babel/env']})
          .bundle()
          .on('error', catchJSErrors)
          .pipe(source(FILENAMES.jsCode))
          .pipe(buffer())
          .pipe(sourcemaps.init({loadMaps: true}))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest(paths.dest.global))
          .pipe(browserSync.stream());
    } else if (env === paths.Prod) {
        return bundler
          .transform('babelify', {presets: ['@babel/env']})
          .bundle()
          .on('error', catchJSErrors)
          .pipe(source(FILENAMES.jsCode))
          .pipe(buffer())
          .pipe(uglify())
          .pipe(gulp.dest(paths.dest.global))
    }

}

const jsVendor = (env) => {
    if (env === paths.Dev) {
        return gulp.src(paths.src.jsVendor)
          .pipe(concat(FILENAMES.jsVendor))
          .pipe(buffer())
          .pipe(gulp.dest(paths.dest.global))
          .pipe(browserSync.stream());
    } else if (env === paths.Prod) {
        return gulp.src(paths.src.jsVendor)
          .pipe(concat(FILENAMES.jsVendor))
          .pipe(buffer())
          .pipe(uglify())
          .pipe(gulp.dest(paths.dest.global))
    }
}

const css = (env) => {
    const postcssPlugins = [
        flexbug(),
        autoprefixer({
            overrideBrowserslist: ['last 2 version', 'ie 11'],
            flexbox: 'no-2009',
            grid: "autoplace"
        })
    ];
    if (env === paths.Dev) {
        return gulp.src(paths.src.scss)
          .pipe(plumber({
              errorHandler: function (err) {
                  notify.onError({
                      title: "Gulp error in " + err.plugin,
                      message: err.toString()
                  })(err);
              }
          }))
          .pipe(sourcemaps.init())
          .pipe(sass().on('error', sass.logError))
          .pipe(postcss(postcssPlugins))
          .pipe(sourcemaps.write('./'))
          .pipe(gulp.dest(paths.dest.global))
          .pipe(browserSync.stream());
    } else if (env === paths.Prod) {
        return gulp.src(paths.src.scss)
          .pipe(sass().on('error', sass.logError))
          .pipe(postcss(postcssPlugins))
          .pipe(uglifycss({
              "maxLineLen": 80,
              "uglyComments": true
          }))
          .pipe(gulp.dest(paths.dest.global))
    }
}

// CLEAN FOLDER DIST
function cleanDist() {
    return del(paths.dest.global, {force: true});
}

// Not exposed to CLI
const reload = (done) => {
    server.reload();
    done();
};

const startServer = (done) => {
    server.init({
        server: {
            baseDir: './app'
        }
    });
    done();
};

// EXPORTS
export {
    compile,
    js,
    jsVendor,
    css,
    cleanDist,
    minifyImages,
    copyAssets,
    reload,
    serve,
    startServer,
    watchHtml,
    watchTemplates,
    watchJs,
    watchJsVendor,
    watchCss,
}

// WATCH Functions
const watchHtml = () => gulp.watch(paths.src.html, gulp.series(reload));
const watchTemplates = () => gulp.watch(paths.src.templates, gulp.series(reload));
const watchJs = () => gulp.watch(paths.src.jsCustom, gulp.series(jsDev, reload));
const watchJsVendor = () => gulp.watch(paths.src.jsVendor, gulp.series(jsVendorDev, reload));
const watchCss = () => gulp.watch(paths.src.scss, gulp.series(cssDev, reload));


const cleanDistGlob = () => cleanDist(paths.Dist);
const copyAssetsDev = () => copyAssets(paths.Dev);
const copyAssetsProd = () => copyAssets(paths.Prod);

// DEV TASKS
const jsDev = () => js(paths.Dev);
const cssDev = () => css(paths.Dev);
const jsVendorDev = () => jsVendor(paths.Dev);
const compile = gulp.series(jsDev, jsVendorDev, cssDev);
const serve = gulp.series(compile, startServer);
const watch = gulp.parallel(watchHtml, watchTemplates, watchJs, watchJsVendor, watchCss);

gulp.task('dev', gulp.series(cleanDistGlob, copyAssetsDev, serve, watch, function (done) {
    done();
}));

// PROD TASKS
const minifyImgProd = () => minifyImages(paths.Prod);
const jsProd = () => js(paths.Prod);
const cssProd = () => css(paths.Prod);
const jsVendorProd = () => jsVendor(paths.Prod);
const compileProd = gulp.series(jsProd, jsVendorProd, cssProd);

gulp.task('prod', gulp.series(cleanDistGlob, minifyImgProd, copyAssetsProd, compileProd, function (done) {
    done();
}));

gulp.task('default', gulp.series(cleanDistGlob, minifyImgProd, copyAssetsProd, compileProd, function (done) {
    done();
}));