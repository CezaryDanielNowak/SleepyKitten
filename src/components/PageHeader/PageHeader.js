import React from 'react';
import PropTypes from 'prop-types';
import config from 'config';
import BaseComponent from 'components/BaseComponent';
import { Link } from 'react-router';

export default class PageHeader extends BaseComponent {
  className = 'sk-PageHeader';

  static propTypes = {
    size: PropTypes.string,
    theme: PropTypes.string
  };

  state = {};

  render() {
    const classNameModifiers = {
      '--light': this.props.theme === 'light'
    };
    const brandingClassName = {
      '__branding': true,
      '__branding--dark': this.props.theme === 'light'
    };

    return (
      <div className={ this.rootcn(classNameModifiers) }>
        <div className={ this.cn('__primary-brand') }>
          <Link
            to={ config.BASE_PATH }
            className={ this.cn(brandingClassName) }
          >
            { DEFAULT_PAGE_TITLE }
          </Link>
        </div>
      </div>
    );
  }
}
