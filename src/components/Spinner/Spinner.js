import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import Icon from 'components/Icon';

export default class Spinner extends BaseComponent {
  className = 'sk-Spinner';

  static propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'big']),
  };

  static defaultProps = {
    size: 'medium',
  };

  sizes = {
    medium: 80,
  };

  render() {
    const classNames = {
      [`--${this.props.size}`]: true,
    };
    return (
      <div className={ this.rootcn(classNames) }>
        <Icon
          className={ this.cn`__circle` }
          set="fa"
          type="android-refresh"
          size={ this.sizes[this.props.size] }
        />
      </div>
    );
  }
}
