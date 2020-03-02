// Initialize modules
let gulp = require('gulp');
// Importing packages
let sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    babel = require('gulp-babel'),
    gcmq = require('gulp-group-css-media-queries'),
    smrtgrid = require('smart-grid'),
    autoprfxr = require('gulp-autoprefixer'),
    del = require('del');
bs = require('browser-sync').create();

let path = {
    src: {
        sass: 'src/sass/style.sass',
        js: 'src/js/**/*.*',
        img: 'src/img/**/*.*',
        vendor: {
            smartgrid: 'src/vendor/smart-grid'
        }
    },
    app: {
        css: 'app/css/',
        js: 'app/js/',
        img: 'app/img/'
    }
};

//CSS
function styles() {
    return gulp.src(path.src.sass)
        .pipe(sass({
            outputStyle: 'expanded',
            'include css': true
        })).on('error', sass.logError)
        .pipe(autoprfxr({ cascade: false }))
        .pipe(gcmq())
        .pipe(csscomb())
        .pipe(cssmin())
        .pipe(gulp.dest(path.app.css))
        .pipe(bs.stream());
}

//JS
function scripts() {
    return gulp.src(path.src.js)
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('app.js'))
        .pipe(uglify({
            toplevel: true
        }))
        .pipe(gulp.dest(path.app.js))
        .pipe(bs.stream());
}

//img
function imgs() {
    return gulp.src(path.src.img)

        .pipe(gulp.dest(path.app.img))
        .pipe(bs.stream());
}

//libs
function libs() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/swiper/js/swiper.min.js',
            'node_modules/aos/dist/aos.js',
            'node_modules/lazysizes/lazysizes.min.js',
            'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js'
        ])
        // .pipe(babel({
        //     presets: ['@babel/env']
        // }))
        .pipe(concat('libs.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.app.js))
}

//del
function clean() {
    return del(['app/*'])
}

//smartgrid
function smartgrid() {
    let settings = {
        outputStyle: 'sass',
        columns: 12,
        offset: '30px',
        mobileFirst: false,
        container: {
            maxWidth: '1170px',
            fields: '15px'
        },
        breakPoints: {
            lg: {
                width: '1200px'
            },
            md: {
                width: '991px'
            },
            sm: {
                width: '767px'
            },
            xs: {
                width: '575px'
            },
            xxs: {
                width: '320px'
            }
        }
    };
    return smrtgrid(path.src.vendor.smartgrid, settings)({});
}

//watch
function watch() {
    bs.init({
        server: "./",
        notify: false,
        open: true,
        ui: false
    });

    gulp.watch('src/**/**/*.+(sass|scss)', styles);
    gulp.watch('src/js/**/*.js', scripts);
    gulp.watch('src/img/**/*.*', imgs);
    gulp.watch('./**/*.html').on('change', bs.reload);
}

//tasks
gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('imgs', imgs);
gulp.task('libs', libs);
gulp.task('smartgrid', smartgrid);
gulp.task('del', clean);
gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, gulp.parallel(styles, scripts, libs, imgs)));
gulp.task('dev', gulp.series('build', 'watch'));