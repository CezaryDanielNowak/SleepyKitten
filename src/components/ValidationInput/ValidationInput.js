import React from 'react';
import is from 'next-is';
import noop from 'no-op';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';

import BaseComponent from 'components/BaseComponent';
import AltValues from 'components/AltValues';
import Button from 'components/Button';
import Icon from 'components/Icon';
import IconButton from 'components/IconButton';
import Render from 'components/Render';
import { asset } from 'helpers';
import { getScript } from 'helpers/domHelper';

const emptyObj = {};
let promise;
function getInputMask() {
  // https://github.com/RobinHerbots/jquery.inputmask
  /* eslint-disable max-len */
  return new Promise((resolve, reject) => getScript(asset`/lib/inputmask/dependencyLibs/inputmask.dependencyLib.min.js`, true)
    .then(() => getScript(asset`/lib/inputmask/inputmask.min.js`, true))
    .then(() => Promise.all([
      getScript(asset`/lib/inputmask/inputmask.extensions.min.js`, true),
      getScript(asset`/lib/inputmask/inputmask.numeric.extensions.min.js`, true),
      getScript(asset`/lib/inputmask/inputmask.date.extensions.min.js`, true),
      getScript(asset`/lib/inputmask/inputmask.regex.extensions.min.js`, true),
      getScript(asset`/lib/inputmask/phone-codes/phone.min.js`, true)
    ]))
    .then(resolve)
    .catch(reject)
  );

  /* eslint-enable max-len */
}

export default class ValidationInput extends BaseComponent {
  className = 'sk-ValidationInput';

  static propTypes = {
    altValues: PropTypes.arrayOf(PropTypes.string),
    altValueTemplate: PropTypes.shape({
      prefix: PropTypes.string,
      suffix: PropTypes.string,
      connector: PropTypes.string,
      lastConnector: PropTypes.string,
    }),
    className: PropTypes.string,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
    error: PropTypes.string,
    displayName: PropTypes.node,
    initialValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    inputClassName: PropTypes.string,
    isOptional: PropTypes.bool,
    isValidatedByProp: PropTypes.bool,
    mask: PropTypes.string,
    maskOptions: PropTypes.object,
    mismatchInfo: PropTypes.bool,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onInput: PropTypes.func,
    onKeyUp: PropTypes.func,
    permanentPlaceholder: PropTypes.string,
    stateLink: PropTypes.array,
    type: PropTypes.string,
    extraText: PropTypes.string,
    extraTextAutohide: PropTypes.bool,
    hint: PropTypes.node,
    unmask: PropTypes.bool,
    parser: PropTypes.func,
  };

  static defaultProps = {
    clearable: false,
    displayName: '',
    error: null,
    isOptional: false,
    isValidatedByProp: false,
    maskOptions: null,
    mismatchInfo: false,
    onBlur: noop,
    onChange: noop,
    onFocus: noop,
    onInput: noop,
    onKeyUp: noop,
    permanentPlaceholder: '',
    type: 'text',
    unmask: false,
    parser: (input) => input,
  };

  state = {
    value: this.props.initialValue || '',
    isFocused: false,
    isBlurred: true,
    isEdited: false,
    isTouched: false,
    isValid: null,
  };

  setValid = (status, invalidMessage) => { // public
    this.setState({
      isValid: status,
      invalidMessage: status ? false : invalidMessage,
    });
  };

  clearValue = () => {
    this.value = null;
  };

  focus = () => { // public
    this.refs.input.focus();
  };

  getPermanentPlaceholder = (value = '') => {
    const placeholder = this.props.permanentPlaceholder;
    if (!placeholder) return null;
    const valueLength = value.replace(/-(\s)/g, '').trim().length;
    if (!valueLength) return placeholder;
    // Get length of the user input (n). Remove unnecessary slashes and leftover spaces.
    return ' '.repeat(valueLength) + placeholder.slice(valueLength);
  }

  handleFocus = (e) => {
    this.props.onFocus(e);
    this.setState({ isFocused: true, isBlurred: false });
  }

  handleKeyUp = (e) => this.props.onKeyUp(e);

  handleBlur = (e) => {
    this.setState({ isFocused: false, isBlurred: true, isEdited: false, isTouched: true });

    const [context, stateField] = this.props.stateLink || [];
    this.props.onBlur(e);

    if (this.props.mask) {
      this.handleChange(e);
      if (this.props.unmask && context) {
        // remove mask garbage when saving value to state.
        // HACK:
        //   In the ideal world unmasked value should be called in handleChange.
        //   Unfortunetely android webview is not an ideal world.
        context.setState({
          [stateField]: e.target.inputmask.unmaskedvalue(),
        });
      }
    }
  }

  handleChange = (e) => {
    // HACK for IE11
    //      handleBlur is called after handle change so
    //      change event overrides unmaskedvalue.
    if (this.props.unmask && document.activeElement !== e.target) {
      return;
    }

    // If the event has a type, it's been edited in DOM by the user
    if (e.type) {
      this.setState({ isEdited: true });
    }

    this.initChangePolling(); // restart polling
    const [context, stateField] = this.props.stateLink || [];
    const newValue = this.props.parser(this.value);

    const setStateCallback = () => {
      this.setValid(null);
      this.props.onChange(e, newValue);
    };

    if (context) {
      if (newValue === context.state[stateField]) {
        // nothing changed - triggering change is pointless
        return;
      }
      context.setState(() => ({
        [stateField]: newValue,
      }), setStateCallback);
    } else {
      this.setState(() => ({ value: newValue }), setStateCallback);
    }
  };

  handleCheckboxToggle = () => {
    const input = findDOMNode(this.refs.input);
    input.checked = !input.checked;
    this.handleChange({ target: input });
  }

  renderLabel() {
    if (!this.props.displayName) return null;

    return (
      <label
        htmlFor={ `${this.className}-${this.componentId}` }
        className={ this.cn`__label` }
      >
        { this.props.displayName }
        { this.props.isOptional &&
          <span className={ this.cn`__label-optional` }>
            { ' (optional)' }
          </span> }
      </label>
    );
  }

  /**
   * Theoretically value should be automaticly populated to the state, but due Safari/osX bug
   * with autocomplete, it's safer to read data from DOM node.
   */
  get value() {
    if (this.props.unmask) {
      const node = findDOMNode(this.refs.input);
      return node.inputmask.unmaskedvalue();
    }

    return this.refs.input[this.props.type === 'checkbox' ? 'checked' : 'value'];
  }

  set value(val) {
    this.refs.input[this.props.type === 'checkbox' ? 'checked' : 'value'] = val;
    this.handleChange({ target: this.refs.input });
  }

  initInputMask() {
    if (this.props.mask !== undefined && this.props.mask !== this.oldMask) {
      // - load input mask on first mask use
      // - disable input when script is loading
      let firstLoad;
      this.oldMask = this.props.mask;
      if (!promise) {
        firstLoad = true;
        this.setState({ isDisabled: true });
      }
      promise = getInputMask();
      promise.then(() => {
        const node = findDOMNode(this.refs.input);
        if (!node) return;
        if (firstLoad) this.setState({ isDisabled: false });
        firstLoad = false;

        /* eslint-disable new-cap */
        global.Inputmask(
          this.props.mask,
          // NOTE: do not use defaultProps.maskOptions = {}.
          // InputMask polutes it with own configs, that causes rerender.
          this.props.maskOptions || {}
        ).mask(node);
        /* eslint-enable */
      });
    }
  }

  initChangePolling() {
    return; // This hack was breaking other things, needed to be removed

    // HACK for apple. again.
    // https://github.com/facebook/react/issues/1159
    // Safari autocomplete does not trigger `change` event. It does not trigger any event.
    // blur/focus events are not helpful here, as autocomplete is triggered for whole form.

    /* eslint-disable */
    clearInterval(this.changePollInterval);
    if (this.props.type === 'checkbox') return;

    this.changePollInterval = setInterval(() => {
      const input = findDOMNode(this.refs.input);
      const [context, stateField] = this.props.stateLink || [];
      const currentValue = input.value || '';
      const stateValue = context.state[stateField] || '';
      const unmaskEquality = this.props.unmask &&
        input.inputmask &&
        input.inputmask.unmaskedvalue() === stateValue;
      if (context && currentValue !== stateValue && !unmaskEquality) {
        console.info('polling was required to update field', currentValue, '!==', stateValue); // eslint-disable-line
        // field changed but state is the same? That's mean change did not trigger
        this.handleChange({ target: input });
      }
    }, 333);
    /* eslint-enable */
  }

  componentDidMount() {
    this.initInputMask();
    this.initChangePolling();
  }

  displayErrorIfNeeded() {
    if (!this.props.isValidatedByProp) return;
    if (
      this.props.error &&
      this.state.isTouched &&
      !this.state.isEdited
    ) {
      this.setValid(false, this.props.error);
    } else {
      this.setValid(true);
    }
  }

  componentDidUpdate() {
    this.displayErrorIfNeeded();
    this.initInputMask();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this.changePollInterval);
  }

  handleAltValueClick = (index) => () => {
    const lastValue = this.value;
    this.value = this.props.altValues[index];
    this.props.altValues[index] = lastValue;
    this.setState(() => ({ isTouched: true }));
  }

  renderHint() {
    if (this.state.isValid === false && this.state.invalidMessage) {
      return (
        <div className={ this.cn`__hint __hint--error` } ref="hint">
          { this.state.invalidMessage }
        </div>
      );
    }

    return this.props.hint
      ? <div className={ this.cn`__hint` } ref="hint">{ this.props.hint }</div>
      : null;
  }

  renderMismatchInfo = () => {
    const { mismatchInfo } = this.props;
    const classNames = {
      '__mismatch-info': mismatchInfo,
      '__mismatch-info--visible': mismatchInfo && !this.state.isTouched,
      '__mismatch-info--cleared': mismatchInfo && (this.state.isTouched || this.state.isEdited),
    };
    return (
      <span className={ this.cn(classNames) }>
        <Icon
          className={ this.cn`__mismatch-icon` }
          set="io"
          size={ 16 }
          type="ios-information"
        />
        <div className={ this.cn`__mismatch-text` }>
          Please pick the correct one or type it on your own.
        </div>
      </span>
    );
  };

  handleHintClick = (e) => {
    e.preventDefault();
    this.setValid(true);
    findDOMNode(this.refs.input).focus();
  }

  render() {
    const isInvalid = this.state.isValid === false;
    const {
      altValues,
      altValueTemplate,
      disabled,
      extraText,
      extraTextAutohide,
      hint,
      inputClassName,
      inputMode,
      mask,
      mismatchInfo,
      permanentPlaceholder,
      title,
    } = this.props;
    const {
      isEdited,
      isTouched,
    } = this.state;
    const inputClassNames = {
      '__field': true,
      '__field--success': this.state.isValid,
      '__field--masked': !!mask,
      '__field--danger': isInvalid,
      '__field--warning': !this.state.isTouched && mismatchInfo,
      [inputClassName]: inputClassName,
    };
    const wrapClassNames = {
      '__field-wrap': true,
      '__field-wrap--permanent-placeholder': permanentPlaceholder,
      '__field-wrap--has-hint': hint || isInvalid,
      '__field-wrap--extra-text-autohide': extraTextAutohide,
      '__field-wrap--is-focused': this.state.isFocused,
      '__field-wrap--clearable': this.props.clearable,

      // bootstrap-specific:
      // Bootstrap requires input parent to have has-danger class.
      'has-danger': !this.state.isValid,
      'has-success': this.state.isValid,
    };

    const [context, stateField] = this.props.stateLink || [];
    const value = (context ? context.state[stateField] : this.state.value) || '';

    const isDisabled = this.state.isDisabled || disabled || false;
    // HACK for android to bring numberpad instead of full keyboard.
    const type = inputMode === 'numeric' && is.android() ? 'tel' : this.props.type;

    // HACK for ios to bring numberpad instead of full keyboard.
    // desktop browser needs full pattern to avoid "Please match the requested format"
    const pattern = this.props.pattern ||
      inputMode === 'numeric' && (is.iOS() ? '[0-9]*' : '[0-9 +\\-\\(\\)]*') ||
      undefined;

    return (
      <div
        className={ this.rootcn({
          [`--type-${this.props.type}`]: true,
          [this.props.className]: this.props.className,
        }) }
      >
        { this.renderLabel() }
        <span
          className={ this.cn(wrapClassNames) }
          data-permanent-placeholder={ this.getPermanentPlaceholder(value) }
          style={ this.state.style || emptyObj }
        >
          <Render when={ this.props.type === 'checkbox' }>
            <Button
              theme="no-theme"
              type="button"
              onClick={ this.handleCheckboxToggle }
              className={ this.cn('__checkbox-icon') }
            >
              { value ?
                <Icon
                  className={ this.cn`__checkbox-icon--accepted` }
                  key="outline"
                  set="io"
                  type="android-checkbox-outline"
                  size={ 24 }
                /> :
                <Icon
                  key="blank"
                  set="io"
                  type="android-checkbox-outline-blank"
                  size={ 24 }
                />
              }
            </Button>
          </Render>
          { hint
            ? <IconButton
              buttonType="button"
              iconSize={ 22 }
              className={ this.cn`__hint-icon` }
              set="io"
              tabIndex="-1"
              type="ios-information"
              onClick={ this.handleHintClick }
            />
            : null
          }
          <input
            { ...this.pickProps(
              'inputMode',
              'autoFocus',
              'maxLength',
              'minLenght',
              'placeholder',
              'onInput',
            )
            }
            className={ this.cn(inputClassNames) }
            disabled={ isDisabled }
            pattern={ pattern }
            ref="input"
            title={ this.state.invalidMessage || title }
            type={ type }
            value={ value || value === 0 ? value : '' }
            onBlur={ this.handleBlur }
            onChange={ this.handleChange }
            onFocus={ this.handleFocus }
            onKeyUp={ this.handleKeyUp }
          />
          { this.props.clearable &&
            value &&
            <Button
              className={ this.cn`__clear-button` }
              theme="link"
              tabIndex="-1"
              type="button"
              onClick={ this.clearValue }
            >
              ×
            </Button>
          }
          { /* WARN: hint needs to be placed right after input, so `input + __hint`
              selector will work */ }
          { this.renderHint() }
          { extraText
            ? <div className={ this.cn`__extra-text` }>{ extraText }</div>
            : null
          }
          { mismatchInfo ? this.renderMismatchInfo() : null }
          { altValues && altValues.length && !isTouched && !isEdited ? (
            <AltValues
              onClick={ this.handleAltValueClick }
              template={ altValueTemplate }
              values={ altValues }
            />
          ) : null }
        </span>
      </div>
    );
  }
}

// HISTORY:
// react-input-mask 0.6.4 was replaced with jquery.inputmask. it was generating
// various problems in Android.
