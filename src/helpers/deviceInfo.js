import is from 'next-is';
import pick from 'lodash/pick';
import webcam from 'mighty-webcamjs';

/* eslint-disable max-len, import/prefer-default-export */
const getBoolValue = (value) => value ? 'yes' : 'no';

let lastPosition;
export const getLocation = ({ timeoutMs = Infinity, force = false } = {}) => {
  return new Promise((resolve) => {
    let isResolved = false;

    if (!force && lastPosition) {
      // Some browsers like Firefox asks for access multiple times.
      // when force: false, we return last position.
      isResolved = true;
      return resolve(lastPosition);
    }

    const resolveWithUnknownPosition = () => {
      if (!isResolved) {
        resolve(lastPosition || { accuracy: 0 });
        isResolved = true;
      }
    };

    if (Number.isFinite(timeoutMs)) {
      setTimeout(resolveWithUnknownPosition, timeoutMs);
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        /* sample: {
            accuracy: 65,
            altitude: 294.4074401855469,
            altitudeAccuracy: 10,
            heading: -1,
            latitude: 43.01256284360166,
            longitude: -89.44531987692744,
            speed: -1
          }
         */
        if (!isResolved) {
          isResolved = true;
          // coords cant be serialized. JSON.stringify(coords) returns `{}`
          const coordsKeys = Object.keys(coords.constructor.prototype);
          lastPosition = pick(coords, coordsKeys);
          resolve(lastPosition);
        }
      }, resolveWithUnknownPosition);
    } else {
      resolveWithUnknownPosition();
    }
  });
};

export const gatherDeviceInformation = () => {
  if (!is.browser()) return Promise.resolve();
  const plugins = Array.from(window.navigator.plugins);

  return new Promise((resolve) => {
    try {
      const detectInputs = is.userMediaSupported()
        ? webcam.helpers.detectVideoInputs(navigator.mediaDevices)
        : Promise.resolve({});

      const deviceType = {
        desktop: is.desktop(),
        mobile: is.mobile(),
        tablet: is.tablet(),
        tv: is.tv(),
      };

      // First location request was performed before, timeout is here to make sure,
      // deviceInformation resolves in reasonable time.
      getLocation({ timeoutMs: 2500 }).then((location) => {
        detectInputs.then((videoInputs) => {
          resolve({
            'device_type': Object.keys(deviceType).find((key) => deviceType[key]),
            'browsers_useragent': window.navigator.userAgent,
            'plugins': plugins.map(({ name, description }) => description ? `${name}, ${description}` : name),
            'screen_details': `${window.screen.width}x${window.screen.height}/${window.screen.colorDepth}`,
            'is_usermedia_supported': getBoolValue(is.userMediaSupported()),
            'is_webrtc_video_recorder_supported': getBoolValue(typeof MediaRecorder !== 'undefined'),
            'detected_webrtc_video_sources': is.userMediaSupported() ? JSON.stringify(videoInputs) : 'none',
            'flash_detected': getBoolValue(webcam.detectFlash()),
            'user_location': location,
          });
        });
      });
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
      resolve(e);
    }
  });
};
