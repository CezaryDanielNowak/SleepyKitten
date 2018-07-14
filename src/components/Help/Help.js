import React from 'react';
import _get from 'lodash/get';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import Button from 'components/Button';
import Icon from 'components/Icon';
import PageTitle from 'components/PageTitle';

export default class Help extends BaseComponent {
  className = 'sk-Help';

  state = {
    opened: false,
    theme: 'default',
  };

  handleGlobalEscapeKey = (e) => {
    if (e.keyCode === 27) {
      this.hide();
    }
  };

  componentDidMount() {
    this.addEventListener(window, 'keyup', this.handleGlobalEscapeKey);
  }

  show({ theme, title, headerInfo, content, narrow }) {
    this.setState({
      opened: true,
      theme: theme || 'default',
      content,
      headerInfo,
      narrow,
      title,
    });
  }

  hide = () => {
    this.setState({ opened: false });
  };

  render() {
    const className = {
      '--opened': this.state.opened,
      [`--theme-${this.state.theme}`]: true,
    };
    const wrapperClassName = {
      'sk-container': true,
      'sk-container--narrow': this.state.narrow
    };
    return (
      <div
        data-test-selector="help_message"
        className={ this.rootcn(className) }
      >
        <div className={ this.cn(wrapperClassName) }>
          { this.state.headerInfo
            ? <div className={ this.cn`__header-info` }>{ this.state.headerInfo }</div>
            : null
          }
          <div className={ this.cn`__close-button-wrapper` }>
            <Button
              data-test-selector="help_message_close_btn"
              className={ this.cn`__close-button` }
              theme="no-theme"
              title="Close Help"
              type="button"
              onClick={ this.hide }
            >
              <Icon set="io" type="close" />
            </Button>
          </div>
          <PageTitle
            className={ this.cn`__title` }
            title={ this.state.title || '' }
          />
          <div className={ this.cn`sk-hr __separator` } />
          <span className={ this.cn`__content` }>{ this.state.content }</span>
        </div>
      </div>
    );
  }
}

export class HelpButton extends BaseComponent {
  className = 'sk-HelpButton';

  static propTypes = {
    // jest somehow can't get the Buttons' propTypes
    theme: _get(Button, 'propTypes.theme') || PropTypes.string,
  };

  static defaultProps = {
    theme: 'accent',
  };

  handleClick = () => {
    this.publish('showHelp', this.props.help);
  }

  render() {
    return (
      <Button
        className={ this.rootcn`` }
        theme={ this.props.theme }
        title="Tap to view help"
        type="button"
        onClick={ this.handleClick }
      >
        ?
      </Button>
    );
  }
}
