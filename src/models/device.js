import { addEventListener, getWindowWidth } from 'helpers/domHelper';
import atom from 'atom-js';
import is from 'next-is';
import Webcam from 'mighty-webcamjs';

const queriesCSS = {
  $xxxsm_breakpoint: 320,
  $xxsm_breakpoint: 460,
  $xsm_breakpoint: 768,
  $sm_breakpoint: 880,
  $md_breakpoint: 1000,
  $lg_breakpoint: 1200,
  $xlg_breakpoint: 1480,
  $xxlg_breakpoint: 1680,
};

const deviceHelper = {
  /**
   * Check if window width resolves selector from _media-queries.scss
   */

  xxxsmDown: function () { return getWindowWidth() <= queriesCSS.$xxxsm_breakpoint - 1; },
  xxsmDown: function () { return getWindowWidth() <= queriesCSS.$xxsm_breakpoint - 1; },
  xsmDown: function () { return getWindowWidth() <= queriesCSS.$xsm_breakpoint - 1; },
  smDown: function () { return getWindowWidth() <= queriesCSS.$sm_breakpoint - 1; },
  mdDown: function () { return getWindowWidth() <= queriesCSS.$md_breakpoint - 1; },
  lgDown: function () { return getWindowWidth() <= queriesCSS.$lg_breakpoint - 1; },
  xlgDown: function () { return getWindowWidth() <= queriesCSS.$xlg_breakpoint - 1; },

  xxxsmUp: function () { return getWindowWidth() >= queriesCSS.$xxxsm_breakpoint; },
  xxsmUp: function () { return getWindowWidth() >= queriesCSS.$xxsm_breakpoint; },
  xsmUp: function () { return getWindowWidth() >= queriesCSS.$xsm_breakpoint; },
  smUp: function () { return getWindowWidth() >= queriesCSS.$sm_breakpoint; },
  mdUp: function () { return getWindowWidth() >= queriesCSS.$md_breakpoint; },
  lgUp: function () { return getWindowWidth() >= queriesCSS.$lg_breakpoint; },
  xlgUp: function () { return getWindowWidth() >= queriesCSS.$xlg_breakpoint; },

  windowWidth: function () { return getWindowWidth(); },

  appSupported: () => {
    return (is.userMediaSupported() || Webcam.helpers.detectFlash() || is.desktop() && is.safari());
  },

  iOSFileFallbackCameraMode: () => {
    return !deviceHelper.isCordova() && (is.iOS() && !is.userMediaSupported());
  },

  isCordova: () => {
    const ua = global.navigator && global.navigator.userAgent || '';
    return /Cordova\/NaeaApp/.test(ua);
  },
};

if (!is.browser()) {
  const sayNO = function () { return false; };
  Object.keys(deviceHelper).forEach((helperName) => {
    deviceHelper[helperName] = sayNO;
  });
}

function getDeviceState() {
  const result = {};
  Object.keys(deviceHelper).forEach((helperName) => {
    result[helperName] = deviceHelper[helperName]();
  });
  return result;
}

const model = atom(getDeviceState());

if (is.browser()) {
  addEventListener(window, 'resize', () => {
    model.set(getDeviceState());
  });
}

Object.assign(model, deviceHelper);

export default model;
