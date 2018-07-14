import React from 'react';
import noop from 'no-op';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import Icon from 'components/Icon';

export default class Radio extends BaseComponent {
  className = 'sk-Radio';

  static propTypes = {
    children: PropTypes.node,
    stateLink: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    radioStyle: PropTypes.oneOf(['check', 'radio']),
  };

  static defaultProps = {
    children: '',
    onChange: noop,
    radioStyle: 'check',
  };

  state = {};

  handleChange = (e) => {
    const [stateOwner, key] = this.props.stateLink;

    stateOwner.setState({
      [key]: this.props.value,
    }, () => {
      this.setValid(true);
      this.props.onChange(e);
    });
  };

  setValid = (status) => { // public
    this.setState({
      isValid: status,
    });
  };

  render() {
    const [stateOwner, key] = this.props.stateLink;
    const { isValid } = this.state;
    const { radioStyle } = this.props;
    const isError = typeof isValid === 'boolean' && !isValid;
    const modelValue = stateOwner.state[key];
    const internalValue = modelValue === this.props.value && modelValue !== null; // eslint-disable-line
    return (
      <div
        className={ this.rootcn({
          '__disabled': this.props.disabled,
        }) }
        role="button"
        tabIndex={ 0 }
        onClick={ this.props.disabled ? noop : this.handleChange }
      >
        <div
          className={ this.cn({
            [`__${radioStyle}`]: true,
            [`__${radioStyle}--selected`]: internalValue,
            [`__${radioStyle}--error`]: isError,
          }) }
        >
          {
            // modelValue can be undef/null if so, we don't render ico (undetermined support)
            internalValue ?
              <Icon
                className={ this.cn`__${radioStyle}-icon` }
                type={ radioStyle === 'radio' ? 'circle' : 'check' }
                size={ radioStyle === 'check' ? 16 : 7 }
              /> :
              null
          }
        </div>
        <span>{ this.props.children }</span>
      </div>
    );
  }
}
