import React from 'react';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import BaseComponent from 'components/BaseComponent';

/*
 * This component creates Link inside <li> element. Bootstrap requires "active" class
 * to be in <li>, instead of <a>
 * active class is added automaticly to <li> element.
 *
 * react-router has also bug: active class is not added at all when pure mixin is used.
 */
export default class LiLink extends BaseComponent {
  className = 'sk-LiLink';
  state = {};
  static propTypes = {
    clickable: PropTypes.bool,
    children: PropTypes.node,
    to: PropTypes.string,
  };

  static defaultProps = {
    clickable: true,
  }

  render() {
    return (
      <li
        { ...omit(this.props, ['to', 'clickable']) }
        className={ this.rootcn`` }
        ref={ this.props.to }
      >
        { this.props.clickable ?
          <Link to={ this.props.to }>
            { this.props.children }
          </Link> :
          <span>
            { this.props.children }
          </span>
        }
      </li>
    );
  }
}
