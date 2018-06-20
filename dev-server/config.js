const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const commonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const path = require('path');
const pkg = require(path.resolve('./package.json'));

const config = (settings) => ({
    /**
     * Entry points for polyfills and the application
     *
     * Note that polyfills.js is in this package.
     */
    entry: {
        'polyfills': [
            path.join(__dirname, './polyfills.js')
        ],
        'app': [
            'webpack-hot-middleware/client',
            `${settings.rootDir}/${settings.entry}`
        ]
    },

    resolve: {
        /**
         * Set up an aliases for the current package
         */
        alias: {
            [pkg.name]: path.resolve('./src/main')
        },

        extensions: [ '.ts', '.js', '.json' ],

        modules: [
            path.resolve('./node_modules'),
            path.resolve('.')
        ]
    },

    /**
     * Source maps on the cheap
     *
     * See: https://webpack.js.org/configuration/devtool/
     */
    devtool: 'cheap-module-eval-source-map',

    output: {
        /**
         * Set up output paths and file names
         */
        path: path.resolve(settings.rootDir),
        publicPath: settings.baseUrl,

        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        chunkFilename: '[id].chunk.js',

        libraryTarget: 'var',
        library: '[name]_lib'
    },
    module: {
        rules: [

            /**
             * Support loading JSON
             */
            {
                test: /\.json$/,
                use: 'json-loader'
            },

            /**
             * style-loader, css-loader and sass-loader for *.scss
             *
             * See: https://github.com/webpack-contrib/style-loader
             * See: https://github.com/webpack-contrib/css-loader
             * See: https://github.com/webpack-contrib/sass-loader
             */
            {
                test: /\.scss$/,
                include: [
                    path.resolve('./node_modules')
                ],
                use: [ 'style-loader', 'css-loader', 'sass-loader' ]
            },

            /**
             * style-loader and css-loader for *.css
             *
             * See: https://github.com/webpack-contrib/style-loader
             * See: https://github.com/webpack-contrib/css-loader
             */
            {
                test: /\.css$/,
                include: [
                    path.resolve('./node_modules')
                ],
                use: [ 'style-loader', 'css-loader' ]
            },

            /**
             * file-loader for images
             *
             * See: https://github.com/webpack-contrib/file-loader
             */
            {
                test: /\.(png|jpg|jpe?g|gif|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                            outputPath: 'assets/img'
                        }
                    }
                ]
            },

            /**
             * file-loader for fonts
             *
             * See: https://github.com/webpack-contrib/file-loader
             */
            {
                test: /\/fonts\//,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[hash].[ext]',
                            outputPath: 'assets/fonts'
                        }
                    }
                ]
            }
        ]
    },

    plugins: [
        /**
         * Plugin: HtmlWebpackPlugin
         * Description: Simplifies creation of HTML files to serve your webpack bundles.
         * This is especially useful for webpack bundles that include a hash in the filename
         * which changes every compilation.
         *
         * See: https://github.com/ampedandwired/html-webpack-plugin
         */
        new htmlWebpackPlugin({
            template: path.resolve(`${settings.rootDir}/${settings.rootFile}`),
            filename: settings.rootFile,
            hash: true,
            chunksSortMode: 'dependency'
        }),

        /**
         * CommonsChunkPlugin
         * Split code into a number of chunks to avoid rebuilding unchanged code
         *
         * See: https://webpack.js.org/plugins/commons-chunk-plugin/
         */
        new commonsChunkPlugin({
            name: 'polyfills',
            chunks: [ 'polyfills' ]
        }),

        new commonsChunkPlugin({
            name: 'package',
            chunks: [ 'app' ],
            minChunks: module => !/node_modules/.test(module.resource) && /src\//.test(module.resource)
        }),

        new commonsChunkPlugin({
            name: 'vendor',
            chunks: [ 'app' ],
            minChunks: module => /node_modules/.test(module.resource)
        }),

        // Specify the correct order the scripts will be injected in
        new commonsChunkPlugin({
            name: [ 'polyfills', 'vendor', 'package' ].reverse()
        }),

        new webpack.HotModuleReplacementPlugin()
    ]
});

module.exports = config;
