import React from 'react';
import noop from 'no-op';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import model from 'components/Captcha/model';

export default class Captcha extends BaseComponent {
  className = 'sk-Captcha';

  static propTypes = {
    verificationCallback: PropTypes.func,
  };

  static defaultProps = {
    verificationCallback: noop,
  };

  state = {}

  componentDidMount() {
    const { captchaUrl } = this.props;
    if (captchaUrl) model.set({ captchaUrl });
    this.syncStateWithModel(model, ['sitekey']);
    model.need('sitekey', this.createCaptcha);
  }

  createCaptcha = (sitekey) => {
    /* istanbul ignore next */

    // callback might be called with a delay
    if (this.isDestroyed || !this.refs.captcha) return;

    global.grecaptcha.render(this.refs.captcha, {
      callback: this.props.verificationCallback,
      sitekey,
    });
  };

  render() {
    return (
      <div className={ this.rootcn`` }>
        <div ref="captcha" />
      </div>
    );
  }
}
