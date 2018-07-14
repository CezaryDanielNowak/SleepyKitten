import React from 'react';
import omit from 'lodash/omit';
import noop from 'no-op';
import PropTypes from 'prop-types';
import ReactSelect from 'react-select';
import BaseComponent from 'components/BaseComponent';

class NativeSelect extends BaseComponent {
  /**
   * NativeSelect is just standard HTML select.
   * It does not reflect all features of Select, so please be conscious
   * when using it.
   */


  render() {
    return (
      <select
        { ...this.pickProps() }
        className={ this.rootcn() }
      />
    );
  }
}

export default class Select extends BaseComponent {
  className = 'sk-Select';

  static propTypes = {
    async: PropTypes.bool,
    convertBooleans: PropTypes.bool,
    disabled: PropTypes.bool,
    displayName: PropTypes.string,
    error: PropTypes.string,
    isValid: PropTypes.oneOf([true, false, null]),
    isValidatedByProp: PropTypes.bool,
    loadingPlaceholder: PropTypes.string,
    modifierClassName: PropTypes.string,
    placeholderAlwaysVisible: PropTypes.bool,
    stateLink: PropTypes.array,
    wrapperOnClick: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    nativeOnMobile: PropTypes.bool,
  };

  static defaultProps = {
    convertBooleans: false,
    displayName: '',
    error: '',
    isValidatedByProp: false,
    placeholderAlwaysVisible: true,
    onBlur: noop,
    onFocus: noop,
    wrapperOnClick: noop,
    nativeOnMobile: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isValid: props.isValid,
      value: props.value,
    };
  }

  get value() {
    return this.state.value;
  }

  set value(value) {
    this.setState({ value });
  }

  componentDidUpdate() {
    this.displayErrorIfNeeded();
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      this.value = nextProps.value;
    }
  }

  displayErrorIfNeeded() {
    if (!this.props.isValidatedByProp) return;
    if (this.props.error) {
      this.setValid(false, this.props.error);
    } else {
      this.setValid(true);
    }
  }

  setValid = (status, invalidMessage = '') => { // public
    this.setState({
      isValid: status,
      invalidMessage: status ? false : invalidMessage,
    });
  };

  handleBlur = (e) => {
    this.setState({ placeholderVisible: !!this.props.placeholderAlwaysVisible });
    this.props.onBlur(e);
  };

  handleChange = (newValue) => {
    const { stateLink } = this.props;
    const callback = () => {
      this.setValid(null);

      if (this.props.onChange) {
        this.props.onChange(newValue);
      }
    };

    if (stateLink) {
      stateLink[0].setState({
        [stateLink[1]]: newValue ? newValue.value : null,
      }, callback);
    } else {
      this.setState({ value: newValue ? newValue.value : null }, callback);
    }
  };

  handleFocus = (e) => {
    this.setState({ placeholderVisible: true });
    this.props.onFocus(e);
  };

  renderLabel() {
    if (!this.props.displayName) return null;

    return (
      <label
        htmlFor={ `${this.className}-${this.componentId}` }
        className={ this.cn`__label` }
      >
        { this.props.displayName }
      </label>
    );
  }

  renderValueLabel = (option) => {
    return (
      <span>
        <span className="Select-value-label-placeholder">
          { this.props.placeholder }
        </span>
        <span className="Select-value-label-text">
          { option.label }
        </span>
      </span>
    );
  }

  focus() { // public
    this.refs.input.focus();
  }

  render() {
    let Component = this.props.async
      ? ReactSelect.Async
      : ReactSelect;
    if (this.props.nativeOnMobile) {
      Component = NativeSelect;
    }

    const selectClassNames = {
      '__field': true,
      '__field--success': this.state.isValid,
      '__field--danger': this.state.isValid === false,
    };
    const rootClassName = this.props.modifierClassName ? `--${this.props.modifierClassName}` : '';
    const [context, stateField] = this.props.stateLink || [];
    const value = this.props.value || (context ? context.state[stateField] : this.state.value);
    const placeholder = this.state.placeholderVisible ? this.props.placeholder : '';
    const propsToOmit = [
      'async', 'isValid', 'stateLink', 'modifierClassName', 'onChange', 'value', 'wrapperOnClick',
    ];
    return (
      <div
        { ...this.pickProps(/* NOTE: ReactSelect does not accept data-* props */) }
        className={ this.rootcn(rootClassName) }
        data-toggle={ this.state.invalidMessage ? 'tooltip' : '' }
        onClick={ this.props.wrapperOnClick }
        role="button"
        tabIndex={ this.props.wrapperOnClick === noop ? -1 : 1 }
        title={ this.state.invalidMessage || this.props.title }
      >
        { this.renderLabel() }
        <Component
          { ...omit(this.props, propsToOmit) }
          cache={ false }
          className={ this.cn(selectClassNames) }
          onBlurResetsInput={ true }
          openAfterFocus={ true }
          openOnFocus={ true }
          placeholder={ placeholder }
          ref="input"
          value={ value }
          valueRenderer={ this.renderValueLabel }
          tabIndex={ this.props.disabled ? '-1' : this.props.tabIndex }
          onBlur={ this.handleBlur }
          onChange={ this.handleChange }
          onFocus={ this.handleFocus }
        />
      </div>
    );
  }
}
