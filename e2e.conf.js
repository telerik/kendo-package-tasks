const commonTasks = require('@telerik/kendo-common-tasks');
const argv = require('yargs').argv;
const path = require('path');

const files = argv.tests ? path.resolve(argv.tests) : 'e2e-bundle.js';

module.exports = (config) =>
    commonTasks.karmaConfig(config, require('./webpack.config.js').e2e, files);
