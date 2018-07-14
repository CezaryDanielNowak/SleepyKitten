import React from 'react';
import debounce from 'lodash/debounce';
import noop from 'no-op';
import PropTypes from 'prop-types';
import AltValues from 'components/AltValues';
import ValidationInput from 'components/ValidationInput';
import BaseComponent from 'components/BaseComponent';
import { SEC } from 'models/date';

const FIELDS = [
  'day',
  'month',
  'year',
];

const SHORT_INPUT_PROPS = [
  {
    name: 'day',
    placeholder: 'DD',
    limit: 3,
  },
  {
    name: 'month',
    placeholder: 'MM',
    limit: 1,
  },
];

export default class ValidationDateInput extends BaseComponent {
  className = 'sk-ValidationDateInput';

  state = {
    isEdited: false,
    isInitialDateSet: false,
    isTouched: false,
  };

  static propTypes = {
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    mismatchInfo: PropTypes.bool,
    displayName: PropTypes.string.isRequired,
    reversedFormat: PropTypes.bool,
    stateLink: PropTypes.array.isRequired,
  };

  static defaultProps = {
    onChange: noop,
    onBlur: noop,
    reversedFormat: false,
    mismatchInfo: false,
  };

  componentDidUpdate() {
    const [context, stateField] = this.props.stateLink;
    const newValue = context.state[stateField];
    if (
      this.state.isInitialDateSet &&
      newValue === this.state.dateSetFromProps
    ) return;
    this.setDateFromProps();
  }

  focusNextInput = () => document
    .activeElement
    .parentElement
    .parentElement
    .nextSibling
    .getElementsByTagName('input')[0]
    .focus();

  handleAltValueClick = (index) => () => {
    const [context, stateField] = this.props.stateLink;
    const lastValue = context.state[stateField];
    this.setDate(this.props.altValues[index]);
    this.props.altValues[index] = lastValue;
    this.setState(() => ({ isTouched: true }));
  };

  handleChange = (e) => {
    const [context, stateField] = this.props.stateLink;
    context.setState(() => ({
      [stateField]: this.joinDate(),
    }), () => {
      // This receives a syntetic event when changed in
      // ValidationInput (so by the user in the DOM)
      // or no event if it's changed by the altValue
      if (e) {
        this.setState({ isEdited: true });
      }
      this.setValid(null);
      this.props.onChange(e);
    });
  };

  handleFocus = () => {
    this.setState({ isTouched: true });
  };

  handleBlur = debounce(() => {
    this.props.onBlur();
  }, SEC);

  getShortInputChangeHandler = (limit) => (e, newValue) => {
    this.handleChange(e, newValue);
    return (newValue > limit) && this.focusNextInput();
  };

  inputParser = (input) => (input || '')
    .replace(/\D/gi, '')
    .replace(/0{2,}/gi, 0);

  joinDate = () => {
    const { day, month, year } = this.state;
    return [
      year,
      `0${month}`.substr(-2),
      `0${day}`.substr(-2),
    ].join('-');
  };

  renderShortInputs = () => {
    const { isTouched } = this.state;
    const { mismatchInfo } = this.props;
    const props = this.props.reversedFormat ?
      [...SHORT_INPUT_PROPS]
        .reverse() :
      SHORT_INPUT_PROPS;
    return props
      .map(({
        name,
        placeholder,
        limit,
      }) => (
        <ValidationInput
          className={ this.cn`__date-input __date-input--short` }
          inputMode="numeric"
          key={ name }
          maxLength="2"
          mismatchInfo={ mismatchInfo && !isTouched }
          onChange={ this.getShortInputChangeHandler(limit) }
          onBlur={ this.handleBlur }
          onFocus={ this.handleFocus }
          parser={ this.inputParser }
          placeholder={ placeholder }
          ref={ name }
          stateLink={ [this, name] }
        />
      ));
  };

  setDate = (date) => {
    const [year, month, day] = date
      .split('-')
      .map((text) => Number.parseInt(text, 10) || '');
    this.setState(() => ({
      year,
      month,
      day,
    }));
  };

  setDateFromProps = () => {
    const [context, stateField] = this.props.stateLink;
    const newDate = context.state[stateField];
    if (!newDate) return;
    this.setDate(newDate);
    this.setState({
      dateSetFromProps: newDate,
      isInitialDateSet: true,
    });
  };

  setValid = (validity, error) => FIELDS
    .map((field) => this.refs[field].setValid(validity, error));

  render() {
    const {
      altValues,
      altValueTemplate,
      displayName,
      mismatchInfo,
    } = this.props;
    const {
      isEdited,
      isTouched,
    } = this.state;
    return (
      <div
        className={ this.rootcn`` }
      >
        { /* eslint-disable jsx-a11y/label-has-for */ }
        <label className={ this.cn`__label` }>{ displayName }</label>
        { /* eslint-enable */ }
        <div className={ this.cn`__inputs` }>
          { this.renderShortInputs() }
          <ValidationInput
            className={ this.cn`__date-input __date-input--long __date-year` }
            inputMode="numeric"
            key="year"
            maxLength="4"
            mismatchInfo={ mismatchInfo && !isTouched }
            onBlur={ this.handleBlur }
            onChange={ this.handleChange }
            onFocus={ this.handleFocus }
            parser={ this.inputParser }
            placeholder="YYYY"
            ref="year"
            stateLink={ [this, 'year'] }
          />
        </div>
        { mismatchInfo && !isEdited ? (
          <AltValues
            className={ this.cn`__altvalues` }
            onClick={ this.handleAltValueClick }
            template={ altValueTemplate }
            values={ altValues }
          />
        ) : null }
      </div>
    );
  }
}
