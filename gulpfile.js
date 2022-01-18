const {src, dest, watch, parallel, series} = require('gulp');

const del = require('del');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const clean_css = require('gulp-clean-css');
const browser_sync = require('browser-sync').create();
const file_include = require('gulp-file-include');
const group_media = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const image_min = require('gulp-imagemin');
const webp = require('gulp-webp');
const webp_html = require('gulp-webp-html');
const webp_css = require('gulp-webp-css');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

function stylesPlugins() {
    return src([
        'node_modules/normalize.css/normalize.css',
    ])
        .pipe(dest('_src/styles/plugins'))
        .pipe(dest('dist/styles/plugins'))
        .pipe(clean_css())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest('_src/styles/plugins'))
        .pipe(dest('dist/styles/plugins'))
        .pipe(browser_sync.stream())
}

//----------------------

function scriptsPlugins() {
    return src([
        'node_modules/jquery/dist/jquery.js',
    ])
        .pipe(dest('_src/scripts/plugins'))
        .pipe(dest('dist/scripts/plugins'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest('_src/scripts/plugins'))
        .pipe(dest('dist/scripts/plugins'))
        .pipe(browser_sync.stream())
}

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

function html() {
    return src([
        '_src/pages/*.html',
        '!_src/pages/_head.html',
        '!_src/pages/_scripts.html',
    ])
        .pipe(plumber(notify.onError({
                "title": "HTML",
                "message": "Error: <%= error.message %>"
            })))
        .pipe(file_include())
        .pipe(webp_html())
        .pipe(dest('dist/pages'))
        .pipe(browser_sync.stream())
}

function styles() {
    return src('_src/styles/style.scss')
        .pipe(plumber(notify.onError({
                "title": "SCSS",
                "message": "Error: <%= error.message %>"
            })))
        .pipe(scss({outputStyle: 'expanded'}))
        .pipe(webp_css())
        .pipe(group_media())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true,
            cascade: true,
        }))
        .pipe(dest('_src/styles'))
        .pipe(dest('dist/styles'))
        .pipe(clean_css())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest('_src/styles'))
        .pipe(dest('dist/styles'))
        .pipe(browser_sync.stream())
}

function scripts() {
    return src([
        '_src/scripts/*.js',
        '!_src/scripts/*.min.js',
    ])
        .pipe(plumber(notify.onError({
                "title": "JS",
                "message": "Error: <%= error.message %>"
            })))
        .pipe(file_include())
        .pipe(dest('dist/scripts'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest('_src/scripts'))
        .pipe(dest('dist/scripts'))
        .pipe(browser_sync.stream())
}

function images() {
    return src('_src/images/**/*.{jpg,png,svg,gif,ico,webp}')
        .pipe(webp({quality: 70}))
        .pipe(dest('dist/images'))
        .pipe(src('_src/images/**/*.{jpg,png,svg,gif,ico,webp}'))
        .pipe(image_min({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 4 // 0 to 7
        }))
        .pipe(dest('dist/images'))
        .pipe(browser_sync.stream())
}

function assets() {
    return src('_src/assets/**/*.{jpg,png,svg,gif,ico,webp}')
        .pipe(webp({quality: 70}))
        .pipe(dest('dist/assets'))
        .pipe(src('_src/assets/**/*.{jpg,png,svg,gif,ico,webp}'))
        .pipe(image_min({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 4 // 0 to 7
        }))
        .pipe(dest('dist/assets'))
        .pipe(browser_sync.stream())
}

function build() {
    return src([
        '_src/assets/**/*',
        '_src/fonts/**/*',
    ], {base: '_src'})
        .pipe(dest('dist'))
}

function browserSync() {
    browser_sync.init({
        server: {
            baseDir: ['dist/pages', 'dist'],
            directory: true,
        },
        port: 3000,
        notify: false
    });
}

function watching() {
    watch(['_src/pages/**/*.html'], html);
    watch(['_src/styles/**/*.scss'], styles);
    watch(['_src/scripts/**/*.js', '!_src/scripts/script.min.js'], scripts);
    watch(['_src/images/**/*.{jpg,png,svg,gif,ico,webp}'], images);
    watch(['_src/assets/**/*.{jpg,png,svg,gif,ico,webp}'], assets);
    watch(['_src/pages/**/*.html']).on('change', browser_sync.reload);
    watch(['_src/fonts/**/*', '_src/assets/**/*'], build);
}

function cleanDist() {
    return del('dist')
}

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.assets = assets;
exports.watching = watching;
exports.cleanDist = cleanDist;
exports.browserSync = browserSync;
exports.stylesPlugins = stylesPlugins;
exports.scriptsPlugins = scriptsPlugins;

exports.build = series(cleanDist, build, html, styles, scripts, images, assets, stylesPlugins, scriptsPlugins);
exports.default = parallel(html, styles, scripts, stylesPlugins, scriptsPlugins, images, assets, build, watching, browserSync);