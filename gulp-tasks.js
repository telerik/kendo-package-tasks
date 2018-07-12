"use strict";

const buble = require('gulp-buble');
const buffer = require('vinyl-buffer');
const commonTasks = require('@telerik/kendo-common-tasks');
const jasmine = require('gulp-jasmine');
const path = require('path');
const merge = require('merge2');
const rimraf = require('rimraf');
const rollup = require('rollup-stream');
const rollupBuble = require('rollup-plugin-buble');
const source = require('vinyl-source-stream');
const specReporter = require('jasmine-spec-reporter');
const webpackConfig = require('./webpack.config.js');
const argv = require('yargs').argv;

const SRC = "src/**/*.js";
const TYPINGS = "src/**/*.d.ts";
const TESTS = argv.tests || "test/**/*.js";
const SRC_TESTS = [ SRC, TESTS ];
const DTS = "src/*.d.ts";
const e2eConfigPath = path.join(__dirname, 'e2e.conf.js');

module.exports = function(gulp, libraryName, options) {

    if (options && options.packageExternals) {
        webpackConfig.npmPackage.externals = webpackConfig.npmPackage.externals.concat(options.packageExternals);
    }

    if (options && options.bundledPackages) {
        // Include bundledPackages in UMD bundle for StackBlitz.
        // Example Usage:
        //   bundledPackages: [ 'jszip' ]
        const doesNotMatchAny = (regex, arr) => arr.reduce((acc, item) => acc && !item.match(regex), true);
        const shouldExclude = regex => doesNotMatchAny(regex, options.bundledPackages);
        webpackConfig.umdPackage.externals = webpackConfig.umdPackage.externals.filter(shouldExclude);
    }

    commonTasks.addTasks(gulp, libraryName, SRC, webpackConfig, DTS, options);

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

    gulp.task('clean-es-bundle', (done) => rimraf('dist/es', done));
    gulp.task('es-bundle', () =>
        gulp.src(SRC)
            .pipe(buble({
                transforms: {
                    modules: false
                }
            }))
            .pipe(gulp.dest('dist/es'))
    );

    gulp.task('es2015-bundle', () =>
        gulp.src(SRC)
            .pipe(buble({
                target: {
                    node: 6
                },
                transforms: {
                    modules: false
                }
            }))
            .pipe(gulp.dest('dist/es2015'))
    );


    let entries = [ 'main.js' ];
    if (options && options.entries) {
        entries = options.entries;
    }

    const externals = (entry) => entries
        .filter((other) => other !== entry)
        .map(ext => path.resolve('./src/' + ext));

    gulp.task('bundle-typings', [ 'clean-cjs-bundle' ], () =>
        gulp.src(TYPINGS)
            .pipe(gulp.dest('dist/npm'))
    );

    gulp.task('clean-cjs-bundle', (done) => rimraf('dist/npm', done));
    gulp.task('cjs-bundle', [ 'clean-cjs-bundle', 'bundle-typings' ], () => {
        const tasks = entries.map((entry) =>
            rollup({
                entry: 'src/' + entry,
                external: externals(entry),
                format: 'cjs',
                sourceMap: true,
                plugins: [ rollupBuble() ]
            })
            .pipe(source(entry, 'src'))
            .pipe(buffer())
            .pipe(gulp.dest('dist/npm'))
        );

        return merge(tasks);
    });

    gulp.task('build-module', [ 'es-bundle', 'es2015-bundle', 'cjs-bundle', 'build-systemjs-bundle' ]);

    // Alias for backwards-compatibility
    gulp.task('build-rollup-package', [ 'build-module' ]);
};
