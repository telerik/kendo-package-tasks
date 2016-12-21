const buble = require('gulp-buble');
const buffer = require('vinyl-buffer');
const commonTasks = require('@telerik/kendo-common-tasks');
const jasmine = require('gulp-jasmine');
const path = require('path');
const rimraf = require('rimraf');
const rollup = require('rollup-stream');
const rollupBuble = require('rollup-plugin-buble');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const specReporter = require('jasmine-spec-reporter');
const webpackConfig = require('./webpack.config.js');

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

    gulp.task('clean-dist', (done) => rimraf('dist', done));

    gulp.task('bundle-typings', [ 'clean-dist' ], () =>
        gulp.src(TYPINGS)
            .pipe(gulp.dest('dist/es'))
    );

    gulp.task('es-bundle', [ 'bundle-typings' ], () =>
        gulp.src(SRC)
            .pipe(sourcemaps.init())
            .pipe(buble({
                transforms: {
                    modules: false
                }
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist/es'))
    );

    gulp.task('cjs-bundle', [ 'clean-dist' ], () =>
        rollup({
            entry: 'src/main.js',
            format: 'cjs',
            sourceMap: true,
            plugins: [ rollupBuble() ]
        })
        .pipe(source('main.js', 'src'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/npm'))
    );

    gulp.task('build-module', [ 'es-bundle', 'cjs-bundle' ]);

    // Alias for backwards-compatibility
    gulp.task('build-rollup-package', ['build-module']);
};
