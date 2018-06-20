const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const serveIndex = require('serve-index');
const config = require('./config');

const empty = (req, res) => {
    res.status(200);
    res.end();
};

const start = (settings) => {
    const compiler = webpack(config(settings));

    const devMiddleware = webpackDevMiddleware(compiler, {
        index: settings.rootFile,
        publicPath: settings.baseUrl,
        noInfo: true,
        quiet: true
    });

    const server = express();

    const index = serveIndex('.', {
        filter: (filename) => !/app\./.test(filename),
        icons: true
    });

    server.get('/favicon.ico', empty);

    server.use(devMiddleware);

    server.use(webpackHotMiddleware(compiler, {
        overlay: true,
        noInfo: true,
        quiet: true
    }));

    server.get(/.html$/, (req, res) => {
        const rootFile = devMiddleware.fileSystem.readFileSync(
            path.resolve(`${settings.rootDir}/${settings.rootFile}`)
        );

        res.write(rootFile);
        res.send();
    });

    server.use('/', express.static('.'), index);

    return server;
};

module.exports = start;
