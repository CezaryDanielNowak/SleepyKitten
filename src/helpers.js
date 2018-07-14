// WARNING:
// Before writing your own helper, make sure if there is no available one on
// npm registry.

/* global FRONTEND_URL */

import React from 'react';
import _get from 'lodash/get';
import param from 'jquery-param';
import pickBy from 'lodash/pickBy';
import Mediator from 'mediator-js/lib/mediator'; // https://www.npmjs.com/package/mediator-js
import is from 'next-is';
import { browserHistory } from 'react-router';

import { createAndClickAnchor } from 'helpers/domHelper';
import { YEAR } from 'models/date';

export const mediator = is.isFunction(Mediator) ?
  new Mediator() :
  new Mediator.Mediator();
// We need a method for the request chaining to make it possible to test args
export const testSpy = (args) => args;

/**
 * Converts query stringing into object
 * @param  {string} input  "?xxx=yyy&aaa=bbb" or "#xxx=yyy&aaa=bbb"
 * @return {object}        { xxx: 'yyy', aaa: 'bbb' }
 */
export const getQuery = (input = typeof location !== 'undefined' ? location.search : '') => {
  const result = {};
  if (input.length > 2) {
    const queryArr = input.substr(1).split('&');
    for (let i = 0, len = queryArr.length; i < len; ++i) {
      const pair = queryArr[i].split('=');
      if (pair.length) {
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
  }
  return result;
};

/**
 * Builds query from the object
 * @param  {string} inputObject  { xxx: 'yyy', aaa: 'bbb' }
 * @return {string}              "xxx=yyy&aaa=bbb" or "#xxx=yyy&aaa=bbb"
 */
export const buildQuery = (inputObject) => {
  /* istanbul ignore next */
  return is.browser() ? param(inputObject, true) : '';
};

/**
 * Takes e-mail address and returns address for receiving e-mail.
 * For example: address@gmail.com returns http://gmail.com
 * @param  {string} emailAddress
 * @return {string}
 */
export const getMailboxAddress = (emailAddress) => {
  if (!is.string.isEmail(emailAddress)) {
    return '';
  }
  let domain = emailAddress.split('@')[1];

  if (domain.split('.').length === 2) { // xxx.tld, but no xxx.yyy.tld
    switch (domain) {
      case 'gmail.com':
        break;
      case 'live.com':
      case 'hotmail.com':
      case 'outlook.com':
        domain = 'mail.live.com';
        break;
      case 'wp.pl':
      case 'onet.pl':
      case 'interia.pl':
      case 'op.pl':
      case 'vp.pl':
      case 'onet.eu':
      case 'poczta.onet.pl':
        domain = `poczta.${domain}`;
        break;
      default:
        domain = `mail.${domain}`;
    }
  }

  return `https://${domain}`;
};

export const getMailboxLink = (emailAddress, linkText) => {
  const inboxAddress = getMailboxAddress(emailAddress);

  if (inboxAddress) {
    return <a href={ inboxAddress } target="_blank" rel="noopener noreferrer">{ linkText }</a>;
  }

  return linkText;
};

/**
 * cacheParam helper adds cache param to the URL.
 */
export const cacheParam = (url) => {
  return `${url}?_=${CACHE_PARAM}`;
};

export const asset = (...args) => {
  let result = typeof args[0] === 'string' && arguments.length === 1 ?
    args[0] :
    String.raw(...args);

  if (result[0] === '/') {
    result = result.substr(1);
  }

  const prefix = /^http/i.test(result) ? '' : ASSETS_URL;

  return cacheParam(`${prefix}${result}`);
};

export const getLocaleDateString = (date, locale) => {
  const formatGB = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  const formatUS = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

  const formattedDate = {
    'en-AU': formatGB,
    'en-CA': formatUS,
    'en-GB': formatGB,
    'en-IN': formatUS,
    'en-NZ': formatGB,
    'en-US': formatUS,
    'es-MX': formatGB,
  };

  return formattedDate[locale] || formattedDate['en-US'];
};

export const getDate = (timestamp) => {
  if (!timestamp) return null;
  // Avoid timezone conversion by using the constructor of Date(year, month, day)
  // for timestamp of yyyy-mm-dd, which applies zero UTC offset
  const match = timestamp.match(/(\d{4})-(\d{2})-(\d{2})/);
  let date;
  if (match) {
    const [, year, month, day] = match;
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(timestamp);
  }
  return isNaN(1 * date) ? '  /  /    ' : getLocaleDateString(date, 'en-US');
};

export const getHumanReadableTimeDiff = (fromDate, toDate = new Date()) => {
  if (!fromDate) throw new Error('First argument should be a date!');
  if (isNaN(Date.parse(fromDate))) throw new Error('The first date is not valid!');
  const timeDiff = Math.abs(toDate.getTime() - new Date(fromDate).getTime());
  const diffInMonths = Math.ceil(timeDiff / (1000 * 3600 * 24 * 30));
  if (isNaN(diffInMonths)) throw new Error('The second date is not valid!');
  if (diffInMonths > 23) {
    return `${Math.round(diffInMonths / 12)} years`;
  } else if (diffInMonths > 11) {
    return '1 year';
  } else if (diffInMonths === 1) {
    return '1 month';
  }
  return `${diffInMonths} months`;
};

/**
 * Prepare symbols dictionary from the array or arguments list.
 * from
 *   symbols('A', 'B', 'C')
 * to
 *   {
 *     A: 'A',
 *     B: 'B',
 *     C: 'C'
 *   }
 * @param  {...[String] or Array} args
 * @return {Object}
 */
export const symbols = function (...args) {
  const arr = args.length > 1 ? args : args[0];
  return arr.reduce((result, val) => {
    result[val] = val;
    return result;
  }, {});
};

export const formatPhone = (phone) => {
  const phoneParts = phone.split('-');
  return `+1 (${phoneParts[0]}) ${phoneParts[1]}-${phoneParts[2]}`;
};

// Hack for cases when few pages uses the same component. Some components does not support
// componentWillReceiveProps that causes weird behaviour on navigation.
export const cloneClass = (Proto) => {
  return class DynamicClass extends Proto {};
};

const loadScriptPoolCache = {};
/**
 * loadScriptPool is used for scripts, that does not have `onLoad` callback properly
 * implemented. It's also used when we're to lazy to read whole documentation for
 * every third party lib.
 * This helper returns the same Promise all the time, so it's safe to call
 * loadScriptPool() multiple times.
 *
 * @param  {string} scriptName Script name to check global[scriptName].
 *                             scriptName can be complex structure like 'obj.arr[12]'
 * @param  {Function} loadCode   Function that will be called once to trigger loading
 * @return {Promise} Promise object
 */
export const loadScriptPool = /* istanbul ignore next */ (scriptName, loadCode) => {
  if (!loadScriptPoolCache[scriptName]) {
    loadCode();

    let interval;
    loadScriptPoolCache[scriptName] = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // script didn't load after 90 seconds - trigger failure.
        console.error(`${scriptName} couldn't be loaded after 90 seconds.`); // eslint-disable-line
        clearInterval(interval);
        reject();
      }, 90000);
      interval = setInterval(() => { // eslint-disable-line prefer-const
        const obj = _get(global, scriptName);
        if (obj) {
          if (ENV === 'local') {
            console.info(`${scriptName} loaded by loadScriptPool.`); // eslint-disable-line
          }
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(obj);
        }
      }, 333);
    });
  }

  return loadScriptPoolCache[scriptName];
};

const cssCache = {};

export const loadCssFile = (url) => {
  if (cssCache[url]) return;
  const link = document.createElement('link');
  cssCache[url] = link;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  document.body.appendChild(link);
  return link;
};

export const ageToDate = (age) => {
  if (!age) throw new Error('No age supplied!');
  if (!Number.isFinite(age)) throw new Error('Age is not a number!');
  /* eslint-enable */
  const currentEpoch = new Date().getTime();
  const maxEpoch = currentEpoch - age * YEAR;
  const maxDate = new Date(maxEpoch);
  return [
    maxDate.getUTCFullYear(),
    `0${maxDate.getUTCMonth() + 1}`.substr(-2),
    `0${maxDate.getUTCDate()}`.substr(-2),
  ].join('-');
};

export const navigate = (url, method = 'push') => new Promise((resolve) => {
  mediator.publish(`router:navigate:${url}`, url);
  browserHistory[method](url);

  // TODO: We assume redirection is done after 120ms.
  //       Refactor it to handle proper navigation events.
  setTimeout(resolve, 120);
});

export const capitalise = (str) => str && `${
  str.trim().substr(0, 1).toUpperCase()
}${
  str.trim().substr(1).toLowerCase()
}`;

export const getFileFromBlob = ({ text, extension, name, type }) => {
  const URL = window.webkitURL || window.URL;

  const file = new Blob([text], { type });
  const fileName = `${name}.${extension}`;

  // IE11
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(file, fileName);
  } else {
    const downloadUrl = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = downloadUrl;

    // iOS, it doesn't support download and can't have the target
    if (a.download !== undefined) {
      a.download = fileName;
      if (!a.dataset) {
        a.dataset = {};
      }
      a.dataset.downloadurl = [type, a.download, a.href].join(':');
    }
    createAndClickAnchor(a);
  }
};

export const getFileFromUrl = ({ url, target = '_self' }) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = target;
  createAndClickAnchor(a);
};

export const isPromise = (...args) => {
  if (ENV === 'local') {
    // eslint-disable-next-line no-console, max-len
    console.log('WARN: Please use is.isPromise instead of helpers.isPromise. This function will be removed in 2019.');
  }
  return is.isPromise(...args);
};

export const hexToRGB = (hex, alpha = 1) => {
  if (/^#(?:[0-9a-f]{3}){1,2}$/i.test(hex)) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
};

// TODO: Replace me with a webcam.js method
export const rotateBase64Image = (base64data, degrees = 90) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'hidden-canvas');
    canvas.style.display = 'none';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.src = base64data;
    image.onload = () => {
      const w = image.width;
      const h = image.height;
      const rads = degrees * Math.PI / 180;
      let c = Math.cos(rads);
      let s = Math.sin(rads);
      if (s < 0) { s = -s; }
      if (c < 0) { c = -c; }

      // use translated width and height for new canvas
      canvas.width = h * s + w * c;
      canvas.height = h * c + w * s;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(degrees * Math.PI / 180);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      resolve(canvas.toDataURL());
      document.body.removeChild(canvas);
    };
    image.onerror = () => {
      reject('Unable to rotate image');
    };
  });
};

/**
 * Works similar to _.pick but takes Strings and RegExps
 * as second argument.
 *
 * sample usage:
 * advancedPick({ 'data-test': 1, a: 2, b: 3 }, [/^data-/, 'b'])
 *   // --> { 'data-test': 1, b: 3 }
 *
 *
 * @param  {Object} obj   Object to pick from
 * @param  {Array} paths  Array of Strings and RegExps
 * @return {Object}
 */
export const advancedPick = (obj, paths) => pickBy(
  obj, (value, name) => paths.some(
    (pathOrRegexp) => pathOrRegexp instanceof RegExp
      ? pathOrRegexp.test(name)
      : pathOrRegexp === name
  )
);
