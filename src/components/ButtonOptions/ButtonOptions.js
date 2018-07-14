import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from 'components/BaseComponent';
import Button from 'components/Button';

export default class ButtonOptions extends BaseComponent {
  className = 'sk-ButtonOptions';

  state = {};

  static propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.node,
      }),
    ),
    header: PropTypes.node,
    onChange: PropTypes.func.isRequired,
    maxColumns: PropTypes.number,
    value: PropTypes.string,
  };

  static defaultProps = {
    maxColumns: 6,
    options: [],
  };

  get value() {
    return 'value' in this.state ?
      this.state.value
      : this.props.value;
  }

  set value(value) {
    const oldVal = this.value;

    if (!this.state.isValid) {
      this.setValid(true);
    }

    this.setState({ value }, () => {
      if (oldVal === value) return;

      this.props.onChange(value);
    });
  }

  setValid = (status, invalidMessage) => { // public
    this.setState({
      isValid: status,
      invalidMessage: status ? false : invalidMessage,
    });
  };

  focus = () => ( // public
    this.buttonNode && this.buttonNode.focus()
  );

  render() {
    if (!this.props.options.length) return null;

    const columns = Math.min(
      this.props.options.length,
      this.props.maxColumns,
    );

    const classNames = {
      'grid': true,
      '--has-error': !this.state.isValid,
    };

    return (
      <div
        { ...this.pickProps() }
        className={ this.rootcn(classNames) }
        data-toggle=""
      >
        { this.props.header &&
          <h2 key="header" className={ this.cn`__header` }>
            { this.props.header }
          </h2>
        }

        { this.state.invalidMessage && (
          <div key="invalidMsg" className={ this.cn`__form-error` }>
            { this.state.invalidMessage }
          </div>
        ) }

        { this.props.options.map(({ value, label }) => (
          <div
            className={ `col-preserve-1-${columns} sk-center` }
            key={ value }
          >
            <Button
              ref={ this.createRef('buttonNode') }
              type="button"
              className={ this.cn({
                '__button': true,
                '__button--active': this.value === value
              }) }
              onClick={ () => {
                this.value = value;
              } }
            >
              { label }
            </Button>
          </div>
        )) }
      </div>
    );
  }
}
