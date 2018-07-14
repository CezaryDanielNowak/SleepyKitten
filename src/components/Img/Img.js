import React from 'react';
import omit from 'lodash/omit';
import is from 'next-is';
import noop from 'no-op';
import PropTypes from 'prop-types';

import BaseComponent from 'components/BaseComponent';
import { getPixelRatio } from 'helpers/domHelper';

function isCached(url) {
  const test = document.createElement('img');
  test.src = url;
  return test.complete || test.width + test.height > 0;
}

/**
 * Img component fixes problem with onLoad not triggering when image is cached.
 */

export default class Img extends BaseComponent {
  className = 'sk-Img';
  pollInterval = null;

  static propTypes = {
    src: PropTypes.string.isRequired,
    onLoad: PropTypes.func,
    /**
     * responsiveSizes: array of numbers that indicate all assets, that are available
     * for high pixel ratio.
     *
     * For example:
     * <Img
     *   src="test.jpg"
     *   responsiveSizes={ [1, 2, 3] }:
     * ?>
     *
     * returns `<img src="test.jpg" />` when pixelRatio is 1,
     * returns `<img src="test@2x.jpg" />` when pixel ratio is 1.01 - 2
     * returns `<img src="test@3x.jpg" />` when pixel ratio is 2.01 or more
     */
    responsiveSizes: PropTypes.arrayOf(PropTypes.number),
  };

  static defaultProps = {
    onLoad: noop,
    responsiveSizes: [1],
  };

  handleLoadCalled = false;

  handleLoad = () => {
    clearInterval(this.pollInterval);
    if (!this.handleLoadCalled) {
      this.props.onLoad({});
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.pollInterval);
  }

  fixOnLoad() {
    if (this.props.onLoad === noop) return;

    if (isCached(this.props.src)) {
      this.handleLoad();
    } else {
      clearInterval(this.pollInterval);
      this.pollInterval = setInterval(this.fixOnLoad.bind(this), 100);
    }
  }

  componentDidMount() {
    this.fixOnLoad();
  }

  componentDidUpdate() {
    this.fixOnLoad();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.props.src) {
      this.handleLoadCalled = false;
    }
  }

  getSrc() {
    const responsiveSizes = this.props.responsiveSizes;
    if (!is.browser()) {
      if (responsiveSizes.length > 1) {
        // SSR does not know what is pixel ratio on the device.
        // Return nothing so user does not need to download asset, that
        // won't be used. Selecting proper image will happen on browser side.
        return '';
      }
      return this.props.src;
    }
    const { realPixelRatio } = getPixelRatio();
    // NOTE: sort affects array instance, but it should not cause any
    //       side effects.
    const assetSuffixToUse = responsiveSizes
      .sort()
      .reduce(
        (acc, size) => (acc < realPixelRatio ? size : acc),
        responsiveSizes[0]
      );

    return assetSuffixToUse === 1 ?
      this.props.src :
      this.props.src.replace(/(.*)(\.[^.]+)$/, `$1@${assetSuffixToUse}x$2`);
  }

  render() {
    return this.props.src ? (
      <img
        alt=""
        { ...omit(this.props, Object.keys(Img.defaultProps)) }
        className={ this.rootcn`` }
        onLoad={ this.handleLoad }
        src={ this.getSrc() }
      />
    ) : null;
  }
}
