/* global device */
import React from 'react';
import omit from 'lodash/omit';
import noop from 'no-op';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import deviceModel from 'models/device';

/**
 * This component opens given link in WebView or system browser.
 *
 * example:
 * <Link to="https://nowak.click">nowak.click</Link>
 *
 * read more:
 * https://wiki.apache.org/cordova/InAppBrowser
 */

export default class Link extends BaseComponent {
  className = 'sk-Link';

  static propTypes = {
    children: PropTypes.node,
    to: PropTypes.string,
    target: PropTypes.string,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    children: '',
    target: '_self',
    onClick: noop,
  };

  openExternally(e) {
    if (device.platform.toUpperCase() === 'ANDROID') {
      navigator.app.loadUrl(this.props.to, { openExternal: true });
      e.preventDefault();
    } else if (device.platform.toUpperCase() === 'IOS') {
      window.open(this.props.to, '_system');
      e.preventDefault();
    }
    // else: Leave standard behaviour
  }

  openInternally(e) {
    this.navigate(this.props.to);
    e.preventDefault();
  }

  handleClick = (e) => {
    if (deviceModel.isCordova() && this.props.target !== '_self') {
      this.openExternally(e);
    } else {
      this.openInternally(e);
    }
    this.props.onClick();
  }

  render() {
    return (
      <a
        { ...omit(this.props, ['children', 'to']) }
        href={ this.props.to }
        onClick={ this.handleClick }
        className={ this.rootcn() }
      >
        { this.props.children }
      </a>
    );
  }
}
