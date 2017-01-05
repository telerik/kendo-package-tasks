[![Build Status](https://travis-ci.org/telerik/kendo-package-tasks.svg?branch=master)](https://travis-ci.org/telerik/kendo-package-tasks)
[![npm version](https://badge.fury.io/js/%40telerik%2Fkendo-package-tasks.svg)](https://badge.fury.io/js/%40telerik%2Fkendo-package-tasks)

An utility package exporting gulp tasks for Kendo UI NPM packages.

 - `gulp test` - runs the tests (single run). `gulp test --tests="test/foo.js"` - runs specific test;
 - `gulp watch-test` - runs the tests in continuous mode;
 - `gulp e2e` - runs the e2e tests (single run). `gulp e2e --tests="e2e/foo.js"` - runs specific e2e test;
 - `gulp watch-e2e` - runs the e2e tests in continuous mode;
 - `gulp build-npm-package` - packages the component in a format suitable for publishing as an NPM package (commonjs module)
