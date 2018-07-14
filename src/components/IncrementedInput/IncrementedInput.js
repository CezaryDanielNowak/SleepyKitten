import React from 'react';
import noop from 'no-op';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import Icon from 'components/Icon';
import ValidationInput from 'components/ValidationInput';

export default class IncrementedInput extends BaseComponent {
  className = 'sk-IncrementedInput';

  static propTypes = {
    initialValue: PropTypes.number,
    disableIncrementing: PropTypes.bool,
    disableDecrementing: PropTypes.bool,
  };

  static defaultProps = {
    initialValue: 0,
    disableIncrementing: false,
    disableDecrementing: false,
    onValueChange: noop,
  };

  state = {
    value: parseInt(this.props.initialValue, 10),
  };

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.initialValue !== this.props.initialValue) {
      nextState.value = nextProps.initialValue;
    }
  }

  handleDecrementButtonClick = (e) => {
    this.setValue(this.state.value > 0 ? parseInt(this.state.value, 10) - 1 : '');
    e.preventDefault();
  }

  handleIncrementButtonClick = (e) => {
    this.setValue(this.state.value ? parseInt(this.state.value, 10) + 1 : 1);
    e.preventDefault();
  }

  handleInputChange = (e, value) => {
    this.setValue(value.replace(/\D/i, ''));
  }

  setValue = (value) => {
    this.setState({
      value,
    }, () => {
      this.props.onValueChange(this.state.value);
    });
  }

  render() {
    return (
      <div className={ this.rootcn() }>
        <button
          className={ this.cn`__credits-change-button` }
          disabled={ this.props.disableDecrementing }
          onClick={ this.handleDecrementButtonClick }
        >
          <Icon
            set="io"
            size={ 16 }
            type="minus-circled"
          />
        </button>
        <ValidationInput
          { ...this.props }
          className={ this.cn`__credits-change-input` }
          stateLink={ [this, 'value'] }
          type="numeric"
          onChange={ this.handleInputChange }
        />
        <button
          className={ this.cn`__credits-change-button` }
          disabled={ this.props.disableIncrementing }
          onClick={ this.handleIncrementButtonClick }
        >
          <Icon
            set="io"
            size={ 16 }
            type="plus-circled"
          />
        </button>
      </div>
    );
  }
}
