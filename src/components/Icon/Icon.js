/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import model from './model';

function iconParser(svgIcon) {
  if (svgIcon.includes('<?xml')) {
    return svgIcon;
  }
  // io/android-warning
  return '<?xml version="1.0"?><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="m0 36.3l17.5-32.5 17.5 32.5h-35z m19.4-5v-3.8h-3.8v3.8h3.8z m0-6.3v-7.5h-3.8v7.5h3.8z"></path></svg>';
}

export default class Icon extends BaseComponent {
  className = 'sk-Icon';

  static propTypes = {
    children: PropTypes.string,
    color: PropTypes.string,
    external: PropTypes.bool,
    href: PropTypes.string,
    set: PropTypes.oneOf(['fa', 'io']),
    size: PropTypes.number,
    style: PropTypes.object,
    type: PropTypes.string.isRequired,
  };

  static defaultProps = {
    children: '',
    color: null,
    external: false,
    href: null,
    set: 'fa',
    size: 16,
    style: {},
  };

  state = {
    icon: model.get(`${this.props.set}/${this.props.type}`) || '',
  };

  componentDidMount() {
    this.updateIcon(this.props);
  }

  componentWillUpdate(nextProps) {
    this.updateIcon(nextProps);
  }

  updateIcon({ type, set }) {
    model.fetchIcon(type, set, (icon) => {
      if (!this.isDestroyed) {
        this.setState({
          icon: iconParser(icon),
        });
      }
    });
  }

  render() {
    const { size, type, color, href, external, style, children } = this.props;
    const classNames = {
      [`--${type}`]: true,
    };
    const className = this.rootcn(classNames);
    const defaultStyle = {
      color: color,
      height: `${size}px`,
      lineHeight: `${size}px`,
      width: `${size}px`,
    };

    if (href) {
      return (
        <a
          href={ href }
          target={ external ? '_blank' : '' }
          className={ className }
          style={ { ...defaultStyle, ...style } }
          title={ children }
          dangerouslySetInnerHTML={ { __html: this.state.icon } }
        />
      );
    }
    return (
      <span
        className={ className }
        style={ { ...defaultStyle, ...style } }
        title={ children }
        dangerouslySetInnerHTML={ { __html: this.state.icon } }
      />
    );
  }
}
