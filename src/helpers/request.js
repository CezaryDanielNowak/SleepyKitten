import config from 'config';
import { HELP_DATA_FORM_VALIDATION_FAIL } from 'messages';
import { mediator } from 'helpers';

const superagent = global.superagent || require('superagent');

/**
 * Sometimes backend provides backend URL, e.x:
 * `/backend/view/requested/d999d94a-9e99-4e77-b127-8a1030c131cc/`
 * We had to add `url.replace('backend/', '')` in many places, so that's why
 * getBackendUrl is needed.
 * NOTE: getBackendUrl will not work correctly if backend will be moved to any other location than
 *       /backend !
 */
function getBackendUrl(url) {
  if (url.includes('://')) {
    return url;
  }
  if (url.includes('backend/')) {
    return `${config.backendURL}/${url.replace('backend/', '').replace(/^\//, '')}`;
  }
  return url;
}

// HACK: to inform front-end about XHR in progress, we have to hack superagent.
const _end = superagent.Request.prototype.end;
let openXHRCount = 0;
superagent.Request.prototype.end = function (fn) {
  mediator.publish('XHR', ++openXHRCount);
  const newFn = function (err, res) {
    const body = { data: {} };
    if (!res) {
      /* eslint-disable */
      res = { body: body, text: {}, statusCode: -1 }; // Fix for connection errors
      /* eslint-enable */
    } else if (!res.body) {
      res.body = body;
    }

    mediator.publish('XHR', --openXHRCount);
    const error_code = res.body && res.body.error_code;
    if (error_code) {
      mediator.publish('requestHelper--error', error_code);
    }

    return fn(err, res);
  };
  return _end.call(this, newFn);
};

function setAuthorizationHeader(req) {
  req.set('Authorization', 'Token :)');
}

export const authorizationAddon = (/* authorizationMethod */) => {
  // if (authorizationMethod === 'SIGNUP') {
  //   const user = require('models/user');
  //   return `?registration_token=${user.get('token')}`;
  // }
  return '';
};

export const request = (method, url, authorizationMethod) => {
  /**
   * Initialize request.
   * request('type', 'http://xxx/yyy', true) // attach Authorization ?registration_token=${user.get('token')}
   * request('type', 'http://xxx/yyy', 'SIGNUP') // attach Authorization token
   */
  const req = superagent[method](getBackendUrl(url) + authorizationAddon(authorizationMethod))
    .set('X-Requested-With', 'XMLHttpRequest') // jQuery convention
    .set('Accept', 'application/json');

  if (authorizationMethod === 'SIGNUP') {
    setAuthorizationHeader(req);
  }
  return req;
};

export const postMultipart = (url, authorizationMethod) => {
  // type: form sets Content-Type: multipart/form-data
  const req = superagent
  // type: form sets Content-Type: application/x-www-form-urlencoded
    .post(getBackendUrl(url) + authorizationAddon(authorizationMethod))
    .set('Accept', 'application/json');

  req.on('progress', (e) => {
    if (Number.isFinite(e.percent) && e.percent !== 100) {
      mediator.publish('GlobalLoader--setMessage', `Uploading... ${parseInt(e.percent, 10)}%`);
    } else {
      mediator.publish('GlobalLoader--setMessage', 'Processing...');
    }
  });

  if (authorizationMethod === 'SIGNUP') {
    setAuthorizationHeader(req);
  }

  return req;
};


export const post = (url, authorizationMethod) => {
  return request('post', url, authorizationMethod);
};

export const get = (url, authorizationMethod) => {
  return request('get', url, authorizationMethod);
};

export const del = (url, authorizationMethod) => {
  return request('del', url, authorizationMethod);
};

export const patch = (url, authorizationMethod) => {
  return request('patch', url, authorizationMethod);
};

export const head = (url, authorizationMethod) => {
  return request('head', url, authorizationMethod);
};


export const endUserErrorHandler = (err, res) => {
  const errorTitle = res.statusCode === 400 ? 'Error:' : `Error: ${res.statusText}`;
  const errorText = res.body && (res.body.data || res.body.status_message) || res.body;
  // {"status_message":"Barcode not detected.","data":null}
  mediator.publish('showHelp', {
    theme: 'error',
    title: errorTitle,
    content: errorText
  });
};

/**
 * errorHandler is meant for generic errors, that are NOT handled by developer.
 * Most of the errors should be handled by endUserErrorHandler.
 */
export const errorHandler = (err, res) => {
  try {
    const message = res.body && (res.body.data || res.body.status_message);

    if (message) {
      const validation = res.body && res.body.data && res.body.data.validation;
      if (validation) {
        mediator.publish('showHelp', HELP_DATA_FORM_VALIDATION_FAIL({
          validation,
        }));
        return;
      }

      mediator.publish('showFloatingText', {
        text: message,
        isValid: false,
      });
    } else {
      throw new Error(res);
    }
  } catch (e) {
    mediator.publish('showFloatingText', {
      text: err.toString(),
      isValid: false,
    });
  }
};

export const requestEnd = (resolve, reject, customErrorHandler = errorHandler) => {
  return (err, res) => {
    if (err) {
      // NOTE: If you want to use your own error handling,
      // invoke `requestEnd` with `customErrorHandler` set to `false`
      if (customErrorHandler) {
        customErrorHandler(err, res);
      }
      reject(res.body && (res.body.error_code || res.body.data || res.body.status_message) || err);
    } else {
      resolve(res.body.data);
    }
  };
};

const INVALID_RESPONSE_ERROR = {
  error_code: 'ERROR_CODE_NOT_PROVIDED_ERROR',
  status_message: '',
  data: {}
};
/**
 * In some cases, backend does not return proper response.
 * Proper shape of `res.body` would be:
 * `{status_message: "Text not detected", data: {attempts_left: 1}, error_code: "REQUEST_INVALID"}`
 *
 *
 * @param  {Object} err
 * @param  {Object} _res
 * @return {Object}
 */
export const sanitizeResponse = (err, _res) => {
  const res = _res || {};
  if (res.body == null) {
    res.body = {};
  }

  if (err) {
    if (typeof res.body === 'string') {
      res.body = { status_message: res.body };
    }
    res.body = { ...INVALID_RESPONSE_ERROR, ...res.body };
  }

  return res;
};

export const extendedRequestEnd = (resolve, reject) => {
  return (err, _res) => {
    const res = sanitizeResponse(err, _res);
    const {
      error_code,
      status_message,
      data,
    } = res.body;
    if (err) {
      reject({
        err,
        error_code,
        status_message: status_message || `${err}`,
        data: data || {},
        res: res,
        isCritical: res.statusCode >= 500 || res.statusCode <= 0,
      });
    } else {
      resolve(data);
    }
  };
};
