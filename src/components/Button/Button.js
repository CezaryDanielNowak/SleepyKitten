import React from 'react';
import PropTypes from 'prop-types';
import Ink from 'react-ink';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import BaseComponent from 'components/BaseComponent';

// Accessing camera seems to block UI. We need to give some time to javascript engine
// so CSS changes apply to the screen.
const DOM_FLUSH_TIMEOUT = 60;
let endTimeout;

export default class Button extends BaseComponent {
  className = 'sk-Button';

  static propTypes = {
    disableInk: PropTypes.bool,
    fluid: PropTypes.bool,
    visuallyDisabled: PropTypes.bool,
    mainAction: PropTypes.bool,
    outlined: PropTypes.bool,
    pill: PropTypes.bool,
    children: PropTypes.node,
    size: PropTypes.oneOf(['big', 'medium', 'small']),
    iconPosition: PropTypes.oneOf(['left', 'right']),
    theme: PropTypes.oneOf([
      'action',
      'accent',
      'button',
      'disabled',
      'icon-action',
      'link',
      'link-unstyled',
      'paypal',
      'no-theme',
      'warning',
    ]),
    transparent: PropTypes.bool,
    type: PropTypes.oneOf([
      'button',
      'menu',
      'reset',
      'submit',
    ]),
  };

  static defaultProps = {
    disableInk: false,
    fluid: false,
    visuallyDisabled: false,
    mainAction: false,
    size: 'medium',
    theme: 'action',
    transparent: false,
    type: 'submit',
    shape: '',
  };

  /**
   * setProcessing static method is shorthand for:
   * if (this.refs.buttonInstance) {
   *   this.refs.buttonInstance.setProcessing();
   * }
   */
  static setProcessing(buttonInstance, processing, callback) {
    if (buttonInstance) {
      if (ENV === 'local' && !buttonInstance.setProcessing) {
        // eslint-disable-next-line no-console
        console.error('[DEBUG] Please provide `setProcessing` method to your button component.');
      }
      buttonInstance.setProcessing(processing, callback);
    } else if (callback) {
      callback();
    }
  }

  /**
   * setDisabled static method is shorthand for:
   * if (this.refs.buttonInstance) {
   *   this.refs.buttonInstance.setDisabled();
   * }
   */
  static setDisabled(buttonInstance, disabled, callback) {
    if (buttonInstance) {
      if (ENV === 'local' && !buttonInstance.setDisabled) {
        // eslint-disable-next-line no-console
        console.error('[DEBUG] Please provide `setDisabled` method to your button component.');
      }
      buttonInstance.setDisabled(disabled, callback);
    } else if (callback) {
      callback();
    }
  }

  state = {};

  handleClick = (e) => {
    if (this.props.onClick) {
      this.props.onClick(e);
    }

    if (this.props.onClick) {
      const { body } = document;
      body.classList.add('app-in-transition');
      clearTimeout(endTimeout);
      endTimeout = setTimeout(() => {
        // on touch devices multiple events are called on click, this might
        // cause weird behaviour like dialog disapear right after showing up.
        body.classList.remove('app-in-transition');
      }, 250);
    }
  };

  setDisabled(disabled = true, callback) {
    this.setState(
      { disabled },
      callback ? debounce(callback, DOM_FLUSH_TIMEOUT) : undefined
    );
  }

  setProcessing(processing = true, callback) {
    this.setState(
      { processing },
      callback ? debounce(callback, DOM_FLUSH_TIMEOUT) : undefined
    );
  }


  render() {
    const { fluid, size, theme, shape, iconPosition } = this.props;
    const disabled = typeof this.state.disabled === 'boolean' ?
      this.state.disabled : this.props.disabled; // state.disabled > props.disabled.
    const processing = this.state.processing;

    const classNames = {
      [`--theme-${theme}`]: theme,
      [`--${size}`]: true,
      [`--shape-${shape}`]: shape,
      [`--icon-${iconPosition}`]: iconPosition,
      '--main-action': this.props.mainAction,
      '--disabled': processing || disabled || this.props.visuallyDisabled,
      '--fluid': fluid,
      '--processing': processing,
      '--pill': this.props.pill,
      '--outlined': this.props.outlined,
      '--transparent': this.props.transparent,
      '--not-icon': typeof this.props.children === 'string' &&
        !['link', 'link-unstyled'].includes(theme),
    };

    const isInked = !this.props.disabled &&
      this.props.theme !== 'link' &&
      this.props.theme !== 'link-unstyled' &&
      this.props.theme !== 'no-theme' &&
      !this.props.disableInk;

    const extraProps = {};

    return (
      <button
        { ...omit(this.props, [
          'size', 'set', 'theme', 'shape', 'mainAction', 'iconPosition', 'visuallyDisabled',
          'disableInk', 'pill', 'outlined', 'allowUploadAlternative', 'alternativeUploadText',
          'fluid', 'transparent',
        ]) }
        className={ this.rootcn(classNames) }
        disabled={ processing || disabled }
        onClick={ this.handleClick }
        { ...extraProps }
      >
        { this.state.msg || this.props.children }
        { isInked && <Ink duration={ 400 } /> }
      </button>
    );
  }
}
