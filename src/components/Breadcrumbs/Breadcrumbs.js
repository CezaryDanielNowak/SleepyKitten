import React from 'react';
import _get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import is from 'next-is';
import PropTypes from 'prop-types';
import pathToRegexp from 'path-to-regexp';
import { browserHistory } from 'react-router';
import BaseComponent from 'components/BaseComponent';
import LiLink from 'components/LiLink';
import Routes from 'routes';

/*
 * This components takes react-router routes and generate breadcrumbs.
 * Each Route in react-router should have `breadcrumbTitle` prop.
 */
function getRoutesOf(routeParent) {
  const parentRoute = Routes.props.children.find((child) =>
    _get(child, 'props.path') === routeParent
  );

  if (!parentRoute) {
    throw new Error(`There is no route: ${routeParent}`);
  }

  let parentRouteChildren = parentRoute.props.children || [];

  if (!is.isArray(parentRouteChildren)) {
    parentRouteChildren = [parentRouteChildren];
  }

  return parentRouteChildren.map((childRoute) => childRoute.props);
}

function isActiveLink(path) {
  if (!is.browser()) return;
  // TODO: replace it with react-router helper. In react-router 2 it's not available
  const pathRegexp = pathToRegexp(path);

  const isActive = pathRegexp.test(location.pathname);
  return isActive;
}

export default class Breadcrumbs extends BaseComponent {
  className = 'sk-Breadcrumbs';

  static propTypes = {
    clickable: PropTypes.bool,
    responsive: PropTypes.bool,
    routeParent: PropTypes.string,
  };

  static defaultProps = {
    clickable: true,
    responsive: false,
    routeParent: '/',
  };

  state = {
    activeRoute: '',
    mounted: false,
  };

  setRoute = () => {
    this.setState({ activeRoute: location.pathname });
  }

  componentDidMount() {
    this.setState({ mounted: true }); // eslint-disable-line
    this.__listeners.push(
      browserHistory.listen(this.setRoute)
    );
  }

  renderRoutes() {
    // show only one label, when there are multiple links assigned to one Breadcrumb label.
    const uniqueElements = [];

    getRoutesOf(this.props.routeParent)
      .filter(({ breadcrumbTitle }) => breadcrumbTitle)
      .forEach((routeProps) => {
        const elementID = uniqueElements.findIndex((props) => {
          return props.breadcrumbTitle === routeProps.breadcrumbTitle;
        });

        if (elementID > -1) {
          // replace element with the same title, with active element.
          if (isActiveLink(routeProps.path)) {
            uniqueElements.splice(elementID, 1);
          } else {
            return;
          }
        }

        uniqueElements.push(routeProps);
      });

    const activeIndex = findIndex(uniqueElements, ({ path }) => isActiveLink(path));

    return uniqueElements.map((routeProps, index) => {
      const className = {
        '__item': true,
        '__item--active': this.state.mounted && index <= activeIndex,
      };
      const text = this.props.responsive && this.props.small ?
        `STEP ${index + 1}` :
        routeProps.breadcrumbTitle;
      return routeProps.breadcrumbTitle && (
        <LiLink
          clickable={ this.props.clickable }
          key={ `breadcrumb-${routeProps.path}` }
          className={ this.cn(className) }
          to={ routeProps.path }
          style={ { width: `${100 / uniqueElements.length}%` } }
        >
          { text }
        </LiLink>
      );
    });
  }

  render() {
    const className = {
      '__clickable': this.props.clickable,
    };
    return (
      <ol className={ this.rootcn(className) }>
        { this.renderRoutes() }
      </ol>
    );
  }
}
