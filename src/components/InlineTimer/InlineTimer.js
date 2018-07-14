import React from 'react';
import PropTypes from 'prop-types';
import noop from 'no-op';
import BaseComponent from 'components/BaseComponent';

function getTimeRemaining(endTime) {
  const t = endTime ? endTime - Date.now() : 0;
  return {
    totalSeconds: t,
    days: Math.floor(t / (1000 * 60 * 60 * 24)),
    hours: Math.floor((t / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((t / 1000 / 60) % 60),
    seconds: Math.floor((t / 1000) % 60),
  };
}

export default class InlineTimer extends BaseComponent {
  className = 'sk-InlineTimer';
  countDownInterval = null;

  state = getTimeRemaining();

  static propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    finishCallback: PropTypes.func,
  };

  static defaultProps = {
    finishCallback: noop,
  };

  componentDidMount() {
    const startCountDown = () => {
      this.setState(getTimeRemaining(this.props.date), () => {
        if (this.state.totalSeconds <= 0) {
          clearInterval(this.countDownInterval);
          this.setState({
            totalSeconds: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
          });
          this.props.finishCallback();
        }
      });
    };
    this.countDownInterval = setInterval(startCountDown, 1000);
    startCountDown();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.countDownInterval);
  }

  getComponentValue(field) {
    // According to babel docs padLeft is deprecated, use padStart after update babel-polyfill
    return (
      <span className={ this.cn`__value` }>
        { String(this.state[field]).padLeft(2, '0') }
      </span>
    );
  }

  render() {
    return (
      <span className={ this.rootcn`` }>
        { this.state.days > 0 ? `${this.getComponentValue('days')}:` : null }
        { this.state.hours > 0 ? `${this.getComponentValue('hours')}:` : null }
        { this.getComponentValue('minutes') }:
        { this.getComponentValue('seconds') }
      </span>
    );
  }
}
