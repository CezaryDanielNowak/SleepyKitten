/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';

export default class Render extends BaseComponent {
  static propTypes = {
    children: PropTypes.node,
    // when:
    // anything that could be casted to bool, that mean anything.
    // isRequired is not here as value can be undefined
    when: PropTypes.any,
    then: PropTypes.any,
    otherwise: PropTypes.any,
  };

  static defaultProps = {
    children: '',
    otherwise: null,
  };

  constructor(props) {
    super(props);
    this.rawProps = props;
  }

  componentWillReceiveProps(nextProps) {
    this.rawProps = nextProps;
  }

  render() {
    const { children, then } = this.props;
    if (!this.rawProps.when) return this.props.otherwise;
    const toRender = children || then;
    return toRender && toRender.length > 1 ? <div>{ toRender }</div> : toRender;
  }
}
