import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import omit from 'lodash/omit';
import Animate from 'components/Animate';

export default class Alert extends BaseComponent {
  className = 'sk-Alert';

  state = {
    show: true,
  };

  static propTypes = {
    children: PropTypes.node,
    closeable: PropTypes.bool,
    theme: PropTypes.oneOf([
      'success',
      'info',
      'warning',
      'danger',
      'session',
    ]),
  };

  static defaultProps = {
    theme: 'success',
  };

  closeAlert = () => {
    this.setState({
      show: false,
    });
  };

  render() {
    if (!this.state.show) {
      return <Animate />;
    }
    const classNames = this.rootcn('alert', `alert-${this.props.theme}`, {
      'alert-dismissible': this.props.closeable,
    });
    return (
      <Animate>
        <div
          ref="alert"
          { ...omit(this.props, 'theme', 'closeable') }
          className={ classNames }
          role="alert"
        >
          { this.props.closeable
            ? (
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={ this.closeAlert }
              >
                <span aria-hidden="true">&times;</span>
              </button>
            )
            : null
          }
          { this.props.children }
        </div>
      </Animate>
    );
  }
}
