import React from 'react';
import PropTypes from 'prop-types';

export default class Script extends React.Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
  };

  getContent() {
    return {
      __html: this.props.children,
    };
  }

  render() {
    /* eslint-disable react/no-danger */
    return (
      <script dangerouslySetInnerHTML={ this.getContent() } />
    );
    /* eslint-enable */
  }
}
