import React from 'react';
import noop from 'no-op';
import BaseComponent from 'components/BaseComponent';

export default class FloatingText extends BaseComponent {
  className = 'sk-FloatingText';

  state = {};

  showFloatingText(textProps = {}, callback) { // public
    const { text = '', isValid = true } = textProps;
    if (!text) return null;

    this.setState({
      floatingText: text,
      isFloatingTextValid: isValid,
      isFloatingTextVisible: true
    }, () => {
      this.handleFloatingTextClose(callback);
    });
  }

  handleFloatingTextClose(callback = noop) {
    const DEFAULT_TIMEOUT = 3500;
    const TIMEOUT_PER_CHAR = 40;
    // longer text = longer timeout
    const timeout = DEFAULT_TIMEOUT + this.state.floatingText.length * TIMEOUT_PER_CHAR;

    clearTimeout(this.floatingTextTimeout);
    this.floatingTextTimeout = setTimeout(() => {
      this.setState({
        isFloatingTextVisible: false
      });
      callback();
    }, timeout);
  }


  render() {
    const classNames = {
      '--error': !this.state.isFloatingTextValid,
      '--visible': this.state.isFloatingTextVisible
    };

    return (
      <div className={ this.rootcn(classNames) }>
        { this.state.floatingText }
      </div>
    );
  }
}
