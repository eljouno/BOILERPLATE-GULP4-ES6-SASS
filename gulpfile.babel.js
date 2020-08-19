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
        prodFolder: 'app/dist/prod',
        devFolder: 'app/dist/dev'
    },
    src: {
        assets: ['app/assets/**', '!app/assets/{img,img/**}'],
        html: ['app/*.html'],
        img: 'app/assets/img/**/*',
        jsCode: ['app/js/**/*.js', '!app/js/{vendor,vendor/**}'],
        jsVendor: 'app/js/vendor/**/*.js',
        jsCustom: ['app/js/custom/**/*.js', 'app/js/app.js'],
        jsEntry: ['app/js/app.js'],
        scss: 'app/scss/**/*.scss',
        templates: ['app/*.php', 'app/templates/*.php', 'app/templates/**/*.php', 'app/templates/**/*.html.twig','app/**/*.yml', 'app/*.html','app/**/*.html']
    },
    Dev: 'dev',
    Prod: 'prod'
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
    if (env === paths.Dev) {
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
            .pipe(gulp.dest(paths.dest.global + '/' + env + '/img'));
    } else if (env === paths.Prod) {
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
            .pipe(gulp.dest(paths.dest.global + '/' + env + '/img'));
    }
};

const copyAssets = (env) => {
    if (env === paths.Dev) {
        return gulp.src(paths.src.assets)
            .pipe(gulp.dest(paths.dest.global + '/' + env));
    } else if (env === paths.Prod) {
        return gulp.src(paths.src.assets)
            .pipe(gulp.dest(paths.dest.global + '/' + env));
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
            .pipe(gulp.dest(paths.dest.devFolder))
            .pipe(browserSync.stream());
    } else if (env === paths.Prod) {
        return bundler
            .transform('babelify', {presets: ['@babel/env']})
            .bundle()
            .on('error', catchJSErrors)
            .pipe(source(FILENAMES.jsCode))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(paths.dest.prodFolder))
    }

}

const jsVendor = (env) => {
    if (env === paths.Dev) {
        return gulp.src(paths.src.jsVendor)
            .pipe(concat(FILENAMES.jsVendor))
            .pipe(buffer())
            .pipe(gulp.dest(paths.dest.devFolder))
            .pipe(browserSync.stream());
    } else if (env === paths.Prod) {
        return gulp.src(paths.src.jsVendor)
            .pipe(concat(FILENAMES.jsVendor))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(paths.dest.prodFolder))
    }
}

const css = (env) => {
    const postcssPlugins = [
        flexbug(),
        autoprefixer({
            overrideBrowserslist : ['last 2 version', 'ie 11'],
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
            .pipe(gulp.dest(paths.dest.devFolder))
            .pipe(browserSync.stream());
    } else if (env === paths.Prod) {
        return gulp.src(paths.src.scss)
            .pipe(sass().on('error', sass.logError))
            .pipe(postcss(postcssPlugins))
            .pipe(uglifycss({
                "maxLineLen": 80,
                "uglyComments": true
            }))
            .pipe(gulp.dest(paths.dest.prodFolder))
    }
}

// CLEAN FOLDER DIST
function cleanDist(env) {
    if (env === paths.Dev) {
        return del(paths.dest.devFolder, {force: true});
    } else if (env === paths.Prod) {
        return del(paths.dest.prodFolder, {force: true});
    }
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




// DEV TASKS
const cleanDistDev = () => cleanDist(paths.Dev);
const copyAssetsDev = () => copyAssets(paths.Dev);
const minifyImgDev = () => minifyImages(paths.Dev);
const jsDev = () => js(paths.Dev);
const cssDev = () => css(paths.Dev);
const jsVendorDev = () => jsVendor(paths.Dev);
const compile = gulp.series(jsDev, jsVendorDev, cssDev);
const serve = gulp.series(compile, startServer);
const watch = gulp.parallel(watchHtml, watchTemplates, watchJs, watchJsVendor, watchCss);

gulp.task('dev', gulp.series(cleanDistDev, minifyImgDev, copyAssetsDev, serve, watch, function (done) {
    done();
}));

// PROD TASKS
const cleanDistProd = () => cleanDist(paths.Prod);
const copyAssetsProd = () => copyAssets(paths.Prod);
const minifyImgProd = () => minifyImages(paths.Prod);
const jsProd = () => js(paths.Prod);
const cssProd = () => css(paths.Prod);
const jsVendorProd = () => jsVendor(paths.Prod);
const compileProd = gulp.series(jsProd, jsVendorProd, cssProd);

gulp.task('prod', gulp.series(cleanDistProd, minifyImgProd, copyAssetsProd, compileProd, function (done) {
    done();
}));

gulp.task('default', gulp.series(cleanDistDev, minifyImgDev, copyAssetsDev, watch, function (done) {
    done();
}));