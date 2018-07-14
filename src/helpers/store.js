import isPlainObject from 'lodash/isPlainObject';
import omitBy from 'lodash/omitBy';
import is from 'next-is';

export default (() => {
  let store = require('store');
  let storageQuota = 50000; // don't store longer strings in localStorage
  if (is.browser() && !is.localStorageSupported()) {
    storageQuota = 1900;
    // cookie fallback for Safari private browsing.
    // - please make sure to use only methods common for both: `store` and `js-cookie`
    // - please note: cookie can store up to 4KB data.
    //
    // This may not be needed anymore if this ticket is resolved:
    // https://github.com/marcuswestin/store.js/issues/156
    store = require('js-cookie');
    const _get = store.get;
    store.get = (...args) => {
      const result = _get.apply(store, args);
      // js-cookie returns string instead of object
      return result && is.string.isJSON(result) ? JSON.parse(result) : result;
    };

    store.clear = () => {
      const keys = store.get() || {};
      keys.forEach((key) => {
        try {
          store.remove(key, { path: '' });
        } catch (e) { /* empty */ }
      });
    };
  }

  // HACK: localStorage supports up to 5MB in Chrome, some browsers support 2MB
  // and some browsers can store different size each time (say hello to IE).
  // cookie can store up to 4000 bytes in Safari.
  // Disallow saving too-large strings silently when saving objects. This is
  // important because too-large property will prevent whole object from saving.
  // You can still try to save large object by passing string or array instead
  // of object.
  const _set = store.set;
  store.set = (field, value) => {
    let valueToSave = value;
    if (isPlainObject(value)) {
      valueToSave = omitBy(valueToSave, (val) => {
        return is.string(val) && val.length >= storageQuota;
      });
    }
    return _set.call(store, field, valueToSave);
  };

  return store;
})();
