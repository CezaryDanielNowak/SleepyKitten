import React from 'react';
import PropTypes from 'prop-types';
// import { CSSTransitionGroup } from 'react-transition-group';
import BaseComponent from 'components/BaseComponent';


// TODO: make it animate; CSSTransitionGroup was too big
export default class Animate extends BaseComponent {
  className = 'sk-Animate';

  static propTypes = {
    children: PropTypes.node,
  };

  static defaultProps = {
    children: '',
  };

  render() {
    return (
      <div
        { ...this.props }
      >
        { this.props.children }
      </div>
    );
  }
}
