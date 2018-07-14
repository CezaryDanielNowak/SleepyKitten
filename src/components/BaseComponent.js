import { PureComponent } from 'react';
import isPlainObject from 'lodash/isPlainObject';
import is from 'next-is';
import noop from 'no-op';
import { findDOMNode } from 'react-dom';
import { mediator, navigate, advancedPick } from 'helpers';
import {
  addEventListener,
  removeEventListener,
  scrollTo,
} from 'helpers/domHelper';

function syncOnModelChange(that, model, key) {
  const args = [
    key,
    (value) => {
      that.setState({
        [key]: value,
      });
    },
  ];
  model.on(...args);
  that.__listeners.push(() => {
    model.off(...args);
  });
}

/**
 * get value of every ref (potentially ValidationInput, Select etc)
 * returned as an object. This should be easly used with validation.
 */
function getRefValues(that, prefix = 'form') {
  const regexp = new RegExp(`^${prefix.replace('.', '\\.')}`);
  return Object.keys(that.refs).reduce((result, key) => {
    if (regexp.test(key)) { // use only refs starting with [prefix]
      result[key.replace(regexp, '')] = that.refs[key].value;
    }
    return result;
  }, {});
}

let componentId = 0;

export default class BaseComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.__listeners = [];
    this.componentId = ++componentId;
    if (is.browser()) {
      this.constructorBrowser(props);
    }
  }

  componentWillUnmount() {
    this.__listeners.forEach((remove) => remove());
    this.__listeners.length = 0;
    this.isDestroyed = true;
  }

  /**
   * React's setTimeout implementation with few benefits:
   * - timeout function is not called when component is unmounted
   * - timeouts can be chained
   *
   * @param {Function} fn
   * @param {Number}   time
   * @param {mixed} ...args
   */
  setTimeout(fn, time = 0, ...args) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.isDestroyed) {
          return reject();
        }
        resolve(fn(...args));
      }, time);
    })
      .catch(noop);
  }

  constructorBrowser() { /* override me */ }

  /**
   * Join class names of any type to string
   *
   * cn(['a', 'b', 'c']) // => 'a b c'
   * cn({
   *   a: true,
   *   b: false,
   *   c: true
   * })                                  // => 'a c'
   *
   *
   * for this.className = sk-Xyz:
   *
   * - '--some-modifier' // "sk-Xyz sk-Xyz--some-modifier"
   * - '__element'       // "sk-Xyz sk-Xyz__element"
   * - { '__element': true,
   *     '--modifier': true,
   *     'bootstrap-class': true
   *   }                 // "sk-Xyz sk-Xyz__element sk-Xyz--modifier bootstrap-class"
   */
  cn(...inputClassNames) {
    if (inputClassNames.length === 0) {
      return this.cn.bind(this);
    }
    if (is.string.isTemplateTagArgs(inputClassNames)) {
      return this.cn(String.raw(...inputClassNames));
    }
    if (inputClassNames.length > 1) {
      return inputClassNames.map((cn) => this.cn(cn)).join(' ');
    }
    let className = inputClassNames[0];
    if (isPlainObject(className)) {
      className = Object.keys(className).filter((el) => className[el] ? true : false);
    }
    className = Array.isArray(className) ? className.join(' ') : className || '';
    if (this.className) {
      className = className.replace(/(^| )(__|--)/g, `$1${this.className}$2`);
    }
    return className;
  }

  /**
   * Computes classNames based on passed function params, this.className and
   * className from props passed to the component.
   *
   * @return {string}
   */
  rootcn(...classNames) {
    if (is.string.isTemplateTagArgs(classNames)) {
      return this.rootcn(String.raw(...classNames));
    }
    /* eslint-disable react/prop-types */
    const className = this.cn(this.props.className, this.className, ...classNames);
    return className.trim();
    /* eslint-enable */
  }

  /**
   * Copy data from the model into state.
   * If `fieldsToInclude` is not provided only fields initialised in the component
   * state will be synced.
   * @param  {Object} model  atom model object
   * @param  {Array} fieldsToInclude  Use it to sync just selected fields
   * @return {void}
   */
  syncStateWithModel(model, fieldsToInclude = []) {
    const modelState = {};

    if (ENV === 'local') {
      if (!this.state) {
        console.warn('[DEBUG] Provide state object to your component', this); // eslint-disable-line
      }
      if (!model) {
        // eslint-disable-next-line
        console.error('[ERROR] Provide valid model to syncStateWithModel', this, fieldsToInclude);
        return;
      }
    }

    if (fieldsToInclude.length) {
      fieldsToInclude.forEach((key) => {
        modelState[key] = model.get(key);
        // treat this.state as defaults, in case model is empty
        modelState[key] = modelState[key] === undefined ? this.state[key] : modelState[key];
        syncOnModelChange(this, model, key);
      });
    } else {
      const keys = Object.keys(this.state);
      const values = model.get(keys);
      keys.forEach((key, i) => {
        modelState[key] = values[i] === undefined ? this.state[key] : values[i];
        syncOnModelChange(this, model, key);
      });
    }

    return new Promise((resolve) => {
      this.setState(modelState, resolve);
    });
  }

  /**
   * This function performs `set` on a model and validates whole form based
   * on refs from a component.
   * Additionally page is scrolled to first error occurrence.
   *
   * NOTE: We are operating on DOM elements, intead of state, because we can't
   * trust, if change event is fired (google: onChange handler not triggered by Safari's auto fill)
   *
   * Sample usage:
      // Component:
      render = () => (
        <div>
          <ValidationInput ref="form.foo" value="test value" />
          <ValidationInput ref="form.bar" value="different value" />

          <Button onClick={() => {
            // { foo: 'test value', bar: 'different value' } is saved to the model.
            // if model validation fails: proper fields are highlighted red
            // if data saves correctly: `then` is called.
            this.formValidation(
              model, 'form.'
            ).then(() => {
              console.log('success');
            });
          }} >Send</Button>
        </div>
      )
   *
   * @param  {model instance or a Promise} model
   * @param  {String} refPrefix
   * @param  {Bool} activeScroll
   * @return {Promise}
   */
  formValidation(model, refPrefix = '', activeScroll = true) {
    const done = () => {
      Object.keys(this.refs).forEach((key) => {
        if (!this.refs[key]) {
          console.warn('WARN/done:', `there is no ${key} in the form.`); // eslint-disable-line
          return;
        }

        if (this.refs[key].setValid) {
          this.refs[key].setValid(true);
        }
      });
    };
    const fail = (errors) => {
      const formDOMElements = [];
      Object.keys(errors).forEach((key) => {
        if (errors[key] && !this.refs[refPrefix + key]) {
          console.warn('WARN/fail:', `there is no ${refPrefix + key} in the form.`); // eslint-disable-line
          return;
        }
        if (errors[key] && this.refs[refPrefix + key].setValid) {
          this.refs[refPrefix + key].setValid(false, errors[key]);

          // find fields with error in the document.
          formDOMElements.push(findDOMNode(this.refs[refPrefix + key]));
        }
      });

      if (activeScroll && formDOMElements.length) {
        scrollTo(formDOMElements);
      }
    };
    const promise = is.isPromise(model)
      ? model
      : model.set(getRefValues(this, refPrefix));
    promise.then(done, fail);

    return promise;
  }

  /**
   * Shorthand for addEventListener + removeEventListener at constructor
   */
  addEventListener(...args) {
    this.__listeners.push(() => {
      removeEventListener(...args);
    });
    return addEventListener(...args);
  }

  /**
   * Shorthand for mediator.subscribe and mediator.remove
   * See: mediator documentation:
   * http://thejacklawson.com/Mediator.js/
   */
  subscribe(...args) {
    this.__listeners.push(() => {
      mediator.remove(...args);
    });
    return mediator.subscribe(...args);
  }

  /**
   * Shorthand for mediator.publish
   */
  publish(...args) {
    mediator.publish(...args);
  }

  /**
   * Shorthand for browserHistory.replace
   */
  navigate(url) {
    return navigate(url);
  }

  /**
   * Unified ref method for html nodes and react components
   * Use as react ref attribute callback:
   * <div ref={ this.createRef('myRefNameNode') }/>
   * and created reference will be stored as this.myRefNameNode in
   * your component
   */
  createRef(refName) {
    return (element) => {
      if (ENV !== 'local' || refName.endsWith('Node')) {
        this[refName] = findDOMNode(element);
      } else {
        /* eslint-disable max-len */
        throw new Error(`createRef: refName "${refName}" should end with "Node" suffix. Maybe "${refName}Node" will be a good choice?`);
        /* eslint-enable max-len */
      }
    };
  }

  pickProps(...propNames) {
    const defaultProps = {
      // make sure, that every component has unique ID
      id: `${this.className}-${this.componentId}`
    };

    return advancedPick(Object.assign(defaultProps, this.props), [
      /^data-/,
      /^aria-/,
      'id',
      'style',
      ...propNames
    ]);
  }
}
