'use strict';

const config = require('../config');
const gutil = require('gulp-util');
const mapValues = require('lodash/mapValues');
const noop = require('no-op');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (userWebpackConfig) => {
  const extraWebpackConfig = userWebpackConfig || {};
  const callback = extraWebpackConfig.callback || noop;
  delete extraWebpackConfig.callback;

  const configVariables = mapValues(config, (val) => {
    return JSON.stringify(val);
  });

  const globalVariablesPlugin = Object.assign(configVariables, {
    'process.env': {
      NODE_ENV: config.ENV === 'local' ? '"dev"' : '"production"' // This affects react lib size
    }
  });

  const plugins = [
    new webpack.DefinePlugin(globalVariablesPlugin),
    // new BundleAnalyzerPlugin(),
  ];

  if (config.ENV !== 'local') {
    plugins.push(
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            dead_code: true,
            warnings: false,
          },
          output: {
            comments: false,
            semicolons: true,
          }
        }
      })
    );
  }

  const commonConfig = Object.assign({
    mode: config.ENV === 'local' ? 'development' : 'production',
    context: config.BASE_DIR,
    devtool: config.enableSourceMapsJS ? 'source-map' : false,
    module: {
      rules: [
        {
          // every js or jsx file but *.test.js and *.test.jsx
          test: /^(?!.*\.test(\.js|\.jsx)$).*(?:\.js|\.jsx)$/,
          loader: 'babel-loader',
          include: [
            config.SOURCE_DIR,
          ],
          exclude: [
            /node_modules/,
          ],
        },
      ]
    },
    plugins: plugins,
    resolve: {
      modules: [
        config.SOURCE_DIR,
        `${config.BASE_DIR}/node_modules`,
        `${config.BASE_DIR}/packages`,
      ],
      alias: {
        'ie': 'component-ie',
      },
    },
    optimization: {
      splitChunks: {
        chunks: 'async',
        minSize: 30000,
        minChunks: 1,
      }
    }
  }, extraWebpackConfig, { watch: undefined });

  let firstRun = true;
  const webpackCallback = (err, stats) => {
    if (firstRun) {
      // Show what files were used when built
      gutil.log(stats.toString({
        colors: true,
        cached: false,
        children: true
      }));
      firstRun = false;
      callback();
    }
  };

  const configs = [{
    ...commonConfig,
    entry: {
      'babel-polyfill': 'babel-polyfill',
      'app': './src/app.js',
    },
    output: {
      filename: '[name].js', // outputs dist/app.js
      globalObject: 'this',
      sourceMapFilename: '[name].js.map',
      libraryTarget: 'umd2',
      path: config.DESTINATION_DIR
    },
  }];

  return () => {
    const compiler = webpack(configs);

    if (extraWebpackConfig.watch) {
      compiler.watch({
        aggregateTimeout: 300,
        poll: 300
      }, webpackCallback);
    } else {
      compiler
        .run(webpackCallback);
    }
  };
};
