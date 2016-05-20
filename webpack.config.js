const commonTasks = require('@telerik/kendo-common-tasks');
const path = require('path');

const sourceExtensions = [ '.js' ];
const nodeModulesPath = path.join(__dirname, 'node_modules');

const resolve = commonTasks.resolveConfig(sourceExtensions, nodeModulesPath);

const packageInfo = require(path.join(process.cwd(), 'package.json'));

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

const jsonLoader = {
  test: /\.json?$/,
  loader: require.resolve('json-loader')
};

const loaders = [ babelLoader, jsonLoader ];

module.exports = {
    CDN: {
        resolve,

        output: { libraryTarget: 'umd' },

        plugins: [
            commonTasks.uglifyJsPlugin()
        ],

        module: {
            loaders: loaders
        }
    }, // CDN

    npmPackage: {
        resolve,

        output: { libraryTarget: 'commonjs2' },

        module: {
            loaders: loaders
        }
    }, // npmPackage

    test: {
        resolve,

        externals: {
            "cheerio": "global"
        },

        module: {
            loaders: loaders
        }
    }, // test

    e2e: {
        resolve: {
            cache: false,
            fallback: resolve.fallback,
            alias: {
                "./e2e": process.cwd() + "/e2e",
                "e2e-utils": require.resolve("./e2e-utils.js"),
                [packageInfo.name]: '../src/main'
            },
            extensions: [ '', '.js' ]
        },
        devtool: 'inline-source-map',
        module: {
            preLoaders: [
                {
                    test: /\.js$/,
                    loader: require.resolve("source-map-loader")
                }
            ],
            loaders: loaders
        },
        stats: { colors: true, reasons: true },
        debug: false,
        plugins: [
            new commonTasks.webpack.ContextReplacementPlugin(/\.\/e2e/, process.cwd() + '/e2e')
        ]
    }

}; // module.exports
