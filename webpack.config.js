const commonTasks = require('@telerik/kendo-common-tasks');
const path = require('path');

const sourceExtensions = [ '.js' ];
const nodeModulesPath = path.join(__dirname, 'node_modules');

const resolve = commonTasks.resolveConfig(sourceExtensions, nodeModulesPath);

const babelLoader = {
    test: /\.js?$/,
    exclude: /(node_modules|bower_components)/,
    loader: require.resolve('babel-loader'),
    plugins: [
        require.resolve('babel-plugin-add-module-exports')
    ],
    query: {
        presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-stage-1') // Note: stage-1 should be after es2015 in order to work
        ]
    }
};

module.exports = {
    CDN: {
        resolve,

        output: { libraryTarget: 'umd' },

        plugins: [
            commonTasks.uglifyJsPlugin()
        ],

        module: {
            loaders: [ babelLoader ]
        }
    }, // CDN

    npmPackage: {
        resolve,

        output: { libraryTarget: 'commonjs2' },

        module: {
            loaders: [ babelLoader ]
        }
    }, // npmPackage

    dev: commonTasks.webpackDevConfig({
        resolve,
        loaders: [ babelLoader ],
        entries: 'examples/*.jsx'
    }), // dev

    test: {
        resolve,

        externals: {
            "cheerio": "global"
        },

        module: {
            loaders: [
                babelLoader
            ]
        }
    } // test

}; // module.exports
