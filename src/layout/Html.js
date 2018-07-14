/* eslint-disable max-len */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { asset } from 'helpers';
import Script from 'components/Script';

class Html extends Component {
  static propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    children: PropTypes.string
  };

  static defaultProps = {
    title: DEFAULT_PAGE_TITLE,
    description: ''
  };

  render() {
    /* eslint-disable max-len react/no-danger */
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <title>{ this.props.title }</title>
          <meta name="description" content={ this.props.description } />
          <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />

          { /* browsers may shoot favicon.ico request, even if it's not here */ }
          <link rel="stylesheet" href={ asset`app.css` } type="text/css" />
        </head>
        <body>
          { /* eslint-disable react/no-danger */ }
          <div id="app" dangerouslySetInnerHTML={ { __html: this.props.children } } />
          { /* eslint-enable */ }
          { ENV === 'local' ? null : <script src="https://cdn.ravenjs.com/3.26.3/raven.min.js"></script> }
          { ENV === 'local' ? null : <Script>{ `
(function(){
  var retryCount = 0;
  function initSentry() {
    if (!window.Raven) {
      return retryCount++ >= 10 ?
        console.warn("Sentry couldn't be loaded for 20 second poll.") :
        setTimeout(initSentry, 2000);
    }
    Raven.config('${SENTRY_URL}', {
      environment: '${ENV}',
      tags: { cp: '${CACHE_PARAM}' }
    }).install();
  }
  initSentry();
})();
          ` }</Script> }
          <script defer={ true } src={ asset`babel-polyfill.js` } />
          <script defer={ true } src={ asset`app.js` } />
        </body>
      </html>
    );
    /* eslint-enable */
  }
}

export default Html;
