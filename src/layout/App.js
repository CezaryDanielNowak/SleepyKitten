// libs
import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';

// components
import BaseComponent from 'components/BaseComponent';
import FloatingText from 'components/FloatingText';
import GlobalLoader from 'components/GlobalLoader';
import Help from 'components/Help';
import MediatorAlert from 'components/MediatorAlert';

// helpers
import { blockPageInTransition } from 'helpers/domHelper';

/*
 * React router renders component inside root component (App), even if route is nested.
 * This method helps to create nested components tree.
 */
const getParentComponent = (componentName, parentRoute) => {
  return parentRoute.childRoutes.find((route) => {
    if (route.childRoutes) {
      return getParentComponent(componentName, route);
    }

    return route.path === componentName;
  });
};

export default class App extends BaseComponent {
  static propTypes = {
    children: PropTypes.node
  };

  state = {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== (this.props.location || {}).pathname) {
      this.publish('locationChange');
    }
  }

  componentDidMount() {
    this.subscribe('showHelp', debounce((payload) => {
      this.refs.help.show(payload);
    }, 50));
    this.subscribe('hideHelp', () => this.refs.help.hide());
    this.subscribe('locationChange', () => {
      blockPageInTransition();
      this.refs.help.hide();
    });

    // NOTE:
    // When dialog is showed up, floating text shows inside an active dialog!
    this.subscribe('showFloatingText', (payload) => {
      if (ENV === 'local' && !payload.text) {
        // eslint-disable-next-line no-console
        console.warn('[DEBUG] Provide payload.text to `showFloatingText` event');
      }
      // TODO: proper name
      if (document.querySelector('.rc-dialog-container')) {
        this.publish('showFloatingText--dialog', payload);
      } else {
        this.refs.floatingText.showFloatingText(payload);
      }
    });
  }

  renderChildren() {
    const parentComponentRoute = getParentComponent(this.props.params.splat, this.props.route);
    const ParentComponent = parentComponentRoute ? parentComponentRoute.component : null;
    if (ParentComponent) {
      return (
        <ParentComponent key="chd">
          { this.props.children }
        </ParentComponent>
      );
    }
    return this.props.children;
  }

  // returns matching route first parent's` layout` attribute
  getLayout() {
    return this.props.routes.filter((route) => route.layout).pop().layout;
  }

  getAppBody() {
    return [
      <FloatingText key="ft" ref="floatingText" />,
      <Help key="help" ref="help" />,
      <div key="ct" className="sk-container">
        <MediatorAlert key="err" listenTopic="error" closeTopic="locationChange" theme="danger" />
        <MediatorAlert key="wn" listenTopic="warning" closeTopic="locationChange" theme="warning" />
        <MediatorAlert key="info" listenTopic="info" closeTopic="locationChange" theme="info" />
        <MediatorAlert key="sc" listenTopic="success" closeTopic="locationChange" theme="success" />
      </div>,
      <GlobalLoader key="ld" />,
      this.renderChildren()
    ];
  }

  render() {
    const { className } = this.props.route;
    const layout = this.getLayout();
    return React.createElement(layout, { ...this.props, className }, this.getAppBody());
  }
}
