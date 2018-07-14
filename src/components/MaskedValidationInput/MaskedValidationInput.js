import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import ValidationInput from 'components/ValidationInput';
import omit from 'lodash/omit';
import { findDOMNode } from 'react-dom';
import noop from 'no-op';
import is from 'next-is';

// NOTE:
// This is an modified version of https://github.com/estelle/input-masking
// What's changed
// - redundant 'shell' span is not created
// - library reacts to 'input' event instead of 'keyup'
// - fix for cases when mask is long like: **** **** **XX XXXX
function InputMask(opts) {
  if (opts && opts.masked) {
    // Make it easy to wrap this plugin and pass elements instead of a selector
    opts.masked = typeof opts.masked === 'string'
      ? document.querySelectorAll(opts.masked)
      : opts.masked;
  }

  if (opts) {
    this.opts = {
      masked: opts.masked || document.querySelectorAll(this.d.masked),
      mNum: opts.mNum || this.d.mNum,
      mChar: opts.mChar || this.d.mChar,
      error: opts.onError || this.d.onError
    };
  } else {
    this.opts = this.d;
    this.opts.masked = document.querySelectorAll(this.opts.masked);
  }

  this.refresh(true);
}

Object.assign(InputMask.prototype, {
  // Default Values
  d: {
    masked: '.masked',
    mNum: 'XdDmMyY9',
    mChar: '_',
    onError: function () {}
  },

  refresh: function () {
    for (let i = 0, len = this.opts.masked.length; i < len; i++) {
      const t = this.opts.masked[i];

      if (!t.parentNode.classList.contains('shell')) {
        this.createShell(t);
      }
    }
  },

  // replaces each masked t with a shall containing the t and it's mask.
  createShell: function (t) {
    const wrap = t.parentNode;
    const mask = document.createElement('span');
    const emphasis = document.createElement('i');
    const pTxt = t.getAttribute('placeholder');
    const placeholder = document.createTextNode(pTxt);

    t.setAttribute('maxlength', placeholder.length);
    t.setAttribute('data-placeholder', pTxt);
    t.removeAttribute('placeholder');


    t.classList.add('masked');

    mask.setAttribute('aria-hidden', 'true');
    mask.setAttribute('class', 'masked__mask');
    mask.appendChild(emphasis);
    mask.appendChild(placeholder);

    wrap.classList.add('shell');
    wrap.appendChild(mask);
  },

  getValueOfMask: function (target) {
    const value = target.value;
    const placeholder = target.getAttribute('data-placeholder');

    return `<i>${value}</i>${placeholder.substr(value.length)}`;
  },

  handleValueChange: function (e) {
    const input = e.target;
    const mask = input.parentNode.querySelector('.masked__mask');
    input.value = this.getCurrentValue(input);
    mask.innerHTML = this.getValueOfMask(input);
  },

  getCurrentValue: function (input) {
    const isCharsetPresent = input.getAttribute('data-charset');
    const placeholder = isCharsetPresent || input.getAttribute('data-placeholder');
    const value = input.value;
    let newValue = '';

    // strip special characters
    const strippedValue = isCharsetPresent ? value.replace(/\W/g, '') : value.replace(/\D/g, '');

    for (let i = 0, j = 0, len = placeholder.length; i < len; i++) {
      const isInt = !isNaN(parseInt(strippedValue[j], 10));
      const isLetter = strippedValue[j] ? strippedValue[j].match(/[A-Z]/i) : false;
      const matchesNumber = this.opts.mNum.indexOf(placeholder[i]) >= 0;
      const matchesLetter = this.opts.mChar.indexOf(placeholder[i]) >= 0;
      if ((matchesNumber && isInt) || (isCharsetPresent && matchesLetter && isLetter)) {
        newValue += strippedValue[j++];
      } else if (
        (!isCharsetPresent && !isInt && matchesNumber)
        || (isCharsetPresent && ((matchesLetter && !isLetter)
        || (matchesNumber && !isInt)))
      ) {
        return newValue;
      } else {
        newValue += placeholder[i];
      }
      // break if no characters left and the pattern is non-special character
      if (strippedValue[j] === undefined) {
        break;
      }
    }

    // fix for cases when mask is long like: **** **** **XX XXXX
    const firstMeaningfulMatch = placeholder.match(new RegExp(`[${this.opts.mNum}]`))
      || { index: 0 };
    if (firstMeaningfulMatch.index > newValue.length) {
      newValue = placeholder.substr(0, firstMeaningfulMatch.index);
    }

    return newValue;
  }
});

export default class MaskedValidationInput extends BaseComponent {
  className = 'sk-MaskedValidationInput';

  static propTypes = {
    charset: PropTypes.string,
    onInput: PropTypes.func,
    onKeyUp: PropTypes.func,
    pattern: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
  };

  static defaultProps = {
    onInput: noop,
    onKeyUp: noop,
  };

  focus(...args) { return this.refs.root.focus(...args); }
  setValid(...args) { return this.refs.root.setValid(...args); }
  clearValue(...args) { return this.refs.root.clearValue(...args); }
  getPermanentPlaceholder(...args) { return this.refs.root.getPermanentPlaceholder(...args); }
  get value() { return this.refs.root.value; }
  set value(val) { this.refs.root.value = val; }

  componentDidMount() {
    this.inputmaskInstance = new InputMask({
      masked: findDOMNode(this.refs.root).querySelectorAll('input')
    });
  }

  handleInput = (e) => {
    this.props.onInput(e);
    if (!is.android()) {
      this.inputmaskInstance.handleValueChange(e);
    }
  }

  handleKeyUp = (e) => {
    // NOTE: SYF-130
    // cursor is jumping when using inputmask with onInput. It happens on some
    // android devices. To fix the issue, use onKeyUp there.
    // - Use onInput on every other device to prevent noticeable lag.
    this.props.onKeyUp(e);
    if (is.android()) {
      this.inputmaskInstance.handleValueChange(e);
    }
  }

  render() {
    return (
      <ValidationInput
        ref="root"
        { ...omit(this.props, ['mask', 'charset']) }
        data-charset={ this.props.charset }
        className={ this.rootcn`` }
        inputClassName="masked"
        onInput={ this.handleInput }
        onKeyUp={ this.handleKeyUp }
      />
    );
  }
}
