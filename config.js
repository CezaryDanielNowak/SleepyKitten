'use strict';

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
function notMake() {
  throw Error('Please use Makefile to run the code.');
}

const config = {
  BASE_DIR: __dirname,
  ASSETS_DIR: path.resolve(__dirname, 'assets'),
  SOURCE_DIR: path.resolve(__dirname, 'src'),
  DESTINATION_DIR: path.resolve(__dirname, 'dist'),
  enableSourceMapsJS: true,
  ENV: argv.env || 'local',

  SERVER_PORT: argv.port,
  SERVER_HOST: '0.0.0.0',
  // YEAR_CONF is here, so we don't have update year in footer etc every January.
  YEAR_CONF: new Date().getUTCFullYear(),
  CACHE_PARAM: Date.now().toString(36),
  DEFAULT_PAGE_TITLE: 'SleepyKitten',
  BACKEND_URL: '',
  ASSETS_URL: '/',
  SENTRY_URL: 'https://6d37f1d26ff9462190eac1e1def2bf47@sentry.io/1243122',
};

let localConfig;
try {
  // require used instead of import, to prevent build errors
  localConfig = require(`./config.${config.ENV}`);
} catch (e) {
  localConfig = {};
}

module.exports = Object.assign(config, localConfig);
