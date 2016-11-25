const path = require('path');
const jasmine = require('gulp-jasmine');
const specReporter = require('jasmine-spec-reporter');
const webpackConfig = require('./webpack.config.js');
const commonTasks = require('@telerik/kendo-common-tasks');
const rollup = require('rollup-stream');
const buble = require('rollup-plugin-buble');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const SRC = "src/**/*.js";
const TYPINGS = "src/**/*.d.ts";
const TESTS = "test/**/*.js";
const SRC_TESTS = [ SRC, TESTS ];
const DTS = "src/*.d.ts";
const e2eConfigPath = path.join(__dirname, 'e2e.conf.js');

module.exports = function(gulp, libraryName, options) {

    if (options && options.packageExternals) {
        webpackConfig.npmPackage.externals = webpackConfig.npmPackage.externals.concat(options.packageExternals);
    }

    const rollupBundle = (format, dest) =>
        rollup({
            entry: 'src/main.js',
            format: format,
            sourceMap: true,
            plugins: [ buble() ]
        })
        .pipe(source('main.js', 'src'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));

    commonTasks.addTasks(gulp, libraryName, SRC, webpackConfig, DTS);

    gulp.task('test', () =>
        gulp.src(TESTS)
        .pipe(commonTasks.webpackStream(webpackConfig.test))
        .pipe(gulp.dest('tmp/test/'))
        .pipe(jasmine({
            reporter: new specReporter()
        }))
    );

    gulp.task('watch-test', () => {
        gulp.run('test');
        return gulp.watch(SRC_TESTS, [ 'test' ]);
    });

    gulp.task('e2e', (done) =>
        commonTasks.startKarma(done, e2eConfigPath, true));

    gulp.task('watch-e2e', (done) =>
        commonTasks.startKarma(done, e2eConfigPath, false));

    gulp.task('rollup-es-bundle', [ 'bundle-typings' ], () => rollupBundle('es', 'dist/es'));
    gulp.task('bundle-typings', () =>
        gulp.src(TYPINGS)
            .pipe(gulp.dest('dist/es'))
    );

    gulp.task('rollup-cjs-bundle', () => rollupBundle('cjs', 'dist/npm'));

    gulp.task('build-rollup-package', [ 'rollup-cjs-bundle', 'rollup-es-bundle' ]);
};
