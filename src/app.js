require('console-polyfill');
require('date-polyfill');

// require instead of imports to load polyfills first.
const Html = require('layout/Html');
const is = require('next-is');
const React = require('react');
const { hydrate } = require('react-dom');
const Routes = require('routes');
const { Router, browserHistory, match } = require('react-router');

if (typeof window === 'undefined') {
  // list all modules required for back-end rendering.
  module.exports = {
    './routes': Routes,
    './layout/Html': Html,
    './config': require('config')
  };
} else {
  // global.require = require;
  // front-end: init app.
  match({
    history: browserHistory,
    routes: Routes
  }, (error, redirectLocation, renderProps) => {
    hydrate(
      <Router { ...renderProps } />, document.querySelector('#app')
    );

    is.appendBrowsers();
  });
}
