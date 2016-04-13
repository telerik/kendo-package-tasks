const path = require('path');
const jasmine = require('gulp-jasmine');
const specReporter = require('jasmine-spec-reporter');
const webpackConfig = require('./webpack.config.js');
const commonTasks = require('@telerik/kendo-common-tasks');

const SRC = "src/*.js";
const TESTS = "test/**/*.js";
const SRC_TESTS = [ SRC, TESTS ];
const DTS = "src/*.d.ts";
const e2eConfigPath = path.join(__dirname, 'e2e.conf.js');

module.exports = function(gulp, libraryName) {
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
};
