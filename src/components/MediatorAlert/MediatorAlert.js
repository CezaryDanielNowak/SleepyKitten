import React from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import BaseComponent from 'components/BaseComponent';
import Alert from 'components/Alert';
import { scrollTo } from 'helpers/domHelper';

let messageId = 0;

export default class MediatorAlert extends BaseComponent {
  className = 'sk-MediatorAlert';

  state = {
    messageId: messageId,
  };

  static propTypes = {
    children: PropTypes.node,
    theme: PropTypes.string,
    listenTopic: PropTypes.string.isRequired,
    closeTopic: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    scrollToView: PropTypes.bool,
  };

  static defaultProps = {
    children: '',
    scrollToView: true,
  };

  updateMsg = (message) => {
    this.setState({
      messageId: ++messageId,
      message: message,
    }, () => {
      if (this.props.scrollToView) {
        scrollTo(findDOMNode(this.refs.message));
      }
    });
  }

  componentDidMount() {
    this.subscribe(this.props.listenTopic, this.updateMsg);
    if (this.props.closeTopic) {
      const closeTopics = [].concat(this.props.closeTopic);
      closeTopics.forEach((topic) => {
        this.subscribe(topic, () => {
          if (this.refs.message) {
            this.refs.message.closeAlert();
          }
        });
      });
    }
  }

  render() {
    if (this.state.message) {
      return (
        <Alert
          key={ this.state.messageId }
          ref="message"
          theme={ this.props.theme }
          closeable={ true }
        >
          { this.state.message }
        </Alert>
      );
    }
    return null;
  }
}
